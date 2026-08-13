import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { voucherCode, action, reason } = body; // action is 'approve' or 'decline'

  if (!voucherCode || !action) {
    return NextResponse.json({ success: false, error: 'Missing voucherCode or action' }, { status: 400 });
  }

  const isApproved = action === 'approve';
  const role = session.user.roleId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const voucher = await tx.voucher.findUnique({ where: { code: voucherCode }, include: { costCode: true, assignedApprover: true } });
      if (!voucher) throw new Error('Voucher not found');

      // Check Authorization
      let isDelegated = false;
      let actualApproverName = session.user.name;

      if (voucher.assignedApproverId !== session.user.id) {
        // Check if there is an active delegation
        const activeDelegation = await tx.approvalDelegation.findFirst({
          where: {
            delegatorId: voucher.assignedApproverId!,
            delegateeId: session.user.id,
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() }
          }
        });

        if (!activeDelegation && session.user.roleId !== 'mesael') { // Mesael can override
          throw new Error('Unauthorized: You are not assigned to approve this voucher, nor are you a delegate.');
        }

        if (activeDelegation) {
          isDelegated = true;
          actualApproverName = `${session.user.name} (on behalf of ${voucher.assignedApprover?.name})`;
        }
      }

      if (isApproved) {
        // Enforce Budget vs Actual (BvA) Hard-Stop
        // Since voucher.amount is already added to committed during creation,
        // we just check if the cost code is over budget.
        if (voucher.costCode.budget < voucher.costCode.committed) {
          throw new Error(`BvA HARD STOP: Insufficient budget. Over budget by Br ${(voucher.costCode.committed - voucher.costCode.budget).toLocaleString()}`);
        }
      }

      // Update voucher status
      const updatedVoucher = await tx.voucher.update({
        where: { code: voucherCode },
        data: {
          status: isApproved ? 'approved' : 'declined',
        }
      });

      // If declined, we could reverse the committed budget
      if (!isApproved) {
        await tx.costCode.update({
          where: { id: voucher.costCodeId },
          data: { committed: { decrement: voucher.amount } }
        });
      }

      const authorityType = role === 'mesael' ? 'Owner-Reserved Authority' : 'Delegated Ceiling Authority (<= ETB 500k)';

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: isApproved ? 'APPROVE_VOUCHER' : 'DECLINE_VOUCHER',
          details: `Voucher ${voucherCode} ${isApproved ? 'approved' : 'declined'} by ${actualApproverName} (${authorityType}). Reason: ${reason || (isApproved ? 'Approved for payment release' : 'Returned to Leta')}`,
          ipAddress: '192.168.1.104',
          userId: session.user.id,
        }
      });

      return updatedVoucher;
    });

    return NextResponse.json({
      success: true,
      voucherCode,
      action: isApproved ? 'approved' : 'declined',
      role,
      message: isApproved
        ? `Voucher ${voucherCode} approved by ${session.user.name} and cleared for payment release.`
        : `Voucher ${voucherCode} returned to Leta with note requested.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !['admin', 'finance_head', 'dembi', 'ceo', 'mesael'].includes(session.user.roleId)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const vouchers = await prisma.voucher.findMany({
      where: {
        status: { in: ['approved', 'pending_release', 'released', 'paid'] }
      },
      include: {
        project: true,
        costCode: true,
        preparedBy: true,
        assignedApprover: true,
        releasedBy: true,
        bankAccount: true,
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: vouchers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !['admin', 'dembi', 'finance_head'].includes(session.user.roleId)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { voucherId, bankReference, bankAccountId } = body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const voucher = await tx.voucher.findUnique({ where: { id: voucherId } });
      if (!voucher) {
         throw new Error('Voucher not found.');
      }
      if (voucher.status !== 'approved' && voucher.status !== 'pending_release') {
         throw new Error('Voucher is not approved for release.');
      }

      if (bankAccountId) {
        const bank = await tx.bankAccount.findUnique({ where: { id: bankAccountId } });
        if (!bank) throw new Error('Bank account not found.');
        if (bank.balance < voucher.amount) throw new Error('Insufficient funds in selected bank account.');
        
        await tx.bankAccount.update({
          where: { id: bankAccountId },
          data: { balance: bank.balance - voucher.amount }
        });
      }

      const updated = await tx.voucher.update({
        where: { id: voucherId },
        data: {
          status: 'paid',
          bankReference,
          bankAccountId,
          releasedById: session.user.id
        }
      });

      await tx.auditLog.create({
        data: {
          action: 'EXECUTE_PAYMENT',
          details: `Executed payment for voucher ${voucher.code}. Bank Ref: ${bankReference}.`,
          ipAddress: '192.168.1.101',
          userId: session.user.id,
        }
      });

      return updated;
    });

    return NextResponse.json({ success: true, message: 'Payment executed successfully.', data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

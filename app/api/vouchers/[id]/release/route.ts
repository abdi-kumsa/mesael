import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.roleId !== 'kalkidan' && session.user.roleId !== 'admin')) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { bankAccountId, bankReference, chequeLeafId } = body;

  if (!bankAccountId) {
    return NextResponse.json({ success: false, message: 'Bank account is required' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const voucher = await tx.voucher.findUnique({ where: { id }, include: { costCode: true } });
      
      if (!voucher) throw new Error('Voucher not found');
      if (voucher.status !== 'approved') throw new Error('Voucher is not in an approved state');

      const bank = await tx.bankAccount.findUnique({ where: { id: bankAccountId } });
      if (!bank) throw new Error('Bank account not found');
      if (bank.balance < voucher.amount) {
        throw new Error(`Insufficient funds in ${bank.bankName}. Balance: Br ${bank.balance.toLocaleString()}`);
      }

      // Deduct from bank
      await tx.bankAccount.update({
        where: { id: bankAccountId },
        data: { balance: { decrement: voucher.amount } }
      });

      // Update Cheque Leaf if provided
      let actualBankReference = bankReference;
      if (chequeLeafId) {
        const leaf = await tx.chequeLeaf.findUnique({ where: { id: chequeLeafId } });
        if (!leaf) throw new Error('Cheque leaf not found');
        if (leaf.status !== 'BLANK') throw new Error('Cheque leaf is not blank');
        
        await tx.chequeLeaf.update({
          where: { id: chequeLeafId },
          data: {
            status: 'ISSUED',
            issuedTo: voucher.payee,
            voucherId: id
          }
        });
        actualBankReference = `CHQ-${leaf.chequeNumber}`;
      }

      if (!actualBankReference) {
        throw new Error('Bank reference or Cheque Leaf is required');
      }

      // Update voucher
      const updatedVoucher = await tx.voucher.update({
        where: { id },
        data: {
          status: 'paid',
          bankAccountId,
          bankReference: actualBankReference,
          releasedById: session.user.id
        }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: 'RELEASE_PAYMENT',
          details: `Payment released for Voucher ${voucher.code} from ${bank.bankName} (Ref: ${actualBankReference})`,
          ipAddress: '192.168.1.104',
          userId: session.user.id,
        }
      });

      return updatedVoucher;
    });

    return NextResponse.json({
      success: true,
      message: `Payment released successfully.`,
      voucher: result,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

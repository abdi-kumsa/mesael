import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


export async function GET() {
  try {
    // 1. Get Opening Balances from all bank accounts
    const bankAccounts = await prisma.bankAccount.findMany();
    const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);

    // 2. Get Committed Outflows (Approved / Pending Release Vouchers)
    const unpaidVouchers = await prisma.voucher.findMany({
      where: {
        status: { in: ['approved', 'pending_release'] }
      }
    });
    const totalCommittedOutflow = unpaidVouchers.reduce((sum, v) => sum + v.amount, 0);

    // 3. Get Expected Inflows (Approved / Partial Client Invoices)
    const unpaidInvoices = await prisma.clientInvoice.findMany({
      where: {
        status: { in: ['APPROVED', 'PARTIAL'] }
      }
    });
    const totalExpectedInflow = unpaidInvoices.reduce((sum, inv) => sum + inv.totalPayable, 0);

    // 4. Calculate Projected Position
    const projectedPosition = totalBankBalance + totalExpectedInflow - totalCommittedOutflow;

    return NextResponse.json({
      success: true,
      data: {
        totalBankBalance,
        totalCommittedOutflow,
        totalExpectedInflow,
        projectedPosition,
        bankAccounts,
      }
    });
  } catch (error) {
    console.error('Error calculating treasury position:', error);
    return NextResponse.json({ success: false, message: 'Failed to calculate treasury position' }, { status: 500 });
  }
}

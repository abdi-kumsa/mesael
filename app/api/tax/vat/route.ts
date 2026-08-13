import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    // Current Period: e.g. "August 2026"
    const period = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    // 1. Calculate Output VAT (From ClientInvoices)
    // For simplicity, we just aggregate all invoices that are not DRAFT.
    const invoices = await prisma.clientInvoice.findMany({
      where: { status: { not: 'DRAFT' } }
    });
    const totalSales = invoices.reduce((acc, inv) => acc + (inv.grossAmount || 0), 0);
    const outputVat = invoices.reduce((acc, inv) => acc + (inv.vatAmount || 0), 0);

    // 2. Calculate Input VAT (From PaymentVouchers)
    // Assume 15% VAT is claimed on all APPROVED/PAID vouchers.
    // In a real system, we'd have a flag `hasVat` on the voucher, but we'll mock the extraction ratio here.
    const vouchers = await prisma.voucher.findMany({
      where: { status: { in: ['APPROVED', 'PAID'] } }
    });
    // Let's say 80% of purchases had VAT applied
    const vatablePurchases = vouchers.reduce((acc: number, v: any) => acc + (v.amount * 0.8), 0);
    const totalPurchases = vouchers.reduce((acc: number, v: any) => acc + v.amount, 0);
    const inputVat = vatablePurchases * 0.15;

    const netVatPayable = outputVat - inputVat;

    const declaration = {
      period,
      tin: '0012345678',
      totalSales,
      totalPurchases,
      outputVat,
      inputVat,
      netVatPayable,
      dueDate: 'Due 30th',
      isReviewed: false
    };

    return NextResponse.json({ success: true, data: declaration });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

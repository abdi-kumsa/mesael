import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const receipts = await prisma.taxReceipt.findMany({
      include: {
        invoice: { include: { contract: { include: { client: true, project: true } } } },
        issuedBy: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = receipts.map(r => ({
      id: r.id,
      receiptNumber: r.receiptNumber,
      invoiceCode: r.invoice.code,
      clientName: r.invoice.contract.client.legalName,
      projectCode: r.invoice.contract.project.code,
      totalPayable: r.invoice.totalPayable,
      issuedBy: r.issuedBy.name,
      dispatchedAt: r.dispatchedAt ? r.dispatchedAt.toISOString().split('T')[0] : null,
      custodyTracker: r.custodyTracker,
      createdAt: r.createdAt.toISOString().split('T')[0]
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { invoiceId, receiptNumber, custodyTracker } = await request.json();

    const invoice = await prisma.clientInvoice.findUnique({
      where: { id: invoiceId }
    });

    if (!invoice) return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });

    const newReceipt = await prisma.$transaction(async (tx) => {
      const receipt = await tx.taxReceipt.create({
        data: {
          invoiceId,
          receiptNumber,
          custodyTracker,
          dispatchedAt: custodyTracker ? new Date() : null,
          issuedById: session.user.id
        }
      });

      await tx.clientInvoice.update({
        where: { id: invoiceId },
        data: { status: 'RECEIPTED' }
      });

      return receipt;
    });

    return NextResponse.json({
      success: true,
      message: `Tax Receipt ${receiptNumber} logged.`,
      data: newReceipt
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

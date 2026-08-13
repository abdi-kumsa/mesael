import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const collections = await prisma.collection.findMany({
      include: {
        invoice: { include: { contract: { include: { client: true, project: true } } } },
        loggedBy: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = collections.map(c => ({
      id: c.id,
      invoiceCode: c.invoice.code,
      clientName: c.invoice.contract.client.legalName,
      projectCode: c.invoice.contract.project.code,
      amountReceived: c.amountReceived,
      withholdingSuffered: c.withholdingSuffered,
      totalCredit: c.amountReceived + c.withholdingSuffered,
      bankReference: c.bankReference,
      loggedBy: c.loggedBy.name,
      createdAt: c.createdAt.toISOString().split('T')[0]
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
    const { invoiceId, amountReceived, withholdingSuffered, bankReference } = await request.json();

    const invoice = await prisma.clientInvoice.findUnique({
      where: { id: invoiceId },
      include: { collections: true }
    });

    if (!invoice) return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });

    const numAmount = Number(amountReceived);
    const numWithholding = Number(withholdingSuffered);
    const credit = numAmount + numWithholding;

    const priorCollected = invoice.collections.reduce((sum, c) => sum + c.amountReceived + c.withholdingSuffered, 0);
    const newTotal = priorCollected + credit;

    const newStatus = newTotal >= invoice.totalPayable - 0.01 ? 'COLLECTED' : 'PARTIAL_COLLECTED';

    const newCollection = await prisma.$transaction(async (tx) => {
      const collection = await tx.collection.create({
        data: {
          invoiceId,
          amountReceived: numAmount,
          withholdingSuffered: numWithholding,
          bankReference,
          loggedById: session.user.id
        }
      });

      await tx.clientInvoice.update({
        where: { id: invoiceId },
        data: { status: newStatus }
      });

      return collection;
    });

    return NextResponse.json({
      success: true,
      message: `Collection logged. Invoice is now ${newStatus}.`,
      data: newCollection
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

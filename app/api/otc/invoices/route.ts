import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const invoices = await prisma.clientInvoice.findMany({
      include: {
        contract: { include: { client: true, project: true } },
        taxReceipts: true,
        collections: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = invoices.map(inv => {
      const collected = inv.collections.reduce((sum, c) => sum + c.amountReceived + c.withholdingSuffered, 0);
      const balance = inv.totalPayable - collected;

      return {
        id: inv.id,
        code: inv.code,
        status: inv.status,
        clientName: inv.contract.client.legalName,
        projectCode: inv.contract.project.code,
        milestoneName: inv.milestoneName,
        grossAmount: inv.grossAmount,
        advanceDeduction: inv.advanceDeduction,
        retentionDeduction: inv.retentionDeduction,
        netAmount: inv.netAmount,
        vatAmount: inv.vatAmount,
        totalPayable: inv.totalPayable,
        collectedAmount: collected,
        balanceAmount: balance,
        receiptIssued: inv.taxReceipts.length > 0,
        createdAt: inv.createdAt.toISOString().split('T')[0]
      };
    });

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { contractId, milestoneName, grossAmount } = await request.json();
    const numGross = Number(grossAmount);

    const contract = await prisma.clientContract.findUnique({
      where: { id: contractId },
      include: { invoices: true }
    });

    if (!contract) return NextResponse.json({ success: false, message: 'Contract not found' }, { status: 404 });

    const generatedCode = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const advanceDeduction = numGross * (contract.advancePercent / 100);
    const retentionDeduction = numGross * (contract.retentionPercent / 100);
    const netAmount = numGross - advanceDeduction - retentionDeduction;
    const vatAmount = netAmount * 0.15; // 15% VAT on Net Amount
    const totalPayable = netAmount + vatAmount;

    const newInvoice = await prisma.clientInvoice.create({
      data: {
        code: generatedCode,
        contractId,
        milestoneName,
        grossAmount: numGross,
        advanceDeduction,
        retentionDeduction,
        netAmount,
        vatAmount,
        totalPayable,
        preparedById: session.user.id
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_CLIENT_INVOICE',
        details: `Generated ${generatedCode} for ${milestoneName}. Total Payable: Br ${totalPayable.toLocaleString()}`,
        ipAddress: '192.168.1.104',
        userId: session.user.id,
      }
    });

    return NextResponse.json({
      success: true,
      message: `Invoice ${generatedCode} raised successfully.`,
      data: newInvoice
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

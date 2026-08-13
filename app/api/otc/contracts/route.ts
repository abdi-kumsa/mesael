import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const contracts = await prisma.clientContract.findMany({
      include: {
        client: true,
        project: true,
        invoices: {
          include: { collections: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = contracts.map(c => {
      const grossInvoiced = c.invoices.reduce((sum, inv) => sum + inv.grossAmount, 0);
      const netInvoiced = c.invoices.reduce((sum, inv) => sum + inv.netAmount, 0);
      const vatInvoiced = c.invoices.reduce((sum, inv) => sum + inv.vatAmount, 0);
      
      const totalCollected = c.invoices.reduce((sum, inv) => 
        sum + inv.collections.reduce((cSum, col) => cSum + col.amountReceived + col.withholdingSuffered, 0)
      , 0);

      const advanceRecovered = c.invoices.reduce((sum, inv) => sum + inv.advanceDeduction, 0);
      const retentionWithheld = c.invoices.reduce((sum, inv) => sum + inv.retentionDeduction, 0);

      return {
        id: c.id,
        code: c.code,
        status: c.status,
        clientName: c.client.legalName,
        projectCode: c.project.code,
        projectName: c.project.name,
        contractValue: c.contractValue,
        advancePercent: c.advancePercent,
        retentionPercent: c.retentionPercent,
        grossInvoiced,
        netInvoiced,
        vatInvoiced,
        totalCollected,
        advanceRecovered,
        retentionWithheld,
        createdAt: c.createdAt.toISOString().split('T')[0]
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
    const { clientId, projectId, contractValue, advancePercent, retentionPercent, newClientName, newClientTin } = await request.json();

    let finalClientId = clientId;

    if (!clientId && newClientName && newClientTin) {
      const newClient = await prisma.client.create({
        data: { legalName: newClientName, tin: newClientTin }
      });
      finalClientId = newClient.id;
    }

    if (!finalClientId || !projectId || !contractValue) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const generatedCode = `CON-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newContract = await prisma.clientContract.create({
      data: {
        code: generatedCode,
        clientId: finalClientId,
        projectId,
        contractValue: Number(contractValue),
        advancePercent: Number(advancePercent),
        retentionPercent: Number(retentionPercent),
        preparedById: session.user.id
      },
      include: { client: true }
    });

    return NextResponse.json({
      success: true,
      message: `Contract ${generatedCode} for ${newContract.client.legalName} created.`,
      data: newContract
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const ipcs = await prisma.paymentCertificate.findMany({
      where: { subcontractId: id },
      include: {
        certifiedBy: true,
        vouchers: true,
      },
      orderBy: { cycleNumber: 'asc' },
    });

    const mapped = ipcs.map((ipc: any) => ({
      id: ipc.id,
      code: ipc.code,
      status: ipc.status,
      cycleNumber: ipc.cycleNumber,
      grossAmount: ipc.grossAmount,
      advanceDeduction: ipc.advanceDeduction,
      retentionDeduction: ipc.retentionDeduction,
      netAmount: ipc.netAmount,
      certifiedBy: ipc.certifiedBy.name,
      createdAt: ipc.createdAt.toISOString().split('T')[0],
      voucherCode: ipc.vouchers.length > 0 ? ipc.vouchers[0].code : null,
      voucherStatus: ipc.vouchers.length > 0 ? ipc.vouchers[0].status : null,
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { grossAmount } = body;
    const numGross = Number(grossAmount);

    const subcontract = await prisma.subcontract.findUnique({
      where: { id },
      include: { ipcs: true }
    });

    if (!subcontract) {
      return NextResponse.json({ success: false, message: 'Subcontract not found' }, { status: 404 });
    }

    const nextCycle = subcontract.ipcs.length + 1;
    const generatedCode = `IPC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const totalAdvanceRecovered = subcontract.ipcs.reduce((sum: number, ipc: any) => sum + ipc.advanceDeduction, 0);
    const unrecoveredAdvance = subcontract.advancePaid - totalAdvanceRecovered;

    const calculatedAdvanceDeduction = numGross * (subcontract.advancePercent / 100);
    const advanceDeduction = Math.min(calculatedAdvanceDeduction, unrecoveredAdvance);
    
    const retentionDeduction = numGross * (subcontract.retentionPercent / 100);
    
    const netAmount = numGross - advanceDeduction - retentionDeduction;

    const result = await prisma.$transaction(async (tx) => {
      const newIpc = await tx.paymentCertificate.create({
        data: {
          code: generatedCode,
          subcontractId: id,
          cycleNumber: nextCycle,
          grossAmount: numGross,
          advanceDeduction,
          retentionDeduction,
          netAmount,
          certifiedById: session.user.id,
        }
      });

      await tx.auditLog.create({
        data: {
          action: 'CREATE_IPC',
          details: `Generated ${generatedCode} (Cycle ${nextCycle}) for Subcontract ${subcontract.code}. Gross: Br ${numGross.toLocaleString()}, Net: Br ${netAmount.toLocaleString()}`,
          ipAddress: '192.168.1.104',
          userId: session.user.id,
        }
      });

      return newIpc;
    });

    return NextResponse.json({
      success: true,
      message: `IPC ${generatedCode} generated successfully. Deductions applied.`,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

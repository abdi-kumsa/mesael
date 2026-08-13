import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const subcontracts = await prisma.subcontract.findMany({
      include: {
        vendor: true,
        project: true,
        costCode: true,
        preparedBy: true,
        ipcs: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = subcontracts.map(s => {
      const certifiedWork = s.ipcs.reduce((acc, ipc) => acc + ipc.grossAmount, 0);
      const totalRetention = s.ipcs.reduce((acc, ipc) => acc + ipc.retentionDeduction, 0);
      const totalAdvanceRecovered = s.ipcs.reduce((acc, ipc) => acc + ipc.advanceDeduction, 0);
      const netPaidOut = s.ipcs.reduce((acc, ipc) => acc + ipc.netAmount, 0);
      
      return {
        id: s.id,
        code: s.code,
        status: s.status,
        vendorName: s.vendor.legalName,
        projectCode: s.project.code,
        costCode: s.costCode.code,
        contractValue: s.contractValue,
        advancePercent: s.advancePercent,
        retentionPercent: s.retentionPercent,
        advancePaid: s.advancePaid,
        certifiedWork,
        totalRetention,
        totalAdvanceRecovered,
        unrecoveredAdvance: s.advancePaid - totalAdvanceRecovered,
        netPaidOut,
        createdAt: s.createdAt.toISOString().split('T')[0],
        ipcs: s.ipcs || [],
      };
    });

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { vendorId, projectId, costCodeId, contractValue, advancePercent, retentionPercent, advancePaid } = body;

    const generatedCode = `SUB-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSubcontract = await prisma.subcontract.create({
      data: {
        code: generatedCode,
        vendorId,
        projectId,
        costCodeId,
        contractValue: Number(contractValue),
        advancePercent: Number(advancePercent),
        retentionPercent: Number(retentionPercent),
        advancePaid: Number(advancePaid) || 0,
        preparedById: session.user.id,
      }
    });

    return NextResponse.json({
      success: true,
      message: `Subcontract ${generatedCode} registered successfully.`,
      data: newSubcontract,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

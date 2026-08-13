import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';


export async function GET() {
  try {
    const recs = await prisma.bankReconciliation.findMany({
      include: { account: true, reconciler: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: recs });
  } catch (error) {
    console.error('Error fetching reconciliations:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch reconciliations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { accountId, periodEnd, statementBal, systemBal } = body;

    const variance = parseFloat(statementBal) - parseFloat(systemBal);

    const rec = await prisma.bankReconciliation.create({
      data: {
        accountId,
        periodEnd: new Date(periodEnd),
        statementBal: parseFloat(statementBal),
        systemBal: parseFloat(systemBal),
        variance,
        status: variance === 0 ? 'RECONCILED' : 'DRAFT',
        reconciledById: user.id,
      },
    });

    return NextResponse.json({ success: true, data: rec });
  } catch (error) {
    console.error('Error creating reconciliation:', error);
    return NextResponse.json({ success: false, message: 'Failed to create reconciliation' }, { status: 500 });
  }
}

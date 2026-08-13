import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const journals = await prisma.journalEntry.findMany({
      include: {
        lines: {
          include: { account: true, project: true }
        },
        preparedBy: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: journals });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { description, lines } = await request.json();

    if (!description || !lines || lines.length < 2) {
      return NextResponse.json({ success: false, message: 'Invalid journal structure' }, { status: 400 });
    }

    // Verify balancing
    let totalDebit = 0;
    let totalCredit = 0;
    for (const line of lines) {
      totalDebit += (line.debit || 0);
      totalCredit += (line.credit || 0);
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json({ success: false, message: 'Debits and Credits must balance' }, { status: 400 });
    }

    const code = `JV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const newJournal = await prisma.journalEntry.create({
      data: {
        code,
        description,
        preparedById: session.user.id,
        lines: {
          create: lines.map((l: any) => ({
            accountId: l.accountId,
            projectId: l.projectId || null,
            debit: l.debit || 0,
            credit: l.credit || 0
          }))
        }
      },
      include: { lines: true }
    });

    return NextResponse.json({
      success: true,
      message: `Journal ${code} posted successfully.`,
      data: newJournal
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

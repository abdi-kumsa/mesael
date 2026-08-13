import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  // Fetch the project PRJ-CMC since Kalkidan is site admin for CMC.
  let dbProject = await prisma.project.findFirst({ where: { name: { contains: 'CMC' } } });
  if (!dbProject) dbProject = await prisma.project.findFirst();

  const txs = await prisma.pettyCashTransaction.findMany({
    where: { projectId: dbProject!.id },
    orderBy: { date: 'desc' },
    include: { loggedBy: true },
    take: 50,
  });

  return NextResponse.json({ success: true, data: txs });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { description, amount, type, receiptAttached } = body;

  let dbProject = await prisma.project.findFirst({ where: { name: { contains: 'CMC' } } });
  if (!dbProject) dbProject = await prisma.project.findFirst();

  const numAmount = Number(amount) || 0;

  try {
    const newTx = await prisma.$transaction(async (tx) => {
      // Find latest transaction to get current balance
      const latest = await tx.pettyCashTransaction.findFirst({
        where: { projectId: dbProject!.id },
        orderBy: { date: 'desc' }
      });

      const currentBalance = latest?.balance || 0;
      const newBalance = type === 'IN' ? currentBalance + numAmount : currentBalance - numAmount;

      return await tx.pettyCashTransaction.create({
        data: {
          description,
          amount: numAmount,
          type,
          balance: newBalance,
          receiptAttached,
          projectId: dbProject!.id,
          loggedById: session.user.id
        }
      });
    });

    return NextResponse.json({ success: true, data: newTx });
  } catch (error: any) {
    console.error('Petty Cash Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to log transaction' }, { status: 500 });
  }
}

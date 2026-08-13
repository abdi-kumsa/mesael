import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';


export async function GET() {
  try {
    const txs = await prisma.ownerTransaction.findMany({
      include: { classifier: true },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ success: true, data: txs });
  } catch (error) {
    console.error('Error fetching owner transactions:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch owner transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { type, amount, description, date } = body;

    const tx = await prisma.ownerTransaction.create({
      data: {
        type,
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        classifiedById: user.id,
      },
    });

    return NextResponse.json({ success: true, data: tx });
  } catch (error) {
    console.error('Error creating owner transaction:', error);
    return NextResponse.json({ success: false, message: 'Failed to create owner transaction' }, { status: 500 });
  }
}

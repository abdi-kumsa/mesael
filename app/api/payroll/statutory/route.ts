import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';


export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const liabilities = await prisma.statutoryLiability.findMany({
      orderBy: { dueDate: 'asc' }
    });
    return NextResponse.json({ success: true, data: liabilities });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch statutory liabilities' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { liabilityId, paymentRef } = body;

    const liability = await prisma.statutoryLiability.update({
      where: { id: liabilityId },
      data: {
        status: 'PAID',
        paymentRef,
        clearedById: session.user.id
      }
    });

    return NextResponse.json({ success: true, data: liability });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to settle liability' }, { status: 500 });
  }
}

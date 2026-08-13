import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.roleId !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const delegations = await prisma.approvalDelegation.findMany({
      include: {
        delegator: true,
        delegatee: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: delegations });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch delegations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.roleId !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { delegatorId, delegateeId, startDate, endDate } = body;

    const delegation = await prisma.approvalDelegation.create({
      data: {
        delegatorId,
        delegateeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true
      }
    });

    return NextResponse.json({ success: true, data: delegation });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create delegation' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.roleId !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, isActive } = body;

    const delegation = await prisma.approvalDelegation.update({
      where: { id },
      data: { isActive }
    });

    return NextResponse.json({ success: true, data: delegation });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update delegation' }, { status: 500 });
  }
}

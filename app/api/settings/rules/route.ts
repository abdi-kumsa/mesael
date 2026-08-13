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

    const rules = await prisma.approvalRule.findMany({
      orderBy: { maxAmount: 'asc' }
    });
    return NextResponse.json({ success: true, data: rules });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch rules' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.roleId !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { roleId, maxAmount, escalationRoleId } = body;

    const rule = await prisma.approvalRule.upsert({
      where: { roleId },
      update: { maxAmount: parseFloat(maxAmount), escalationRoleId },
      create: { roleId, maxAmount: parseFloat(maxAmount), escalationRoleId }
    });

    return NextResponse.json({ success: true, data: rule });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to save rule' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const requisitions = await prisma.purchaseRequisition.findMany({
      include: {
        project: true,
        costCode: true,
        preparedBy: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: requisitions });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { projectId, costCodeId, description, items } = body;

    // Generate unique PR code
    const count = await prisma.purchaseRequisition.count();
    const code = `PR-2026-${String(count + 1).padStart(4, '0')}`;

    const requisition = await prisma.purchaseRequisition.create({
      data: {
        code,
        description,
        status: 'PENDING',
        projectId,
        costCodeId,
        preparedById: session.user.id,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: Number(item.quantity),
            unit: item.unit
          }))
        }
      },
      include: {
        items: true,
        project: true,
        costCode: true,
      }
    });

    return NextResponse.json({ success: true, data: requisition });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

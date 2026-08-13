import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: {
        requisition: {
          include: { project: true, costCode: true }
        },
        supplier: true,
        preparedBy: true,
        items: true,
        grns: true
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { requisitionId, supplierId, items } = body;

    const requisition = await prisma.purchaseRequisition.findUnique({
      where: { id: requisitionId }
    });

    if (!requisition) {
      return NextResponse.json({ success: false, message: 'Requisition not found' }, { status: 404 });
    }

    const count = await prisma.purchaseOrder.count();
    const code = `PO-2026-${String(count + 1).padStart(4, '0')}`;

    const totalAmount = items.reduce((sum: number, item: any) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);

    const result = await prisma.$transaction(async (tx) => {
      // Create PO
      const order = await tx.purchaseOrder.create({
        data: {
          code,
          status: 'ISSUED',
          requisitionId,
          supplierId,
          preparedById: session.user.id,
          items: {
            create: items.map((item: any) => ({
              description: item.description,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
              unit: item.unit
            }))
          }
        },
        include: { items: true, supplier: true, requisition: true }
      });

      // Update PR status
      await tx.purchaseRequisition.update({
        where: { id: requisitionId },
        data: { status: 'ORDERED' }
      });

      // Register Commitment (Increase CostCode committed amount)
      await tx.costCode.update({
        where: { id: requisition.costCodeId },
        data: {
          committed: { increment: totalAmount }
        }
      });

      // Log it
      await tx.auditLog.create({
        data: {
          action: 'CREATE_PO',
          details: `Created Purchase Order ${code} against Requisition ${requisition.code} for total Br ${totalAmount}`,
          ipAddress: '192.168.1.101',
          userId: session.user.id,
        }
      });

      return order;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

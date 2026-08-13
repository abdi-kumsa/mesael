import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const grns = await prisma.goodsReceivingNote.findMany({
      include: {
        order: { include: { supplier: true, requisition: { include: { project: true } } } },
        receivedBy: true,
        items: { include: { orderItem: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: grns });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { orderId, items } = body;

    const count = await prisma.goodsReceivingNote.count();
    const code = `GRN-2026-${String(count + 1).padStart(4, '0')}`;

    const result = await prisma.$transaction(async (tx) => {
      const grn = await tx.goodsReceivingNote.create({
        data: {
          code,
          orderId,
          receivedById: session.user.id,
          items: {
            create: items.map((item: any) => ({
              orderItemId: item.orderItemId,
              quantityReceived: Number(item.quantityReceived),
              condition: item.condition || 'GOOD'
            }))
          }
        },
        include: { items: true, order: true }
      });

      // Update PO Status (naively checking if anything received sets it to RECEIVED for now)
      // A more robust check would compare total PO quantity vs sum(GRN quantity)
      await tx.purchaseOrder.update({
        where: { id: orderId },
        data: { status: 'RECEIVED' }
      });

      return grn;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

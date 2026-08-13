import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


export async function GET() {
  try {
    const chequeBooks = await prisma.chequeBook.findMany({
      include: {
        bankAccount: true,
        leaves: {
          orderBy: { chequeNumber: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: chequeBooks });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bankAccountId, startNumber, endNumber } = body;

    if (!bankAccountId || !startNumber || !endNumber) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const start = parseInt(startNumber, 10);
    const end = parseInt(endNumber, 10);

    if (isNaN(start) || isNaN(end) || start > end) {
      return NextResponse.json({ success: false, message: 'Invalid start/end numbers' }, { status: 400 });
    }

    // Number formatting: keep leading zeros based on startNumber length
    const padLength = startNumber.length;

    const result = await prisma.$transaction(async (tx) => {
      const chequeBook = await tx.chequeBook.create({
        data: {
          bankAccountId,
          startNumber,
          endNumber,
        }
      });

      const leaves = [];
      for (let i = start; i <= end; i++) {
        leaves.push({
          chequeBookId: chequeBook.id,
          chequeNumber: i.toString().padStart(padLength, '0'),
          status: 'BLANK'
        });
      }

      await tx.chequeLeaf.createMany({ data: leaves });

      return await tx.chequeBook.findUnique({
        where: { id: chequeBook.id },
        include: { leaves: true }
      });
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

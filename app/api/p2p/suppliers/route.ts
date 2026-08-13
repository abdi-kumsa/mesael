import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { legalName: 'asc' },
    });
    return NextResponse.json({ success: true, data: suppliers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { legalName, tin, vatStatus, bankDetails } = body;

    const supplier = await prisma.supplier.create({
      data: {
        legalName,
        tin,
        vatStatus,
        bankDetails: bankDetails ? JSON.stringify(bankDetails) : null,
      }
    });

    return NextResponse.json({ success: true, data: supplier });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

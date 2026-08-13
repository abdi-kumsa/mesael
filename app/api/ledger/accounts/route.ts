import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const accounts = await prisma.chartOfAccount.findMany({
      orderBy: { code: 'asc' }
    });

    return NextResponse.json({ success: true, data: accounts });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { code, name, type } = await request.json();

    if (!code || !name || !type) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const newAccount = await prisma.chartOfAccount.create({
      data: { code, name, type }
    });

    return NextResponse.json({
      success: true,
      message: `Account ${code} created.`,
      data: newAccount
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

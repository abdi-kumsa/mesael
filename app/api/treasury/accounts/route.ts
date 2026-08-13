import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const accounts = await prisma.bankAccount.findMany({
      orderBy: { bankName: 'asc' },
    });
    return NextResponse.json({ success: true, data: accounts });
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch bank accounts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bankName, accountName, accountNumber, currency, purpose, signatories, mandateRule, initialBalance } = body;

    const account = await prisma.bankAccount.create({
      data: {
        bankName,
        accountName,
        accountNumber,
        currency: currency || 'ETB',
        purpose,
        signatories,
        mandateRule,
        balance: parseFloat(initialBalance) || 0,
      },
    });

    return NextResponse.json({ success: true, data: account });
  } catch (error) {
    console.error('Error creating bank account:', error);
    return NextResponse.json({ success: false, message: 'Failed to create bank account' }, { status: 500 });
  }
}

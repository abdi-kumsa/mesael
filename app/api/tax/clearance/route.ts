import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const certificates = await prisma.complianceCertificate.findMany({
      orderBy: { expiryDate: 'asc' }
    });

    return NextResponse.json({ success: true, data: certificates });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { type, issueDate, expiryDate } = await request.json();

    if (!type || !issueDate) {
      return NextResponse.json({ success: false, message: 'Type and Issue Date are required.' }, { status: 400 });
    }

    const newCert = await prisma.complianceCertificate.create({
      data: {
        type,
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      }
    });

    return NextResponse.json({
      success: true,
      message: `Certificate ${type} logged successfully.`,
      data: newCert
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

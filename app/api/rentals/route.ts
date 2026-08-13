import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rentals = await prisma.rentalAgreement.findMany({
      include: { project: true, hourLogs: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: rentals });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !['admin', 'finance_head', 'operational_finance', 'ceo'].includes(session.user.roleId)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { equipmentName, vendorName, hourlyRate, advancePaid, projectId } = body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const newRental = await tx.rentalAgreement.create({
        data: {
          equipmentName,
          vendorName,
          hourlyRate: parseFloat(hourlyRate),
          advancePaid: parseFloat(advancePaid),
          projectId,
        }
      });

      await tx.auditLog.create({
        data: {
          action: 'CREATE_RENTAL_AGREEMENT',
          details: `Created rental agreement for ${equipmentName} with vendor ${vendorName}.`,
          ipAddress: '192.168.1.101',
          userId: session.user.id,
        }
      });

      return newRental;
    });

    return NextResponse.json({ success: true, message: 'Rental agreement created successfully.', data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { logDate, hoursWorked } = body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create the log
      const newLog = await tx.rentalHourLog.create({
        data: {
          rentalAgreementId: id,
          logDate: new Date(logDate),
          hoursWorked: parseFloat(hoursWorked),
          certifiedById: session.user.id,
        }
      });

      // Update the agreement's total hours
      const agreement = await tx.rentalAgreement.update({
        where: { id },
        data: {
          totalHoursBilled: {
            increment: parseFloat(hoursWorked)
          }
        }
      });

      await tx.auditLog.create({
        data: {
          action: 'LOG_RENTAL_HOURS',
          details: `User logged ${hoursWorked} hours for rental agreement ${id}.`,
          ipAddress: '192.168.1.101', // Ideally from headers, mocked here
          userId: session.user.id,
        }
      });

      return newLog;
    });

    return NextResponse.json({ success: true, message: 'Hours logged successfully.', data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

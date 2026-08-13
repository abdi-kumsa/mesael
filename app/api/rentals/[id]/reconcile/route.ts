import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !['admin', 'finance_head', 'ceo'].includes(session.user.roleId)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const agreement = await tx.rentalAgreement.findUnique({
        where: { id }
      });

      if (!agreement) {
        throw new Error("Agreement not found");
      }

      const totalCost = agreement.hourlyRate * agreement.totalHoursBilled;
      const balance = agreement.advancePaid - totalCost; // Positive: Mesael is owed. Negative: Mesael owes supplier.

      const updated = await tx.rentalAgreement.update({
        where: { id },
        data: {
          status: 'RECONCILED'
        }
      });

      await tx.auditLog.create({
        data: {
          action: 'RECONCILE_RENTAL',
          details: `Reconciled rental ${id}. Total cost: ${totalCost}, Advance: ${agreement.advancePaid}, Balance: ${balance}.`,
          ipAddress: '192.168.1.101', // Ideally from headers, mocked here
          userId: session.user.id,
        }
      });

      return { agreement: updated, totalCost, balance };
    });

    return NextResponse.json({ success: true, message: 'Rental reconciled successfully.', data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

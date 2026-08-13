import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'ceo', 'mesael'].includes(session.user.roleId)) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Only CEO can approve payroll.' }, { status: 401 });
    }

    const body = await request.json();
    const { runId } = body;

    const run = await prisma.payrollRun.findUnique({
      where: { id: runId }
    });

    if (!run || run.status !== 'DRAFT') {
      return NextResponse.json({ success: false, message: 'Invalid run or already approved.' }, { status: 400 });
    }

    // 1. Lock Payroll, Create Liabilities, Create Voucher
    await prisma.$transaction(async (tx) => {
      // Approve Run
      await tx.payrollRun.update({
        where: { id: runId },
        data: {
          status: 'LOCKED',
          approvedById: session.user.id
        }
      });

      const nextMonth = new Date(run.periodYear, run.periodMonth, 15); // e.g. Due 15th of next month

      // Create Tax Liability
      if (run.totalTax > 0) {
        await tx.statutoryLiability.create({
          data: {
            type: 'INCOME_TAX',
            periodMonth: run.periodMonth,
            periodYear: run.periodYear,
            amount: run.totalTax,
            dueDate: nextMonth
          }
        });
      }

      // Create Pension Liability
      if (run.totalPension > 0) {
        await tx.statutoryLiability.create({
          data: {
            type: 'PENSION',
            periodMonth: run.periodMonth,
            periodYear: run.periodYear,
            amount: run.totalPension,
            dueDate: nextMonth
          }
        });
      }

      // Determine a dummy cost code and project for the bulk voucher just to satisfy DB constraints
      const firstProject = await tx.project.findFirst();
      const firstCostCode = await tx.costCode.findFirst();

      if (firstProject && firstCostCode) {
        // Create Bulk Net Pay Voucher
        await tx.voucher.create({
          data: {
            code: `PAY-${run.periodYear}-${run.periodMonth}-${Math.floor(Math.random()*1000)}`,
            title: `Net Pay for Period ${run.periodMonth}/${run.periodYear}`,
            amount: run.totalNet,
            payee: 'Multiple Employees (Bank File)',
            method: 'Bank Transfer',
            status: 'approved', // Bypass to execution queue
            projectId: firstProject.id,
            costCodeId: firstCostCode.id,
            preparedById: session.user.id,
            assignedApproverId: session.user.id,
          }
        });
      }
    });

    return NextResponse.json({ success: true, message: 'Payroll Approved and Locked.' });
  } catch (error) {
    console.error('Error approving payroll:', error);
    return NextResponse.json({ success: false, message: 'Failed to approve payroll' }, { status: 500 });
  }
}

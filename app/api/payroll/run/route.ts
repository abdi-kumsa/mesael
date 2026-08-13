import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

function calculateTax(gross: number) {
  if (gross <= 600) return 0;
  if (gross <= 1650) return (gross * 0.10) - 60;
  if (gross <= 3200) return (gross * 0.15) - 142.5;
  if (gross <= 5250) return (gross * 0.20) - 302.5;
  if (gross <= 7800) return (gross * 0.25) - 565;
  if (gross <= 10900) return (gross * 0.30) - 955;
  return (gross * 0.35) - 1500;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const runs = await prisma.payrollRun.findMany({
      include: {
        payslips: {
          include: { employee: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: runs });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch payroll runs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'dembi', 'ceo', 'finance_head', 'mesael'].includes(session.user.roleId)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { month, year } = body;

    // 1. Get active employees
    const employees = await prisma.employee.findMany({
      where: { status: 'ACTIVE' }
    });

    if (employees.length === 0) {
      return NextResponse.json({ success: false, message: 'No active employees to process.' }, { status: 400 });
    }

    // Check if run already exists
    const existingRun = await prisma.payrollRun.findFirst({
      where: { periodMonth: parseInt(month), periodYear: parseInt(year) }
    });
    
    if (existingRun && existingRun.status !== 'DRAFT') {
      return NextResponse.json({ success: false, message: 'Payroll for this period is already processed.' }, { status: 400 });
    }

    if (existingRun) {
      // Delete old draft
      await prisma.payrollRun.delete({ where: { id: existingRun.id } });
    }

    let totalGross = 0;
    let totalNet = 0;
    let totalTax = 0;
    let totalPension = 0;
    const payslipsData: any[] = [];

    // 2. Compute per employee
    for (const emp of employees) {
      // Simplification: In a real app we'd aggregate their Timesheets to adjust basic salary
      // For FIN-PAY MVP, we'll assume they worked the full month if active, and just add Overtime.
      
      const timesheets = await prisma.timesheet.findMany({
        where: {
          employeeId: emp.id,
          status: 'CERTIFIED',
          date: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0)
          }
        }
      });

      const totalOvertime = timesheets.reduce((sum, t) => sum + t.overtimeHours, 0);
      const overtimePay = totalOvertime * (emp.basicSalary / 160) * 1.5; // Roughly 1.5x hourly rate assuming 160h/month

      const taxableAllowance = emp.housingAllowance;
      const nonTaxableAllowance = emp.transportAllowance; // Transport is often non-taxable up to a limit
      
      const taxableGross = emp.basicSalary + taxableAllowance + overtimePay;
      const incomeTax = calculateTax(taxableGross);
      
      // Pension is usually on basic salary only
      const employeePension = emp.basicSalary * 0.07;
      const employerPension = emp.basicSalary * 0.11;

      const gross = taxableGross + nonTaxableAllowance;
      const netPay = gross - incomeTax - employeePension;

      payslipsData.push({
        employeeId: emp.id,
        basic: emp.basicSalary,
        taxableAllowance: taxableAllowance + overtimePay,
        nonTaxableAllowance,
        gross,
        incomeTax,
        employeePension,
        employerPension,
        netPay
      });

      totalGross += gross;
      totalNet += netPay;
      totalTax += incomeTax;
      totalPension += (employeePension + employerPension);
    }

    // 3. Save to DB
    const run = await prisma.payrollRun.create({
      data: {
        periodMonth: parseInt(month),
        periodYear: parseInt(year),
        status: 'DRAFT',
        totalGross,
        totalNet,
        totalTax,
        totalPension,
        payslips: {
          create: payslipsData
        }
      },
      include: {
        payslips: { include: { employee: true } }
      }
    });

    return NextResponse.json({ success: true, data: run });
  } catch (error) {
    console.error('Error running payroll:', error);
    return NextResponse.json({ success: false, message: 'Failed to run payroll' }, { status: 500 });
  }
}

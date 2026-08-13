import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';


export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const employees = await prisma.employee.findMany({
      include: { project: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'dembi', 'ceo'].includes(session.user.roleId)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, tin, pensionNumber, bankName, bankAccount, type, basicSalary, transportAllowance, housingAllowance, defaultProjectId } = body;

    const employee = await prisma.employee.create({
      data: {
        name,
        tin,
        pensionNumber,
        bankName,
        bankAccount,
        type,
        basicSalary: parseFloat(basicSalary),
        transportAllowance: parseFloat(transportAllowance || 0),
        housingAllowance: parseFloat(housingAllowance || 0),
        defaultProjectId: defaultProjectId || null,
      },
    });

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ success: false, message: 'Failed to create employee' }, { status: 500 });
  }
}

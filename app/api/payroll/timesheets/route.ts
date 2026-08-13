import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let whereClause = {};
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      whereClause = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const timesheets = await prisma.timesheet.findMany({
      where: whereClause,
      include: { employee: true, project: true },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ success: true, data: timesheets });
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch timesheets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { employeeId, projectId, date, hoursWorked, overtimeHours } = body;

    const ts = await prisma.timesheet.create({
      data: {
        employeeId,
        projectId,
        date: new Date(date),
        hoursWorked: parseFloat(hoursWorked),
        overtimeHours: parseFloat(overtimeHours || 0),
        status: 'CERTIFIED', // Skipping draft for simplicity
        certifiedById: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: ts });
  } catch (error) {
    console.error('Error creating timesheet:', error);
    return NextResponse.json({ success: false, message: 'Failed to create timesheet' }, { status: 500 });
  }
}

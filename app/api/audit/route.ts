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
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: true,
      }
    });

    // Map to frontend format
    const mapped = logs.map(log => ({
      id: log.id,
      timestamp: log.createdAt.toISOString(),
      user: log.user.name,
      role: log.user.title,
      action: log.action,
      details: log.details,
      ipAddress: log.ipAddress,
    }));

    return NextResponse.json({ success: true, count: mapped.length, data: mapped });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

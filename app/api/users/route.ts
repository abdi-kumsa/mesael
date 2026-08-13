import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.roleId !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const mappedUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.roleId,
      status: 'Active',
    }));

    return NextResponse.json({ success: true, data: mappedUsers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.roleId !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, email, role } = body;

  try {
    // Generate initials for avatar
    const avatar = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
    const hashedPassword = await bcrypt.hash('1234', 10);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          roleId: role,
          title: role, // simplified for demo
          avatar,
          password: hashedPassword,
        }
      });

      await tx.auditLog.create({
        data: {
          action: 'PROVISION_USER',
          details: `Admin provisioned new user ${name} with role ${role}.`,
          ipAddress: '192.168.1.101',
          userId: session.user.id,
        }
      });

      return newUser;
    });

    return NextResponse.json({ success: true, message: `User ${name} provisioned successfully.`, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.roleId !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, role } = body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: { roleId: role, title: role }
      });

      await tx.auditLog.create({
        data: {
          action: 'UPDATE_USER_ROLE',
          details: `Admin updated access for ${updatedUser.name} to role ${role}.`,
          ipAddress: '192.168.1.101',
          userId: session.user.id,
        }
      });

      return updatedUser;
    });

    return NextResponse.json({ success: true, message: `Updated access for ${result.name}.`, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

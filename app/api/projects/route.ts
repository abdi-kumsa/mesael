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
    const projects = await prisma.project.findMany({
      include: {
        costCodes: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const mappedProjects = projects.map(p => {
      const budget = p.costCodes.reduce((acc, cc) => acc + cc.budget, 0);
      const committed = p.costCodes.reduce((acc, cc) => acc + cc.committed, 0);

      return {
        id: p.id,
        code: p.code,
        name: p.name,
        client: p.client,
        budget,
        committed,
        status: p.status,
        costCodes: p.costCodes,
      };
    });

    return NextResponse.json({ success: true, data: mappedProjects });
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
  const { name, client, budget } = body;

  try {
    const generatedCode = `PRJ-${Math.floor(100 + Math.random() * 900)}`;

    const result = await prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          name,
          client,
          code: generatedCode,
          status: 'ACTIVE',
        }
      });

      if (budget > 0) {
        await tx.costCode.create({
          data: {
            code: `CC-${Math.floor(1000 + Math.random() * 9000)}`,
            name: 'Initial General Budget',
            projectId: newProject.id,
            budget: Number(budget),
            committed: 0,
          }
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'INITIATE_PROJECT',
          details: `Admin initialized project ${name} (${generatedCode}) for client ${client}.`,
          ipAddress: '192.168.1.101',
          userId: session.user.id,
        }
      });

      return newProject;
    });

    return NextResponse.json({ success: true, message: `Project ${name} initialized successfully.`, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

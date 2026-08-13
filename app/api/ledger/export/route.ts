import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const lines = await prisma.ledgerLine.findMany({
      include: {
        journal: true,
        account: true,
        project: true
      },
      orderBy: { journal: { date: 'asc' } }
    });

    if (lines.length === 0) {
      return new NextResponse('No data to export', { status: 400 });
    }

    // CSV Header: Date, Reference, Description, AccountCode, AccountName, Debit, Credit, ProjectCode
    let csv = 'Date,Reference,Description,AccountCode,AccountName,Debit,Credit,ProjectCode\n';

    lines.forEach(l => {
      const date = l.journal.date.toISOString().split('T')[0];
      const ref = l.journal.code;
      const desc = `"${l.journal.description.replace(/"/g, '""')}"`;
      const code = l.account.code;
      const name = `"${l.account.name.replace(/"/g, '""')}"`;
      const dr = l.debit;
      const cr = l.credit;
      const proj = l.project?.code || '';

      csv += `${date},${ref},${desc},${code},${name},${dr},${cr},${proj}\n`;
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="peachtree_export.csv"'
      }
    });

  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}

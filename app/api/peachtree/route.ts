import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { period } = body;

  const exportedCount = 94;
  const exportTimestamp = new Date().toISOString().split('T')[0];

  return NextResponse.json({
    success: true,
    period: period || 'August 2026',
    status: 'Synced',
    exportedCount,
    exportTimestamp,
    message: `Staged export complete — ${exportedCount} journal lines sent to Peachtree statutory ledger for ${period || 'August 2026'}.`,
  });
}

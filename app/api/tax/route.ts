import { NextResponse } from 'next/server';
import { INITIAL_TAX_DECLARATION } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json({
    success: true,
    declaration: INITIAL_TAX_DECLARATION,
    taxRates: {
      vat: '15%',
      withholding: '2%',
      employmentTax: '10–35%',
      pension: '7% (Employee) / 11% (Employer)',
    },
    clearances: [
      { name: 'Tax clearance certificate — 2026', expires: '17 Aug 2026', status: 'Expires in 11 days', alertType: 'bad' },
      { name: 'Contractor licence renewal', expires: '02 Jan 2027', status: 'Current', alertType: 'good' },
      { name: 'VAT registration certificate', expires: 'No expiry', status: 'Current', alertType: 'good' },
    ],
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action } = body;

  if (action === 'mark_reviewed') {
    return NextResponse.json({
      success: true,
      declaration: {
        ...INITIAL_TAX_DECLARATION,
        isReviewed: true,
      },
      message: 'July 2026 VAT declaration marked as reviewed and ready for online ERCA submission.',
    });
  }

  return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  // Get project (fallback to first if none specified, but for demo we will just take the first one PRJ-BOLE)
  const project = await prisma.project.findFirst({
    include: {
      costCodes: {
        include: {
          vouchers: true
        }
      },
      clientContracts: {
        include: {
          invoices: true
        }
      }
    }
  });

  if (!project) {
    return NextResponse.json({ success: false, message: 'No project found' }, { status: 404 });
  }

  // 1. Calculate Cost Metrics per Cost Code
  const costCodes = project.costCodes.map((cc) => {
    const actual = cc.vouchers
      .filter((v) => v.status === 'paid' || v.status === 'approved')
      .reduce((sum, v) => sum + v.amount, 0);
    
    // The 'committed' field in DB includes everything approved/created (which later becomes paid).
    // So current open commitments = DB committed - actual.
    const committed = Math.max(0, cc.committed - actual);
    const variance = cc.budget - (committed + actual);

    return {
      id: cc.id,
      code: cc.code,
      name: cc.name,
      budget: cc.budget,
      committed,
      actual,
      variance,
      percentUsed: cc.budget > 0 ? ((committed + actual) / cc.budget) * 100 : 0
    };
  });

  const costTotals = costCodes.reduce(
    (acc, cc) => {
      acc.budget += cc.budget;
      acc.committed += cc.committed;
      acc.actual += cc.actual;
      return acc;
    },
    { budget: 0, committed: 0, actual: 0 }
  );

  const forecastFinalCost = Math.max(costTotals.budget, costTotals.committed + costTotals.actual);

  // 2. Calculate Revenue Metrics
  // Sum up all contract values for the project
  const forecastFinalRevenue = project.clientContracts.reduce((sum, c) => sum + c.contractValue, 0);
  
  // Sum up all approved/issued invoices for certified revenue
  const certifiedRevenue = project.clientContracts.reduce((sum, c) => {
    const invoicesSum = c.invoices
      .filter((inv) => inv.status !== 'DRAFT')
      .reduce((invAcc, inv) => invAcc + (inv.grossAmount || 0), 0);
    return sum + invoicesSum;
  }, 0);

  // 3. Calculate Profitability Metrics
  const forecastMargin = forecastFinalRevenue - forecastFinalCost;
  const forecastMarginPercent = forecastFinalRevenue > 0 ? (forecastMargin / forecastFinalRevenue) * 100 : 0;
  
  // Target Margin is typically around 15-20% in construction. Let's assume a baseline 15% target margin
  const targetMarginPercent = 15;
  const varianceToTarget = forecastMarginPercent - targetMarginPercent;

  return NextResponse.json({
    success: true,
    data: {
      project: {
        code: project.code,
        name: project.name,
        client: project.client,
      },
      totals: {
        ...costTotals,
        variance: costTotals.budget - (costTotals.committed + costTotals.actual),
        percentUsed: costTotals.budget > 0 ? ((costTotals.committed + costTotals.actual) / costTotals.budget) * 100 : 0,
        forecastFinalCost,
      },
      revenue: {
        forecastFinalRevenue,
        certifiedRevenue,
      },
      profitability: {
        forecastMargin,
        forecastMarginPercent,
        targetMarginPercent,
        varianceToTarget
      },
      costCodes,
    }
  });
}

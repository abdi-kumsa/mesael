import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const roleId = session.user.roleId;

  let whereClause: any = {};

  if (status && status !== 'all') {
    whereClause.status = status;
  }

  // Dynamic Rule Lookup
  let roleRule = await prisma.approvalRule.findUnique({ where: { roleId } });
  
  if (roleId === 'dembi') {
    const threshold = roleRule?.maxAmount || 500000;
    whereClause.OR = [
      { amount: { lte: threshold } },
      { status: 'owner_reserved' },
    ];
  } else if (roleId === 'mesael') {
    // Mesael usually has a rule or no limit, but he escalated from dembi
    const dembiRule = await prisma.approvalRule.findUnique({ where: { roleId: 'dembi' } });
    const threshold = dembiRule?.maxAmount || 500000;
    whereClause.OR = [
      { status: 'owner_reserved' },
      { amount: { gt: threshold } },
    ];
  }

  const vouchersData = await prisma.voucher.findMany({
    where: whereClause,
    include: {
      project: true,
      costCode: true,
      preparedBy: true,
      assignedApprover: true,
      attachments: {
        where: { isActive: true },
        orderBy: { version: 'desc' }
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const mapped = vouchersData.map((v) => {
    // Legacy support
    const legacyDocs = v.docsAttached ? JSON.parse(v.docsAttached) : {};
    const legacyDocsCount = Object.values(legacyDocs).filter(Boolean).length;
    
    // New attachments
    const attachments = v.attachments || [];
    
    // Fallback if no actual files exist but legacy does
    const docsCount = attachments.length > 0 ? attachments.length : legacyDocsCount;

    return {
      id: v.id,
      code: v.code,
      title: v.title,
      project: v.project?.name || 'Unknown Project',
      costCode: `${v.costCode?.code} · ${v.costCode?.name}`,
      payee: v.payee,
      amount: v.amount,
      method: v.method,
      status: v.status,
      preparedBy: v.preparedBy?.name || 'Unknown',
      assignedApprover: v.assignedApprover?.roleId || 'dembi',
      docsCount,
      totalDocsRequired: v.purchaseOrderId ? 1 : 4,
      docsAttached: attachments.length > 0 ? {} : legacyDocs, // hide legacy if new exists
      attachments: attachments,
      purchaseOrderId: v.purchaseOrderId,
      budgetBefore: (v.costCode?.budget || 0) - (v.costCode?.committed || 0) + v.amount, 
      budgetAfter: (v.costCode?.budget || 0) - (v.costCode?.committed || 0), 
      date: v.createdAt.toISOString().split('T')[0],
    };
  });

  return NextResponse.json({ success: true, count: mapped.length, data: mapped });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, projectId, costCodeId, payee, amount, method, purchaseOrderId, docsAttached, attachments } = body;

  const numAmount = Number(amount) || 0;
  
  // Phase 2: Dynamic threshold logic
  const dembiRule = await prisma.approvalRule.findUnique({ where: { roleId: 'dembi' } });
  const threshold = dembiRule?.maxAmount || 500000;
  
  const isOwnerReserved = numAmount > threshold || payee.toLowerCase().includes('subcontractor');

  // Fallback if not provided (for older clients)
  let finalProjectId = projectId;
  let finalCostCodeId = costCodeId;
  
  if (!finalProjectId) {
    const dbProject = await prisma.project.findFirst();
    finalProjectId = dbProject?.id;
  }
  if (!finalCostCodeId) {
    const dbCostCode = await prisma.costCode.findFirst();
    finalCostCodeId = dbCostCode?.id;
  }

  let approver = await prisma.user.findFirst({ where: { roleId: isOwnerReserved ? 'mesael' : 'dembi' } });

  const generatedCode = `PV-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  // Determine doc count (legacy or new)
  const legacyDocsCount = Object.values(docsAttached || {}).filter(Boolean).length;
  const newDocsCount = Array.isArray(attachments) ? attachments.length : 0;
  const totalDocsCount = newDocsCount > 0 ? newDocsCount : legacyDocsCount;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create voucher
      const newVoucher = await tx.voucher.create({
        data: {
          code: generatedCode,
          title: title || `${payee} — ${finalProjectId!}`,
          amount: numAmount,
          payee,
          method: method || 'RTGS',
          status: (purchaseOrderId ? totalDocsCount < 1 : totalDocsCount < 4) ? 'pending_docs' : isOwnerReserved ? 'owner_reserved' : 'ready_for_approval',
          projectId: finalProjectId!,
          costCodeId: finalCostCodeId!,
          preparedById: session.user.id,
          assignedApproverId: approver?.id,
          purchaseOrderId: purchaseOrderId || null,
          docsAttached: JSON.stringify(docsAttached || {}),
          attachments: Array.isArray(attachments) && attachments.length > 0 ? {
            create: attachments.map((a: any) => ({
              fileName: a.fileName,
              url: a.url,
              type: a.type
            }))
          } : undefined
        },
        include: { attachments: true }
      });

      // Update committed cost
      const isDocsComplete = purchaseOrderId ? totalDocsCount >= 1 : totalDocsCount >= 4;
      if (isDocsComplete && !purchaseOrderId) {
         await tx.costCode.update({
           where: { id: finalCostCodeId! },
           data: { committed: { increment: numAmount } }
         });
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: 'CREATE_VOUCHER',
          details: `Created Payment Voucher ${generatedCode} for Br ${numAmount.toLocaleString()} payable to ${payee}`,
          ipAddress: '192.168.1.104',
          userId: session.user.id,
        }
      });

      return newVoucher;
    });

    return NextResponse.json({
      success: true,
      message: (purchaseOrderId ? totalDocsCount >= 1 : totalDocsCount >= 4)
        ? `Voucher ${result.code} created and routed to ${isOwnerReserved ? 'Mesael (Owner)' : 'Dembi (DGM)'}.`
        : `Voucher ${result.code} saved as draft (Docs pending).`,
      voucher: result,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

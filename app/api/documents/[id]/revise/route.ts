import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id: documentId } = await params;
  const body = await request.json();
  const { newUrl, newFileName } = body;

  if (!newUrl || !newFileName) {
    return NextResponse.json({ success: false, message: 'New file URL and name are required' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const oldDoc = await tx.documentAttachment.findUnique({ where: { id: documentId } });
      
      if (!oldDoc) throw new Error('Document not found');
      if (!oldDoc.isActive) throw new Error('Cannot revise an inactive document version');

      // Deactivate old doc
      await tx.documentAttachment.update({
        where: { id: oldDoc.id },
        data: { isActive: false }
      });

      // Create new doc version
      const newDoc = await tx.documentAttachment.create({
        data: {
          voucherId: oldDoc.voucherId,
          type: oldDoc.type,
          url: newUrl,
          fileName: newFileName,
          version: oldDoc.version + 1,
          previousVersionId: oldDoc.id,
          isActive: true,
        }
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          action: 'REVISE_DOCUMENT',
          details: `Uploaded new version (v${newDoc.version}) for ${oldDoc.type} on voucher ${oldDoc.voucherId}`,
          ipAddress: '192.168.1.104',
          userId: session.user.id,
        }
      });

      return newDoc;
    });

    return NextResponse.json({
      success: true,
      message: `Document revised to version ${result.version}`,
      document: result,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

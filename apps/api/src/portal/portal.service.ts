import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentsService } from '../documents/documents.service';
import { OrdersService } from '../orders/orders.service';
import { DocType } from '@trusttax/database';

@Injectable()
export class PortalService {
  constructor(
    private prisma: PrismaService,
    private documentsService: DocumentsService,
    private ordersService: OrdersService,
  ) {}

  private hashToken(rawToken: string) {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  async getDocumentRequestByToken(rawToken: string) {
    if (!rawToken || rawToken.trim().length < 10) {
      throw new BadRequestException('Invalid token');
    }
    const tokenHash = this.hashToken(rawToken.trim());

    const tokenRow = await (this.prisma as any).portalAccessToken.findUnique({
      where: { tokenHash },
    });

    if (!tokenRow) throw new NotFoundException('Token not found');
    if (tokenRow.usedAt) throw new BadRequestException('Token already used');
    if (new Date(tokenRow.expiresAt).getTime() < Date.now()) {
      throw new BadRequestException('Token expired');
    }
    if (tokenRow.purpose !== 'DOCUMENT_REQUEST' || !tokenRow.approvalId) {
      throw new BadRequestException('Invalid token purpose');
    }

    const approval = await this.prisma.orderApproval.findUnique({
      where: { id: tokenRow.approvalId },
      include: {
        order: { select: { id: true, displayId: true, userId: true } },
      },
    });
    if (!approval) throw new NotFoundException('Request not found');
    if (approval.type !== 'DOCUMENT_REQUEST')
      throw new NotFoundException('Request not found');
    if (approval.order.userId !== tokenRow.userId) {
      throw new BadRequestException('Token mismatch');
    }

    let message: string | undefined;
    let docType: DocType | undefined;
    try {
      const parsed = approval.description ? JSON.parse(approval.description) : {};
      message = parsed?.message || undefined;
      docType = parsed?.docType || undefined;
    } catch {
      // ignore
    }

    return {
      approvalId: approval.id,
      orderId: approval.order.id,
      orderDisplayId: approval.order.displayId,
      documentName: approval.title,
      message,
      docType: docType || DocType.OTHER,
      expiresAt: tokenRow.expiresAt,
    };
  }

  async uploadForDocumentRequest(rawToken: string, file: Express.Multer.File) {
    const meta = await this.getDocumentRequestByToken(rawToken);
    const tokenHash = this.hashToken(rawToken.trim());

    // Upload document encrypted using existing flow (avoid trusting any client input)
    const tokenRow = await (this.prisma as any).portalAccessToken.findUnique({
      where: { tokenHash },
    });
    if (!tokenRow) throw new NotFoundException('Token not found');

    const uploaded = await this.documentsService.uploadDocument(
      tokenRow.userId,
      file,
      {
        title: meta.documentName,
        type: meta.docType,
        orderId: meta.orderId,
      } as any,
    );

    // Mark approval complete (links document to order if needed)
    await this.ordersService.completeDocumentRequest(
      tokenRow.userId,
      meta.approvalId,
      uploaded.id,
    );

    // Mark token as used
    await (this.prisma as any).portalAccessToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    });

    return { success: true, documentId: uploaded.id };
  }
}


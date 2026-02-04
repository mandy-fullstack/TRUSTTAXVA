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
  ) { }

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

    // NEW: Fetch ALL pending document requests for this order
    const allPendingRequests = await this.prisma.orderApproval.findMany({
      where: {
        orderId: approval.orderId,
        type: 'DOCUMENT_REQUEST',
        status: 'PENDING',
      },
      orderBy: { createdAt: 'asc' },
    });

    const requests = allPendingRequests.map((req: any) => {
      let message: string | undefined;
      let docType: DocType | undefined;
      try {
        const parsed = req.description ? JSON.parse(req.description) : {};
        message = parsed?.message || undefined;
        docType = parsed?.docType || undefined;
      } catch {
        // ignore
      }
      return {
        id: req.id,
        documentName: req.title,
        message,
        docType: docType || DocType.OTHER,
      };
    });

    return {
      orderId: approval.order.id,
      orderDisplayId: approval.order.displayId,
      expiresAt: tokenRow.expiresAt,
      requests, // Return array
    };
  }

  async uploadForDocumentRequest(
    rawToken: string,
    file: Express.Multer.File,
    approvalId?: string
  ) {
    const meta = await this.getDocumentRequestByToken(rawToken);
    const tokenHash = this.hashToken(rawToken.trim());

    // Validate the specific approval ID if provided
    let targetRequest: { id: string; documentName: string; docType: DocType; orderId?: string } | undefined;

    if (approvalId) {
      targetRequest = meta.requests.find((r: any) => r.id === approvalId);
      if (!targetRequest) throw new BadRequestException("Invalid request ID for this order");
    } else if (meta.requests.length === 1) {
      targetRequest = meta.requests[0];
    } else {
      // Default to the first one if not specified, but this is risky for bulk. 
      // Ideally client MUST send approvalId if multiple exist.
      // For backward compat (if client doesn't send it yet), we pick the first?
      targetRequest = meta.requests[0];
    }

    if (!targetRequest) throw new BadRequestException("No pending requests found");

    const tokenRow = await (this.prisma as any).portalAccessToken.findUnique({
      where: { tokenHash },
    });
    if (!tokenRow) throw new NotFoundException('Token not found');

    const uploaded = await this.documentsService.uploadDocument(
      tokenRow.userId,
      file,
      {
        title: targetRequest.documentName,
        type: targetRequest.docType,
        orderId: meta.orderId,
      } as any,
    );

    // Mark approval complete
    await this.ordersService.completeDocumentRequest(
      tokenRow.userId,
      targetRequest.id,
      uploaded.id,
    );

    // Check if there are ANY other pending requests for this order
    const remaining = await this.prisma.orderApproval.count({
      where: {
        orderId: meta.orderId,
        type: 'DOCUMENT_REQUEST',
        status: 'PENDING',
      },
    });

    if (remaining === 0) {
      // Mark token as used only if ALL are done
      await (this.prisma as any).portalAccessToken.update({
        where: { tokenHash },
        data: { usedAt: new Date() },
      });
    }

    return { success: true, documentId: uploaded.id };
  }
}


import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Professional Audit Service
 * Records security-sensitive events in the AuditLog table for compliance and security.
 */
@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) { }

  /**
   * Log a security-sensitive action
   */
  async log(params: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    details?: any;
    ipAddress?: string;
  }) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          details: params.details || {},
          ipAddress: params.ipAddress,
        },
      });
    } catch (error) {
      // Silently fail to avoid blocking main application logic,
      // but log to console for debugging.
      console.error('[AuditService] Failed to create audit log:', error);
    }
  }

  /**
   * Special helper for decryption events
   */
  async logDecryption(params: {
    userId: string;
    field: string;
    entity: string;
    entityId: string;
    reason?: string;
    ipAddress?: string;
  }) {
    return this.log({
      ...params,
      action: 'DECRYPT_SENSITIVE_DATA',
      details: {
        field: params.field,
        reason: params.reason || 'Requested view via UI',
        timestamp: new Date().toISOString(),
      },
    });
  }
}

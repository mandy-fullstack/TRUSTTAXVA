import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prisma, ExtendedPrismaClient } from '@trusttax/database';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  // Expose the extended client
  public readonly client: ExtendedPrismaClient = prisma;

  // Make it easy to access the user model directly if needed, or just use .client
  get user() {
    return this.client.user;
  }

  get service() {
    return this.client.service;
  }

  get order() {
    return this.client.order;
  }

  get invoice() {
    return this.client.invoice;
  }

  get taxReturn() {
    return this.client.taxReturn;
  }

  get orderStepProgress() {
    return (this.client as any).orderStepProgress;
  }

  get orderTimeline() {
    return (this.client as any).orderTimeline;
  }

  get orderApproval() {
    return (this.client as any).orderApproval;
  }

  get conversation() {
    return (this.client as any).conversation;
  }

  get message() {
    return (this.client as any).message;
  }

  get serviceReview() {
    return (this.client as any).serviceReview;
  }

  get fAQ() {
    return (this.client as any).fAQ;
  }

  get document() {
    return (this.client as any).document;
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}

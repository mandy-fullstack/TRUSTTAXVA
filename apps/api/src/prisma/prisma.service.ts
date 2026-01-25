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

    get serviceReview() {
        return (this.client as any).serviceReview;
    }

    async onModuleInit() {
        await this.client.$connect();
    }

    async onModuleDestroy() {
        await this.client.$disconnect();
    }
}

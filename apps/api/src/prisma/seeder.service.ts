
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
    private readonly logger = new Logger(SeederService.name);

    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        await this.seedAdmin();
    }

    async seedAdmin() {
        const email = 'admin@trusttax.com';
        const password = 'admin'; // Change in production

        try {
            const existingAdmin = await this.prisma.client.user.findUnique({ where: { email } });
            if (!existingAdmin) {
                const hashedPassword = await bcrypt.hash(password, 10);
                await this.prisma.client.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        role: 'ADMIN',
                        name: 'System Admin',
                    },
                });
                this.logger.log(`✅ Admin user created: ${email}`);
            } else {
                this.logger.log('ℹ️ Admin user already exists');
            }
        } catch (error) {
            this.logger.error('❌ Seeding failed:', error);
        }
    }
}

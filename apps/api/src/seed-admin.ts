
import { PrismaClient } from '@trusttax/database';
import * as bcrypt from 'bcrypt';

async function seed() {
    const prisma = new PrismaClient();
    const email = 'admin@trusttax.com';
    const password = 'admin'; // Change in production

    try {
        const existingAdmin = await prisma.user.findUnique({ where: { email } });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: 'ADMIN',
                    name: 'System Admin',
                },
            });
            console.log('✅ Admin user created: admin@trusttax.com / admin');
        } else {
            console.log('ℹ️ Admin user already exists');
        }
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();

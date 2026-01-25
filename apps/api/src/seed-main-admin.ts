import { PrismaClient } from '@trusttax/database';
import * as bcrypt from 'bcrypt';

async function seedMainAdmin() {
    const prisma = new PrismaClient();
    const email = 'applex.mandy@gmail.com';
    const password = 'Applex99*';
    const name = 'Mandy - Admin Principal';

    try {
        console.log('🌱 Creating main admin user...');

        const existingAdmin = await prisma.user.findUnique({ where: { email } });

        if (existingAdmin) {
            console.log('ℹ️  Admin user already exists. Updating password...');
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    role: 'ADMIN',
                    name,
                },
            });
            console.log('✅ Admin user updated successfully');
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: 'ADMIN',
                    name,
                },
            });
            console.log('✅ Main admin user created successfully');
        }

        console.log('');
        console.log('📧 Email: applex.mandy@gmail.com');
        console.log('🔐 Password: Applex99*');
        console.log('👤 Role: ADMIN');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedMainAdmin();

import { PrismaClient } from '@trusttax/database';
import * as bcrypt from 'bcrypt';

async function seedMainAdmin() {
    const email = process.env.SEED_MAIN_ADMIN_EMAIL;
    const password = process.env.SEED_MAIN_ADMIN_PASSWORD;

    if (!email || !password) {
        console.error('❌ Set SEED_MAIN_ADMIN_EMAIL and SEED_MAIN_ADMIN_PASSWORD in .env to run this seed.');
        process.exit(1);
    }

    const prisma = new PrismaClient();
    const name = process.env.SEED_MAIN_ADMIN_NAME || 'Admin Principal';

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
        console.log('📧 Email:', email);
        console.log('👤 Role: ADMIN');
        console.log('🔐 Password: (configurada en .env)');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedMainAdmin();

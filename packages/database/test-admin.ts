import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true, email: true, name: true }
    });

    console.log('Admins found:', JSON.stringify(admins, null, 2));

    if (admins.length > 0) {
        const email = admins[0].email;
        const password = 'Password123!';
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        console.log(`Updated password for ${email} to ${password}`);
    } else {
        console.log('No admins found.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

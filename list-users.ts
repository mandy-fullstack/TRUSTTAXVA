
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        take: 10,
        select: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            lastName: true,
        }
    });
    console.log(JSON.stringify(users, null, 2));
    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});

import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const emails = ['applex.mandy@gmail.com', 'loveforever.mandyanita@gmail.com'];

    console.log('Checking roles in database...');

    for (const email of emails) {
        const users = await prisma.user.findMany({
            where: {
                email: {
                    contains: email.toLowerCase(),
                    mode: 'insensitive',
                }
            }
        });

        if (users.length === 0) {
            console.log(`❌ No user found with email: ${email}`);
        } else {
            users.forEach((user: any) => {
                console.log(`✅ Found user: ${user.email} | Role: ${user.role} | PIN Enabled: ${user.pinEnabled} | Has PIN Hash: ${!!user.pinHash}`);
            });
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

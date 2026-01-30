import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- PROFILE COMPLETION AUDIT ---');

    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            ssnEncrypted: true,
            termsAcceptedAt: true,
            profileCompleted: true,
        }
    });

    users.forEach(user => {
        const checks = {
            firstName: !!user.firstName,
            lastName: !!user.lastName,
            ssnEncrypted: !!user.ssnEncrypted,
            termsAcceptedAt: !!user.termsAcceptedAt,
        };
        const isCalculatedComplete = Object.values(checks).every(v => v);

        console.log(`User: ${user.email}`);
        console.log(`- DB profileCompleted: ${user.profileCompleted}`);
        console.log(`- Calculated Complete: ${isCalculatedComplete}`);
        console.log(`- Missing fields: ${Object.entries(checks).filter(([_, v]) => !v).map(([k]) => k).join(', ') || 'None'}`);
        console.log('----------------------------');
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

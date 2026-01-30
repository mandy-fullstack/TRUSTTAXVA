import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- USER ROLE AUDIT ---');

    // Count by role
    const roleStats = await prisma.user.groupBy({
        by: ['role'],
        _count: {
            id: true
        }
    });

    console.log('User counts by role:');
    roleStats.forEach(stat => {
        console.log(`- ${stat.role}: ${stat._count.id}`);
    });

    // List all users to see if any look "lost"
    const allUsers = await prisma.user.findMany({
        select: {
            email: true,
            role: true,
            firstName: true,
            lastName: true,
            createdAt: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    console.log('\nDetailed User List (Last 50):');
    allUsers.slice(0, 50).forEach(u => {
        console.log(`[${u.role}] ${u.email} - ${u.firstName || ''} ${u.lastName || ''} (${u.createdAt.toISOString()})`);
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


import { prisma } from '@trusttax/database';

async function main() {
    console.log('Connecting to Prisma...');
    // prisma is already instantiated in the package
    console.log('Connected to instance.');

    try {
        // 1. Find a user who has orders
        const user = await prisma.user.findFirst({
            where: {
                orders: {
                    some: {}
                }
            }
        });
        if (!user) {
            console.log('No users found.');
            return;
        }
        console.log(`Testing for user: ${user.email} (${user.id})`);

        // 2. Run the query
        console.log('Running findAllByUser query...');
        const orders = await prisma.order.findMany({
            where: { userId: user.id },
            include: {
                service: true,
                approvals: {
                    where: { status: 'PENDING' }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        console.log(`Success! Found ${orders.length} orders.`);
        console.log(JSON.stringify(orders, null, 2));

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

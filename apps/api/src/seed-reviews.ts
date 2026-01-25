import { PrismaClient } from '@trusttax/database';

const prisma = new PrismaClient();

async function seedReviews() {
    console.log('🌱 Seeding reviews...');

    const services = await prisma.service.findMany();

    if (services.length === 0) {
        console.log('❌ No services found. Please run seed-services first.');
        return;
    }

    const reviewTemplates = [
        { author: 'Maria Garcia', rating: 5, text: 'Exceptional service! The team was professional and thorough. My tax return was completed ahead of schedule.' },
        { author: 'Juan Rodriguez', rating: 5, text: 'Very satisfied with the attention to detail and clear communication throughout the entire process.' },
        { author: 'Ana Martinez', rating: 4, text: 'Great experience overall. Would recommend to anyone needing professional tax services.' },
        { author: 'Emily Davis', rating: 5, text: 'Professional, efficient, and very helpful. They made a complex process seem simple.' },
        { author: 'Michael Chen', rating: 5, text: 'Fixed all my tax issues and helped with future planning. Highly recommend!' }
    ];

    for (const service of services) {
        // Create 2-3 reviews for each service
        const numReviews = Math.floor(Math.random() * 2) + 2;
        const selectedReviews = reviewTemplates.sort(() => 0.5 - Math.random()).slice(0, numReviews);

        for (const review of selectedReviews) {
            await prisma.serviceReview.create({
                data: {
                    ...review,
                    serviceId: service.id
                }
            });
        }
    }

    console.log('✅ Seeded reviews for all services successfully!');
}

async function main() {
    try {
        await seedReviews();
    } catch (error) {
        console.error('❌ Error seeding reviews:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();

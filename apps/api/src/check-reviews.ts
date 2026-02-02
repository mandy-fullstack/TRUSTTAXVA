import { PrismaClient } from '@trusttax/database';

const prisma = new PrismaClient();

async function checkReviews() {
  console.log('🔍 Checking reviews in database...\n');

  // Get all services
  const services = await prisma.service.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });

  console.log(`📊 Total Services: ${services.length}\n`);

  for (const service of services) {
    console.log(`Service: ${service.name}`);
    console.log(`  ID: ${service.id}`);
    console.log(`  Reviews Count: ${service._count.reviews}\n`);
  }

  // Get all reviews
  const allReviews = await prisma.serviceReview.findMany({
    include: {
      service: {
        select: {
          name: true,
        },
      },
    },
  });

  console.log(`\n📝 Total Reviews in Database: ${allReviews.length}\n`);

  if (allReviews.length > 0) {
    console.log('Sample reviews:');
    allReviews.slice(0, 3).forEach((review) => {
      console.log(
        `  - ${review.author} (${review.rating}★) for ${review.service.name}`,
      );
    });
  }
}

async function main() {
  try {
    await checkReviews();
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

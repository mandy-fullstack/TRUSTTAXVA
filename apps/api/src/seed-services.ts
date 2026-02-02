import { PrismaClient } from '@trusttax/database';

const prisma = new PrismaClient();

async function seedServices() {
  console.log('🌱 Seeding services...');

  // Tax Services
  const taxService1 = await prisma.service.create({
    data: {
      name: 'Individual Tax Return (Form 1040)',
      description:
        'Complete preparation and filing of your federal tax return with expert guidance and maximum deductions.',
      price: 299,
      originalPrice: 399,
      category: 'TAX',
      isActive: true,
      steps: {
        create: [
          {
            orderIndex: 1,
            title: 'Personal Information',
            description: 'Basic details and filing status',
            formConfig: {},
          },
          {
            orderIndex: 2,
            title: 'Income Sources',
            description: 'W-2, 1099, and other income',
            formConfig: {},
          },
          {
            orderIndex: 3,
            title: 'Deductions & Credits',
            description: 'Maximize your tax benefits',
            formConfig: {},
          },
          {
            orderIndex: 4,
            title: 'Review & Submit',
            description: 'Final verification',
            formConfig: {},
          },
        ],
      },
      docTypes: {
        create: [
          { docType: 'ID_CARD', isRequired: true },
          { docType: 'TAX_FORM', isRequired: true },
          { docType: 'PROOF_OF_INCOME', isRequired: true },
        ],
      },
    },
  });

  const taxService2 = await prisma.service.create({
    data: {
      name: 'Business Tax Return (Form 1120)',
      description:
        'Professional tax preparation for corporations with comprehensive compliance review.',
      price: 899,
      category: 'TAX',
      isActive: true,
      steps: {
        create: [
          {
            orderIndex: 1,
            title: 'Business Information',
            description: 'Company details and structure',
            formConfig: {},
          },
          {
            orderIndex: 2,
            title: 'Financial Statements',
            description: 'Income and expenses',
            formConfig: {},
          },
          {
            orderIndex: 3,
            title: 'Assets & Liabilities',
            description: 'Balance sheet items',
            formConfig: {},
          },
          {
            orderIndex: 4,
            title: 'Review & File',
            description: 'Final submission',
            formConfig: {},
          },
        ],
      },
    },
  });

  const taxService3 = await prisma.service.create({
    data: {
      name: 'Tax Amendment (Form 1040-X)',
      description:
        'Correct errors or claim additional deductions on previously filed returns.',
      price: 199,
      category: 'TAX',
      isActive: true,
    },
  });

  // Immigration/Legal Services
  const legalService1 = await prisma.service.create({
    data: {
      name: 'Green Card Application (I-485)',
      description:
        'Complete assistance with permanent residency application and documentation.',
      price: 1499,
      category: 'LEGAL',
      isActive: true,
      steps: {
        create: [
          {
            orderIndex: 1,
            title: 'Eligibility Assessment',
            description: 'Verify qualification criteria',
            formConfig: {},
          },
          {
            orderIndex: 2,
            title: 'Document Collection',
            description: 'Gather required paperwork',
            formConfig: {},
          },
          {
            orderIndex: 3,
            title: 'Form Preparation',
            description: 'Complete I-485 application',
            formConfig: {},
          },
          {
            orderIndex: 4,
            title: 'Submission & Follow-up',
            description: 'File with USCIS',
            formConfig: {},
          },
        ],
      },
    },
  });

  const legalService2 = await prisma.service.create({
    data: {
      name: 'Citizenship Application (N-400)',
      description:
        'Expert guidance through the naturalization process from start to oath ceremony.',
      price: 1299,
      originalPrice: 1500,
      category: 'LEGAL',
      isActive: true,
    },
  });

  const legalService3 = await prisma.service.create({
    data: {
      name: 'Work Permit Renewal (I-765)',
      description:
        'Fast and reliable Employment Authorization Document renewal service.',
      price: 499,
      category: 'LEGAL',
      isActive: true,
    },
  });

  // Business Services
  const businessService1 = await prisma.service.create({
    data: {
      name: 'LLC Formation',
      description:
        'Complete business formation with all required state filings and documentation.',
      price: 799,
      originalPrice: 999,
      category: 'BUSINESS',
      isActive: true,
      steps: {
        create: [
          {
            orderIndex: 1,
            title: 'Business Details',
            description: 'Company name and structure',
            formConfig: {},
          },
          {
            orderIndex: 2,
            title: 'Registered Agent',
            description: 'Designate official representative',
            formConfig: {},
          },
          {
            orderIndex: 3,
            title: 'Operating Agreement',
            description: 'Internal governance rules',
            formConfig: {},
          },
          {
            orderIndex: 4,
            title: 'File & Register',
            description: 'State filing submission',
            formConfig: {},
          },
        ],
      },
    },
  });

  const businessService2 = await prisma.service.create({
    data: {
      name: 'EIN Application',
      description:
        'Obtain your federal Employer Identification Number for tax and banking purposes.',
      price: 149,
      category: 'BUSINESS',
      isActive: true,
    },
  });

  const businessService3 = await prisma.service.create({
    data: {
      name: 'Annual Compliance Package',
      description:
        'Maintain good standing with required annual reports and state filings.',
      price: 399,
      category: 'BUSINESS',
      isActive: true,
    },
  });

  console.log('✅ Seeded 9 professional services successfully!');
  console.log(`   - ${taxService1.name}`);
  console.log(`   - ${taxService2.name}`);
  console.log(`   - ${taxService3.name}`);
  console.log(`   - ${legalService1.name}`);
  console.log(`   - ${legalService2.name}`);
  console.log(`   - ${legalService3.name}`);
  console.log(`   - ${businessService1.name}`);
  console.log(`   - ${businessService2.name}`);
  console.log(`   - ${businessService3.name}`);
}

async function main() {
  try {
    await seedServices();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

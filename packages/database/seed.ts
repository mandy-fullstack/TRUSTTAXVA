import { PrismaClient, DocType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Service Catalog...');

    // 1. Personal Tax Return Service
    const taxService = await prisma.service.create({
        data: {
            name: 'Personal Tax Return 2025',
            description: 'Full service preparation for Form 1040. Includes state filing.',
            price: 150.00,
            category: 'TAX',
            steps: {
                create: [
                    {
                        orderIndex: 0,
                        title: 'Personal Information',
                        description: 'Confirm your contact details and filing status.',
                        formConfig: [
                            { name: 'fullName', label: 'Full Name', type: 'text', required: true },
                            { name: 'ssn', label: 'SSN / ITIN', type: 'text', required: true },
                            { name: 'filingStatus', label: 'Filing Status', type: 'select', options: ['Single', 'Married', 'Head of Household'] }
                        ]
                    },
                    {
                        orderIndex: 1,
                        title: 'Income Sources',
                        description: 'Upload W-2s and 1099s.',
                        formConfig: [
                            { name: 'hasW2', label: 'Do you have W-2 forms?', type: 'boolean' },
                            { name: 'w2Count', label: 'How many W-2s?', type: 'number' }
                        ]
                    },
                    {
                        orderIndex: 2,
                        title: 'Review & Submit',
                        description: 'Review your data before final submission.',
                        formConfig: [] // No fields, just review UI
                    }
                ]
            },
            docTypes: {
                create: [
                    { docType: DocType.ID_CARD, isRequired: true },
                    { docType: DocType.TAX_FORM, isRequired: true } // Generic for W-2
                ]
            }
        }
    });

    // 2. Business Incorporation
    await prisma.service.create({
        data: {
            name: 'Business Incorporation (LLC)',
            description: 'Start your company legally. We handle state filing and EIN.',
            price: 300.00,
            category: 'BUSINESS',
            steps: {
                create: [
                    {
                        orderIndex: 0,
                        title: 'Business Details',
                        description: 'Choose your company name and type.',
                        formConfig: [
                            { name: 'businessName', label: 'Primary Choice Name', type: 'text', required: true },
                            { name: 'altName', label: 'Alternative Name', type: 'text' },
                            { name: 'state', label: 'State of Formation', type: 'text', required: true }
                        ]
                    },
                    {
                        orderIndex: 1,
                        title: 'Owner Information',
                        description: 'Who will own this business?',
                        formConfig: [
                            { name: 'ownerName', label: 'Owner Full Name', type: 'text', required: true },
                            { name: 'ownershipPercent', label: 'Ownership %', type: 'number', required: true }
                        ]
                    }
                ]
            },
            docTypes: {
                create: [
                    { docType: DocType.ID_CARD, isRequired: true }
                ]
            }
        }
    });

    // 3. ITIN Application
    await prisma.service.create({
        data: {
            name: 'ITIN Application (W-7)',
            description: 'Get your Individual Taxpayer Identification Number.',
            price: 200.00,
            category: 'IMMIGRATION', // or TAX, overlap
            steps: {
                create: [
                    {
                        orderIndex: 0,
                        title: 'Applicant Info',
                        formConfig: [
                            { name: 'citizenship', label: 'Country of Citizenship', type: 'text', required: true },
                            { name: 'passportNumber', label: 'Passport Number', type: 'text', required: true }
                        ]
                    }
                ]
            },
            docTypes: {
                create: [
                    { docType: DocType.PASSPORT, isRequired: true }
                ]
            }
        }
    });

    console.log('✅ Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

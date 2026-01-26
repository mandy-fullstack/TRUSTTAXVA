import { PrismaClient, DocType } from '@prisma/client';

const prisma = new PrismaClient();

type FieldDef = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  rules?: { showWhen?: { field: string; value: boolean | string | number } };
};

async function createFormTemplate(
  name: string,
  description: string,
  sectionTitle: string,
  fields: FieldDef[],
) {
  const form = await prisma.form.create({
    data: {
      name,
      description,
      version: '1.0',
      active: true,
    },
  });
  const section = await prisma.formSection.create({
    data: { formId: form.id, title: sectionTitle, order: 0 },
  });
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    const type = f.type === 'boolean' ? 'checkbox' : f.type;
    await prisma.formField.create({
      data: {
        formId: form.id,
        sectionId: section.id,
        type,
        name: f.name,
        label: f.label,
        placeholder: f.placeholder ?? null,
        required: f.required ?? false,
        order: i,
        options: f.options ?? undefined,
        rules: f.rules ?? undefined,
      },
    });
  }
  return form;
}

async function createEmptyFormTemplate(name: string, description: string) {
  return prisma.form.create({
    data: { name, description, version: '1.0', active: true },
  });
}

async function main() {
  console.log('🌱 Seeding Form templates and Service catalog...');

  // --- Form templates (used by service steps) ---

  const formPersonalInfo = await createFormTemplate(
    'Personal Information',
    'Contact details and filing status (Tax).',
    'Personal Information',
    [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true },
      { name: 'ssn', label: 'SSN / ITIN', type: 'text', required: true },
      {
        name: 'filingStatus',
        label: 'Filing Status',
        type: 'select',
        required: false,
        options: [
          { value: 'Single', label: 'Single' },
          { value: 'Married', label: 'Married' },
          { value: 'Head of Household', label: 'Head of Household' },
        ],
      },
    ],
  );

  const formIncomeSources = await createFormTemplate(
    'Income Sources',
    'W-2s and 1099s (Tax).',
    'Income Sources',
    [
      { name: 'hasW2', label: 'Do you have W-2 forms?', type: 'checkbox' },
      {
        name: 'w2Count',
        label: 'How many W-2s?',
        type: 'number',
        rules: { showWhen: { field: 'hasW2', value: true } },
      },
    ],
  );

  const formReviewSubmit = await createEmptyFormTemplate(
    'Review & Submit',
    'Review step; no intake fields.',
  );

  const formBusinessDetails = await createFormTemplate(
    'Business Details',
    'Company name and formation (LLC).',
    'Business Details',
    [
      { name: 'businessName', label: 'Primary Choice Name', type: 'text', required: true },
      { name: 'altName', label: 'Alternative Name', type: 'text' },
      { name: 'state', label: 'State of Formation', type: 'text', required: true },
    ],
  );

  const formOwnerInfo = await createFormTemplate(
    'Owner Information',
    'Business ownership (LLC).',
    'Owner Information',
    [
      { name: 'ownerName', label: 'Owner Full Name', type: 'text', required: true },
      { name: 'ownershipPercent', label: 'Ownership %', type: 'number', required: true },
    ],
  );

  const formApplicantInfo = await createFormTemplate(
    'Applicant Info',
    'ITIN W-7 applicant information.',
    'Applicant Info',
    [
      { name: 'citizenship', label: 'Country of Citizenship', type: 'text', required: true },
      { name: 'passportNumber', label: 'Passport Number', type: 'text', required: true },
    ],
  );

  // Formulario de Impuesto (plantilla completa con lógica sí/no)
  const formImpuesto = await prisma.form.create({
    data: {
      name: 'Formulario de Impuesto',
      description: 'Plantilla para declaración de impuestos con lógica condicional (sí/no).',
      version: '1.0',
      active: true,
    },
  });
  const sec1 = await prisma.formSection.create({
    data: { formId: formImpuesto.id, title: 'Situación fiscal', order: 0 },
  });
  const sec2 = await prisma.formSection.create({
    data: { formId: formImpuesto.id, title: 'Ingresos', order: 1 },
  });
  const sec3 = await prisma.formSection.create({
    data: { formId: formImpuesto.id, title: 'Deducciones', order: 2 },
  });
  const sec4 = await prisma.formSection.create({
    data: { formId: formImpuesto.id, title: 'Información adicional', order: 3 },
  });
  await prisma.formField.createMany({
    data: [
      { formId: formImpuesto.id, sectionId: sec1.id, type: 'checkbox', name: 'presento_impuestos', label: '¿Presentó declaración de impuestos el año pasado?', required: true, order: 0 },
      { formId: formImpuesto.id, sectionId: sec1.id, type: 'checkbox', name: 'ingresos_independientes', label: '¿Tiene ingresos por trabajo independiente?', order: 1 },
      { formId: formImpuesto.id, sectionId: sec1.id, type: 'checkbox', name: 'propiedad_vivienda', label: '¿Es dueño de su vivienda?', order: 2 },
      { formId: formImpuesto.id, sectionId: sec2.id, type: 'number', name: 'ingresos_salario', label: 'Ingresos por salario (USD)', placeholder: '0', order: 0 },
      { formId: formImpuesto.id, sectionId: sec2.id, type: 'number', name: 'ingresos_independientes_monto', label: 'Ingresos por trabajo independiente (USD)', placeholder: '0', order: 1, rules: { showWhen: { field: 'ingresos_independientes', value: true } } as any },
      { formId: formImpuesto.id, sectionId: sec2.id, type: 'number', name: 'otros_ingresos', label: 'Otros ingresos (USD)', placeholder: '0', order: 2 },
      { formId: formImpuesto.id, sectionId: sec3.id, type: 'number', name: 'intereses_hipoteca', label: 'Intereses hipotecarios (USD)', placeholder: '0', order: 0, rules: { showWhen: { field: 'propiedad_vivienda', value: true } } as any },
      { formId: formImpuesto.id, sectionId: sec3.id, type: 'number', name: 'donaciones', label: 'Donaciones caritativas (USD)', placeholder: '0', order: 1 },
      { formId: formImpuesto.id, sectionId: sec4.id, type: 'textarea', name: 'notas', label: 'Notas adicionales', placeholder: 'Opcional', order: 0 },
    ],
  });

  console.log('✅ Form templates created.');

  // --- Services (steps use formId) ---

  await prisma.service.create({
    data: {
      name: 'Personal Tax Return 2025',
      description: 'Full service preparation for Form 1040. Includes state filing.',
      price: 150.0,
      category: 'TAX',
      steps: {
        create: [
          { orderIndex: 0, title: 'Personal Information', description: 'Confirm your contact details and filing status.', formId: formPersonalInfo.id },
          { orderIndex: 1, title: 'Income Sources', description: 'Upload W-2s and 1099s.', formId: formIncomeSources.id },
          { orderIndex: 2, title: 'Review & Submit', description: 'Review your data before final submission.', formId: formReviewSubmit.id },
        ],
      },
      docTypes: {
        create: [
          { docType: DocType.ID_CARD, isRequired: true },
          { docType: DocType.TAX_FORM, isRequired: true },
        ],
      },
    },
  });

  await prisma.service.create({
    data: {
      name: 'Business Incorporation (LLC)',
      description: 'Start your company legally. We handle state filing and EIN.',
      price: 300.0,
      category: 'BUSINESS',
      steps: {
        create: [
          { orderIndex: 0, title: 'Business Details', description: 'Choose your company name and type.', formId: formBusinessDetails.id },
          { orderIndex: 1, title: 'Owner Information', description: 'Who will own this business?', formId: formOwnerInfo.id },
        ],
      },
      docTypes: {
        create: [{ docType: DocType.ID_CARD, isRequired: true }],
      },
    },
  });

  await prisma.service.create({
    data: {
      name: 'ITIN Application (W-7)',
      description: 'Get your Individual Taxpayer Identification Number.',
      price: 200.0,
      category: 'TAX',
      steps: {
        create: [
          { orderIndex: 0, title: 'Applicant Info', description: 'Country of citizenship and passport.', formId: formApplicantInfo.id },
        ],
      },
      docTypes: {
        create: [{ docType: DocType.PASSPORT, isRequired: true }],
      },
    },
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

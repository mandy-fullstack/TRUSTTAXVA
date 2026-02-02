import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const FIELD_TYPES = [
  'text',
  'textarea',
  'number',
  'phone',
  'email',
  'date',
  'select',
  'checkbox',
  'ssn',
  'file_upload',
  'image_upload',
  'signature',
] as const;

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.form.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { sections: true, fields: true } },
      },
    });
  }

  async findOne(id: string) {
    const form = await this.prisma.client.form.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: { fields: { orderBy: { order: 'asc' } } },
        },
        fields: { where: { sectionId: null }, orderBy: { order: 'asc' } },
      },
    });
    if (!form) throw new Error('Form not found');
    return form;
  }

  async create(dto: {
    name: string;
    description?: string;
    version?: string;
    active?: boolean;
  }) {
    return this.prisma.client.form.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        version: dto.version ?? '1.0',
        active: dto.active ?? true,
      },
    });
  }

  async update(
    id: string,
    dto: {
      name?: string;
      description?: string;
      nameI18n?: { en?: string; es?: string };
      descriptionI18n?: { en?: string; es?: string };
      version?: string;
      active?: boolean;
    },
  ) {
    const data: any = {};
    if (dto.name != null) data.name = dto.name;
    if (dto.description != null) data.description = dto.description;
    if (dto.nameI18n !== undefined) data.nameI18n = dto.nameI18n;
    if (dto.descriptionI18n !== undefined)
      data.descriptionI18n = dto.descriptionI18n;
    if (dto.version != null) data.version = dto.version;
    if (dto.active != null) data.active = dto.active;
    return this.prisma.client.form.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.client.form.delete({ where: { id } });
  }

  /** Create a new form from a built-in template (e.g. tax intake). */
  async createFromTemplate(template: 'tax') {
    if (template !== 'tax') throw new Error(`Unknown template: ${template}`);

    const form = await this.prisma.client.form.create({
      data: {
        name: 'Formulario de Impuesto',
        description:
          'Plantilla para declaración de impuestos con lógica condicional (sí/no). Secciones: situación fiscal, ingresos, deducciones.',
        version: '1.0',
        active: true,
      },
    });

    const sec1 = await this.createSection(form.id, {
      title: 'Situación fiscal',
      order: 0,
    });
    const sec2 = await this.createSection(form.id, {
      title: 'Ingresos',
      order: 1,
    });
    const sec3 = await this.createSection(form.id, {
      title: 'Deducciones',
      order: 2,
    });
    const sec4 = await this.createSection(form.id, {
      title: 'Información adicional',
      order: 3,
    });

    await this.createField(form.id, {
      sectionId: sec1.id,
      type: 'checkbox',
      name: 'presento_impuestos',
      label: '¿Presentó declaración de impuestos el año pasado?',
      required: true,
      order: 0,
    });
    await this.createField(form.id, {
      sectionId: sec1.id,
      type: 'checkbox',
      name: 'ingresos_independientes',
      label: '¿Tiene ingresos por trabajo independiente?',
      order: 1,
    });
    await this.createField(form.id, {
      sectionId: sec1.id,
      type: 'checkbox',
      name: 'propiedad_vivienda',
      label: '¿Es dueño de su vivienda?',
      order: 2,
    });

    await this.createField(form.id, {
      sectionId: sec2.id,
      type: 'number',
      name: 'ingresos_salario',
      label: 'Ingresos por salario (USD)',
      placeholder: '0',
      order: 0,
    });
    await this.createField(form.id, {
      sectionId: sec2.id,
      type: 'number',
      name: 'ingresos_independientes_monto',
      label: 'Ingresos por trabajo independiente (USD)',
      placeholder: '0',
      order: 1,
      rules: { showWhen: { field: 'ingresos_independientes', value: true } },
    });
    await this.createField(form.id, {
      sectionId: sec2.id,
      type: 'number',
      name: 'otros_ingresos',
      label: 'Otros ingresos (USD)',
      placeholder: '0',
      order: 2,
    });

    await this.createField(form.id, {
      sectionId: sec3.id,
      type: 'number',
      name: 'intereses_hipoteca',
      label: 'Intereses hipotecarios (USD)',
      placeholder: '0',
      order: 0,
      rules: { showWhen: { field: 'propiedad_vivienda', value: true } },
    });
    await this.createField(form.id, {
      sectionId: sec3.id,
      type: 'number',
      name: 'donaciones',
      label: 'Donaciones caritativas (USD)',
      placeholder: '0',
      order: 1,
    });

    await this.createField(form.id, {
      sectionId: sec4.id,
      type: 'textarea',
      name: 'notas',
      label: 'Notas adicionales',
      placeholder: 'Opcional',
      order: 0,
    });

    return this.findOne(form.id);
  }

  async createSection(
    formId: string,
    dto: {
      title: string;
      order?: number;
      titleI18n?: { en?: string; es?: string };
    },
  ) {
    const last = await this.prisma.client.formSection.findFirst({
      where: { formId },
      orderBy: { order: 'desc' },
    });
    const order = dto.order ?? (last ? last.order + 1 : 0);
    return this.prisma.client.formSection.create({
      data: {
        formId,
        title: dto.title,
        order,
        titleI18n: dto.titleI18n ?? undefined,
      },
    });
  }

  async updateSection(
    formId: string,
    sectionId: string,
    dto: {
      title?: string;
      order?: number;
      titleI18n?: { en?: string; es?: string };
    },
  ) {
    await this.ensureSectionInForm(formId, sectionId);
    const data: any = {};
    if (dto.title != null) data.title = dto.title;
    if (dto.order != null) data.order = dto.order;
    if (dto.titleI18n !== undefined) data.titleI18n = dto.titleI18n;
    return this.prisma.client.formSection.update({
      where: { id: sectionId },
      data,
    });
  }

  async deleteSection(formId: string, sectionId: string) {
    await this.ensureSectionInForm(formId, sectionId);
    return this.prisma.client.formSection.delete({ where: { id: sectionId } });
  }

  async createField(
    formId: string,
    dto: {
      sectionId?: string | null;
      type: string;
      name: string;
      label: string;
      placeholder?: string;
      helpText?: string;
      labelI18n?: { en?: string; es?: string };
      placeholderI18n?: { en?: string; es?: string };
      helpTextI18n?: { en?: string; es?: string };
      required?: boolean;
      order?: number;
      rules?: object;
      options?: object;
      accept?: string;
      maxFiles?: number;
      maxSize?: number;
    },
  ) {
    if (!FIELD_TYPES.includes(dto.type as any)) {
      throw new Error(
        `Invalid field type: ${dto.type}. Allowed: ${FIELD_TYPES.join(', ')}`,
      );
    }
    if (dto.sectionId) await this.ensureSectionInForm(formId, dto.sectionId);

    const last = await this.prisma.client.formField.findFirst({
      where: dto.sectionId
        ? { sectionId: dto.sectionId }
        : { formId, sectionId: null },
      orderBy: { order: 'desc' },
    });
    const order = dto.order ?? (last ? last.order + 1 : 0);

    return this.prisma.client.formField.create({
      data: {
        formId,
        sectionId: dto.sectionId || null,
        type: dto.type,
        name: dto.name,
        label: dto.label,
        placeholder: dto.placeholder ?? null,
        helpText: dto.helpText ?? null,
        labelI18n: dto.labelI18n ?? undefined,
        placeholderI18n: dto.placeholderI18n ?? undefined,
        helpTextI18n: dto.helpTextI18n ?? undefined,
        required: dto.required ?? false,
        order,
        rules: dto.rules ?? undefined,
        options: dto.options ?? undefined,
        accept: dto.accept ?? undefined,
        maxFiles: dto.maxFiles ?? null,
        maxSize: dto.maxSize ?? null,
      },
    });
  }

  async updateField(
    formId: string,
    fieldId: string,
    dto: Partial<{
      sectionId: string | null;
      type: string;
      name: string;
      label: string;
      placeholder: string;
      helpText: string;
      labelI18n: { en?: string; es?: string };
      placeholderI18n: { en?: string; es?: string };
      helpTextI18n: { en?: string; es?: string };
      required: boolean;
      order: number;
      rules: object;
      options: object;
      accept: string;
      maxFiles: number;
      maxSize: number;
    }>,
  ) {
    await this.ensureFieldInForm(formId, fieldId);
    if (dto.type != null && !FIELD_TYPES.includes(dto.type as any)) {
      throw new Error(`Invalid field type: ${dto.type}`);
    }
    if (dto.sectionId !== undefined && dto.sectionId) {
      await this.ensureSectionInForm(formId, dto.sectionId);
    }

    const data: any = {};
    if (dto.sectionId !== undefined) data.sectionId = dto.sectionId;
    if (dto.type != null) data.type = dto.type;
    if (dto.name != null) data.name = dto.name;
    if (dto.label != null) data.label = dto.label;
    if (dto.placeholder !== undefined) data.placeholder = dto.placeholder;
    if (dto.helpText !== undefined) data.helpText = dto.helpText;
    if (dto.labelI18n !== undefined) data.labelI18n = dto.labelI18n;
    if (dto.placeholderI18n !== undefined)
      data.placeholderI18n = dto.placeholderI18n;
    if (dto.helpTextI18n !== undefined) data.helpTextI18n = dto.helpTextI18n;
    if (dto.required !== undefined) data.required = dto.required;
    if (dto.order != null) data.order = dto.order;
    if (dto.rules !== undefined) data.rules = dto.rules;
    if (dto.options !== undefined) data.options = dto.options;
    if (dto.accept !== undefined) data.accept = dto.accept;
    if (dto.maxFiles !== undefined) data.maxFiles = dto.maxFiles;
    if (dto.maxSize !== undefined) data.maxSize = dto.maxSize;

    return this.prisma.client.formField.update({
      where: { id: fieldId },
      data,
    });
  }

  async deleteField(formId: string, fieldId: string) {
    await this.ensureFieldInForm(formId, fieldId);
    return this.prisma.client.formField.delete({ where: { id: fieldId } });
  }

  private async ensureSectionInForm(formId: string, sectionId: string) {
    const s = await this.prisma.client.formSection.findFirst({
      where: { id: sectionId, formId },
    });
    if (!s)
      throw new Error('Section not found or does not belong to this form');
  }

  private async ensureFieldInForm(formId: string, fieldId: string) {
    const f = await this.prisma.client.formField.findFirst({
      where: { id: fieldId, formId },
    });
    if (!f) throw new Error('Field not found or does not belong to this form');
  }
}

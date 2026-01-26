import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FormsService } from './forms.service';

@Controller('admin/forms')
@UseGuards(AuthGuard('jwt'))
export class FormsController {
  constructor(private formsService: FormsService) {}

  private ensureAdmin(req: any) {
    if (req.user?.role !== 'ADMIN') throw new Error('Unauthorized');
  }

  @Get()
  async list(@Request() req: any) {
    this.ensureAdmin(req);
    return this.formsService.findAll();
  }

  @Get(':id')
  async get(@Request() req: any, @Param('id') id: string) {
    this.ensureAdmin(req);
    return this.formsService.findOne(id);
  }

  @Post()
  async create(
    @Request() req: any,
    @Body() body: { name: string; description?: string; version?: string; active?: boolean },
  ) {
    this.ensureAdmin(req);
    return this.formsService.create(body);
  }

  @Post('from-template')
  async createFromTemplate(@Request() req: any, @Body() body: { template: string }) {
    this.ensureAdmin(req);
    return this.formsService.createFromTemplate(body.template as 'tax');
  }

  @Patch(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      description?: string;
      nameI18n?: { en?: string; es?: string };
      descriptionI18n?: { en?: string; es?: string };
      version?: string;
      active?: boolean;
    },
  ) {
    this.ensureAdmin(req);
    return this.formsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    this.ensureAdmin(req);
    return this.formsService.remove(id);
  }

  @Post(':formId/sections')
  async createSection(
    @Request() req: any,
    @Param('formId') formId: string,
    @Body() body: { title: string; order?: number; titleI18n?: { en?: string; es?: string } },
  ) {
    this.ensureAdmin(req);
    return this.formsService.createSection(formId, body);
  }

  @Patch(':formId/sections/:sectionId')
  async updateSection(
    @Request() req: any,
    @Param('formId') formId: string,
    @Param('sectionId') sectionId: string,
    @Body() body: { title?: string; order?: number; titleI18n?: { en?: string; es?: string } },
  ) {
    this.ensureAdmin(req);
    return this.formsService.updateSection(formId, sectionId, body);
  }

  @Delete(':formId/sections/:sectionId')
  async deleteSection(
    @Request() req: any,
    @Param('formId') formId: string,
    @Param('sectionId') sectionId: string,
  ) {
    this.ensureAdmin(req);
    return this.formsService.deleteSection(formId, sectionId);
  }

  @Post(':formId/fields')
  async createField(
    @Request() req: any,
    @Param('formId') formId: string,
    @Body()
    body: {
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
    this.ensureAdmin(req);
    return this.formsService.createField(formId, body);
  }

  @Patch(':formId/fields/:fieldId')
  async updateField(
    @Request() req: any,
    @Param('formId') formId: string,
    @Param('fieldId') fieldId: string,
    @Body()
    body: Partial<{
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
    this.ensureAdmin(req);
    return this.formsService.updateField(formId, fieldId, body);
  }

  @Delete(':formId/fields/:fieldId')
  async deleteField(
    @Request() req: any,
    @Param('formId') formId: string,
    @Param('fieldId') fieldId: string,
  ) {
    this.ensureAdmin(req);
    return this.formsService.deleteField(formId, fieldId);
  }
}

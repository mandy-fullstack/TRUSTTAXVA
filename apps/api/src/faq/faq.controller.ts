import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

const JwtAuthGuard = AuthGuard('jwt');

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createFaqDto: CreateFaqDto) {
    return this.faqService.create(createFaqDto);
  }

  @Get()
  findAll() {
    return this.faqService.findAll();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAllAdmin() {
    return this.faqService.findAllAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.faqService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto) {
    return this.faqService.update(id, updateFaqDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.faqService.remove(id);
  }
}

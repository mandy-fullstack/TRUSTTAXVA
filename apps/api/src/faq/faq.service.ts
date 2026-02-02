import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqService {
  constructor(private prisma: PrismaService) {}

  create(createFaqDto: CreateFaqDto) {
    return this.prisma.fAQ.create({
      data: createFaqDto,
    });
  }

  findAll() {
    return this.prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  findAllAdmin() {
    return this.prisma.fAQ.findMany({
      orderBy: { order: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.fAQ.findUnique({
      where: { id },
    });
  }

  update(id: string, updateFaqDto: UpdateFaqDto) {
    return this.prisma.fAQ.update({
      where: { id },
      data: updateFaqDto,
    });
  }

  remove(id: string) {
    return this.prisma.fAQ.delete({
      where: { id },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.invoice.findMany({
      where: { clientId: userId },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        payments: true,
      },
    });
  }

  async findOne(userId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, clientId: userId },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      } as any,
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }
}

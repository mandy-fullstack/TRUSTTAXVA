import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async getProfile() {
    // Find existing or create default
    let profile = await (this.prisma.client as any).companyProfile.findFirst();

    if (!profile) {
      profile = await (this.prisma.client as any).companyProfile.create({
        data: {
          companyName: 'Trust Tax Services',
          email: 'contact@trusttax.com',
          phone: '(555) 123-4567',
          address: '123 Business Ave, VA',
          primaryColor: '#0F172A',
          secondaryColor: '#2563EB',
        },
      });
    }

    return profile;
  }

  async updateProfile(data: any) {
    const profile = await this.getProfile();

    return (this.prisma.client as any).companyProfile.update({
      where: { id: profile.id },
      data,
    });
  }
}

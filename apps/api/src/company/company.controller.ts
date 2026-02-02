import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { CompanyService } from './company.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Get('public')
  async getPublicProfile() {
    return this.companyService.getProfile();
  }

  @UseGuards(AuthGuard('jwt'))
  @Put()
  async updateProfile(@Request() req: any, @Body() body: any) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }
    return this.companyService.updateProfile(body);
  }
}

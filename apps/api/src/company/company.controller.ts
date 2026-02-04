import { Controller, Get, Put, Body, UseGuards, Request, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CompanyService } from './company.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';

@Controller('company')
export class CompanyController {
  private readonly logger = new Logger(CompanyController.name);

  constructor(private companyService: CompanyService) { }

  @Get('public')
  async getPublicProfile() {
    return this.companyService.getProfile();
  }

  @UseGuards(AuthGuard('jwt'))
  @Put()
  async updateProfile(@Request() req: any, @Body() body: UpdateCompanyProfileDto) {
    if (req.user.role !== 'ADMIN') {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }

    // Log incoming request
    this.logger.log(`Received update request from admin: ${req.user.email}`);

    try {
      // Validar y normalizar datos JSON antes de enviar al servicio
      const normalizedData: any = { ...body };

      // Asegurar que businessHours, socialLinks y themeOptions sean objetos válidos o null
      if (normalizedData.businessHours !== undefined) {
        if (typeof normalizedData.businessHours === 'string') {
          try {
            normalizedData.businessHours = JSON.parse(normalizedData.businessHours);
          } catch (e) {
            this.logger.warn(`Failed to parse businessHours as JSON: ${e.message}`);
            normalizedData.businessHours = null;
          }
        }
      }

      if (normalizedData.socialLinks !== undefined) {
        if (typeof normalizedData.socialLinks === 'string') {
          try {
            normalizedData.socialLinks = JSON.parse(normalizedData.socialLinks);
          } catch (e) {
            this.logger.warn(`Failed to parse socialLinks as JSON: ${e.message}`);
            normalizedData.socialLinks = null;
          }
        }
      }

      if (normalizedData.themeOptions !== undefined) {
        if (typeof normalizedData.themeOptions === 'string') {
          try {
            normalizedData.themeOptions = JSON.parse(normalizedData.themeOptions);
          } catch (e) {
            this.logger.warn(`Failed to parse themeOptions as JSON: ${e.message}`);
            normalizedData.themeOptions = null;
          }
        }
      }

      const result = await this.companyService.updateProfile(normalizedData);
      this.logger.log('Company profile update successful');
      return result;
    } catch (error: any) {
      this.logger.error(`Error updating profile: ${error.message}`, error.stack);
      throw error;
    }
  }
}

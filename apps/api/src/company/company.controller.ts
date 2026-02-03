import { Controller, Get, Put, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { CompanyService } from './company.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';

@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

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
    console.log('[CompanyController] Received update request:', {
      keys: Object.keys(body),
      hasNotificationSenderName: 'notificationSenderName' in body,
      notificationSenderNameValue: body.notificationSenderName,
      bodyType: typeof body,
      hasBusinessHours: 'businessHours' in body,
      hasSocialLinks: 'socialLinks' in body,
      hasThemeOptions: 'themeOptions' in body,
      bodyStringified: JSON.stringify(body).substring(0, 500),
    });
    
    try {
      // Validar y normalizar datos JSON antes de enviar al servicio
      const normalizedData: any = { ...body };
      
      // Asegurar que businessHours, socialLinks y themeOptions sean objetos válidos o null
      if (normalizedData.businessHours !== undefined) {
        if (typeof normalizedData.businessHours === 'string') {
          try {
            normalizedData.businessHours = JSON.parse(normalizedData.businessHours);
          } catch (e) {
            console.warn('[CompanyController] Failed to parse businessHours as JSON:', e);
            normalizedData.businessHours = null;
          }
        }
      }
      
      if (normalizedData.socialLinks !== undefined) {
        if (typeof normalizedData.socialLinks === 'string') {
          try {
            normalizedData.socialLinks = JSON.parse(normalizedData.socialLinks);
          } catch (e) {
            console.warn('[CompanyController] Failed to parse socialLinks as JSON:', e);
            normalizedData.socialLinks = null;
          }
        }
      }
      
      if (normalizedData.themeOptions !== undefined) {
        if (typeof normalizedData.themeOptions === 'string') {
          try {
            normalizedData.themeOptions = JSON.parse(normalizedData.themeOptions);
          } catch (e) {
            console.warn('[CompanyController] Failed to parse themeOptions as JSON:', e);
            normalizedData.themeOptions = null;
          }
        }
      }
      
      const result = await this.companyService.updateProfile(normalizedData);
      console.log('[CompanyController] Update successful');
      return result;
    } catch (error: any) {
      // Log the full error for debugging
      console.error('[CompanyController] Error updating profile:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
        name: error.name,
        stack: error.stack,
        errorString: String(error),
        originalError: error.originalError || error.cause,
      });
      
      // Re-throw to let the exception filter handle it
      // The PrismaExceptionFilter will handle Prisma errors properly
      throw error;
    }
  }
}

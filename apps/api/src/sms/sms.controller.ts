import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SMSService } from './sms.service';
import { AdminGuard } from '../auth/admin.guard';

const JwtAuthGuard = AuthGuard('jwt');

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

class OptInSMSDto {
  phoneNumber: string;
}

class SendSMSDto {
  to: string;
  message: string;
}

@Controller('sms')
export class SMSController {
  constructor(private readonly smsService: SMSService) {}

  @Post('opt-in')
  @UseGuards(JwtAuthGuard)
  async optIn(@Request() req: AuthenticatedRequest, @Body() dto: OptInSMSDto) {
    await this.smsService.optInSMS(req.user.userId, dto.phoneNumber);
    return { success: true, message: 'Successfully opted in to SMS messages' };
  }

  @Post('opt-out')
  @UseGuards(JwtAuthGuard)
  async optOut(@Request() req: AuthenticatedRequest) {
    await this.smsService.optOutSMS(req.user.userId);
    return { success: true, message: 'Successfully opted out of SMS messages' };
  }

  @Get('consent-status')
  @UseGuards(JwtAuthGuard)
  async getConsentStatus(@Request() req: AuthenticatedRequest) {
    const hasConsent = await this.smsService.hasSMSConsent(req.user.userId);
    return { hasConsent };
  }

  @Post('send')
  @UseGuards(AdminGuard)
  async sendSMS(@Body() dto: SendSMSDto) {
    await this.smsService.sendSMS(dto.to, dto.message);
    return { success: true, message: 'SMS sent successfully' };
  }
}

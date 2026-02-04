import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
    Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, MinLength, IsOptional } from 'class-validator';
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
    otpSessionId?: string;
}

class SendSMSDto {
    to: string;
    message: string;
}

class StartOtpDto {
    @IsString()
    @MinLength(7)
    phoneNumber: string;

    @IsOptional()
    @IsString()
    purpose?: string;
}

class VerifyOtpDto {
    @IsString()
    sessionId: string;

    @IsString()
    @MinLength(4)
    code: string;
}

@Controller('sms')
export class SMSController {
    constructor(private readonly smsService: SMSService) { }

    @Post('opt-in')
    @UseGuards(JwtAuthGuard)
    async optIn(@Request() req: AuthenticatedRequest, @Body() dto: OptInSMSDto) {
        // Enforce OTP verification if provided; recommended for RingCentral compliance
        await this.smsService.optInSMS(req.user.userId, dto.phoneNumber, dto.otpSessionId);
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

    // --- OTP flow (public): used during registration or before opt-in confirmation ---
    @Post('otp/start')
    async startOtp(@Body() dto: StartOtpDto) {
        return this.smsService.startSmsOtp(dto.phoneNumber, dto.purpose || 'REGISTRATION');
    }

    @Post('otp/verify')
    async verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.smsService.verifySmsOtp(dto.sessionId, dto.code);
    }

    @Post('send')
    @UseGuards(AdminGuard)
    async sendSMS(@Body() dto: SendSMSDto) {
        await this.smsService.sendSMS(dto.to, dto.message);
        return { success: true, message: 'SMS sent successfully' };
    }
}

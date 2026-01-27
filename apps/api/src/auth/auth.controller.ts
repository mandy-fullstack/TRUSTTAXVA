import { Controller, Post, Body, UseGuards, Request, Get, Patch, UnauthorizedException, Param, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

// JWT Auth Guard for protected routes
const JwtAuthGuard = AuthGuard('jwt');

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 requests per hour
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @Throttle({ default: { limit: 10, ttl: 900000 } }) // 10 requests per 15 minutes
    async login(@Body() dto: LoginDto) {
        const user = await this.authService.validateUser(dto.email, dto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }
        return this.authService.login(user); // Returns access_token
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    async getMe(@Request() req: any) {
        return this.authService.findById(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('profile')
    async updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
        return this.authService.updateProfile(req.user.userId, dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile/decrypt-ssn')
    async getDecryptedSSN(@Request() req: any) {
        const ssn = await this.authService.decryptSSN(req.user.userId);
        return { ssn };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile/decrypt-driver-license')
    async getDecryptedDriverLicense(@Request() req: any) {
        const driverLicense = await this.authService.decryptDriverLicense(req.user.userId);
        return { driverLicense };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile/decrypt-passport')
    async getDecryptedPassport(@Request() req: any) {
        const passport = await this.authService.decryptPassport(req.user.userId);
        return { passport };
    }

    @Post('forgot-password')
    @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 requests per hour
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.requestPasswordReset(dto.email);
    }

    @Get('verify-reset-token/:token')
    async verifyResetToken(@Request() req: any) {
        const token = req.params.token;
        return this.authService.verifyResetToken(token);
    }

    @Post('reset-password')
    @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 requests per hour
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto.token, dto.password);
    }

    @Get('verify-email/:token')
    @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 requests per hour
    async verifyEmail(@Request() req: any) {
        const token = req.params.token;
        return this.authService.verifyEmail(token);
    }

    // ==================== TWO-FACTOR AUTHENTICATION (2FA) ENDPOINTS ====================

    /**
     * Setup 2FA - Generate QR code (Admin only, requires authentication)
     */
    @Post('2fa/setup')
    @UseGuards(JwtAuthGuard)
    @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 requests per hour
    async setup2FA(@Request() req: any) {
        return this.authService.setup2FA(req.user.userId);
    }

    /**
     * Enable 2FA - Verify code and activate (Admin only, requires authentication)
     */
    @Post('2fa/enable')
    @UseGuards(JwtAuthGuard)
    @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 requests per hour
    async enable2FA(@Request() req: any, @Body() body: { token: string }) {
        return this.authService.enable2FA(req.user.userId, body.token);
    }

    /**
     * Disable 2FA (Admin only, requires authentication and current 2FA code)
     */
    @Post('2fa/disable')
    @UseGuards(JwtAuthGuard)
    @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 requests per hour
    async disable2FA(@Request() req: any, @Body() body: { token: string }) {
        return this.authService.disable2FA(req.user.userId, body.token);
    }

    /**
     * Verify 2FA code during login (no authentication required)
     */
    @Post('2fa/verify')
    @Throttle({ default: { limit: 10, ttl: 900000 } }) // 10 requests per 15 minutes
    async verify2FA(@Body() body: { tempToken: string; code: string }) {
        return this.authService.complete2FALogin(body.tempToken, body.code);
    }


}

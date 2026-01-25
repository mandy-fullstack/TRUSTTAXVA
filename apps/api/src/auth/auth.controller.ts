import { Controller, Post, Body, UseGuards, Request, Get, Patch, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() body: any) {
        return this.authService.register(body);
    }

    @Post('login')
    async login(@Body() body: any) {
        const user = await this.authService.validateUser(body.email, body.password);
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
}

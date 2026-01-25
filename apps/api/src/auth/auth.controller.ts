import { Controller, Post, Body, UseGuards, Request, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

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
}

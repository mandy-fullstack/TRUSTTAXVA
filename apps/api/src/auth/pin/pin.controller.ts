import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { PinService } from './pin.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth/pin')
@UseGuards(AuthGuard('jwt'))
export class PinController {
    constructor(private pinService: PinService) { }

    @Post('setup')
    async setup(@Request() req: any, @Body('pin') pin: string) {
        return this.pinService.setupPin(req.user.id, pin);
    }

    @Post('verify')
    async verify(@Request() req: any, @Body('pin') pin: string) {
        const isValid = await this.pinService.verifyPin(req.user.id, pin);
        return { valid: isValid };
    }

    @Post('change')
    async change(@Request() req: any, @Body() body: { oldPin: string; newPin: string }) {
        return this.pinService.changePin(req.user.id, body.oldPin, body.newPin);
    }

    @Get('status')
    async status(@Request() req: any) {
        return this.pinService.hasPin(req.user.id);
    }
}

import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('debug/login')
  async debugLogin(@Body() body: { email: string; password: string }) {
    try {
      console.log('[DEBUG] Test login endpoint called:', { email: body.email });
      const user = await this.authService.validateUser(body.email, body.password);
      console.log('[DEBUG] validateUser result:', { hasUser: !!user });
      
      if (!user) {
        return { success: false, error: 'Invalid credentials', step: 'validateUser' };
      }
      
      const result = await this.authService.login(user);
      console.log('[DEBUG] login result:', { hasToken: !!result.access_token });
      return { success: true, result };
    } catch (error) {
      console.error('[DEBUG] Error in test login:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        errorName: error?.constructor?.name,
      };
    }
  }
}

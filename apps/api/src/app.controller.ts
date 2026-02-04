import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { EmailService } from './email/email.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) { }

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

  @Post('debug/test-email')
  async testEmail(@Body() body: { email: string; type?: string }) {
    const testEmail = body.email || 'test@example.com';
    const emailType = body.type || 'password-reset';

    try {
      console.log(`[DEBUG] Testing email: ${emailType} to ${testEmail}`);

      let result: any;

      switch (emailType) {
        case 'password-reset':
          result = await this.emailService.sendPasswordResetEmail(
            testEmail,
            'test-token-123',
            'Test User',
            'http://localhost:5173',
          );
          break;
        case 'verification':
          result = await this.emailService.sendEmailVerification(
            testEmail,
            'test-verification-token-123',
            'Test User',
            'http://localhost:5173',
          );
          break;
        case 'account-not-found':
          result = await this.emailService.sendAccountNotFoundEmail(testEmail);
          break;
        case 'password-changed':
          result = await this.emailService.sendPasswordResetConfirmation(
            testEmail,
            'Test User',
          );
          break;
        case 'admin-invitation':
          result = await this.emailService.sendAdminInvitationEmail(
            testEmail,
            'test-setup-token-123',
            'Test Admin',
          );
          break;
        case 'document-uploaded':
          result = await this.emailService.sendDocumentUploaded(
            testEmail,
            'Test Document.pdf',
            'Test User',
            'http://localhost:5173',
          );
          break;
        case 'client-invitation':
          result = await this.emailService.sendClientInvitationEmail(
            testEmail,
            'test-client-token-123',
            { name: 'Test Client', origin: 'http://localhost:5173' },
          );
          break;
        default:
          return {
            success: false,
            error: `Unknown email type: ${emailType}`,
            availableTypes: [
              'password-reset',
              'verification',
              'account-not-found',
              'password-changed',
              'admin-invitation',
              'document-uploaded',
              'client-invitation',
            ],
          };
      }

      return {
        success: true,
        emailType,
        to: testEmail,
        messageId: result?.messageId,
        response: result?.response,
      };
    } catch (error: any) {
      console.error('[DEBUG] Error testing email:', error);
      return {
        success: false,
        emailType,
        to: testEmail,
        error: error instanceof Error ? error.message : String(error),
        code: error?.code,
        command: error?.command,
        response: error?.response,
        stack: error instanceof Error ? error.stack : undefined,
      };
    }
  }

  @Get('debug/email-config')
  async getEmailConfig() {
    const hasSMTP = !!(
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.SMTP_HOST
    );

    return {
      smtpConfigured: hasSMTP,
      smtpHost: process.env.SMTP_HOST || 'not set',
      smtpPort: process.env.SMTP_PORT || '587 (default)',
      smtpUser: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 3)}***` : 'not set',
      smtpFrom: process.env.SMTP_FROM || 'not set',
      nodeEnv: process.env.NODE_ENV || 'development',
      mode: hasSMTP ? 'PRODUCTION (real emails)' : 'DEV (console only)',
    };
  }
}

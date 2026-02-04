import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private templatesPath: string;
  private isProductionMode: boolean;

  constructor() {
    // Set templates directory path
    // In compiled code, __dirname points to dist/src/email/
    // But templates are copied to dist/email/templates/
    // So we need to go up one level to dist/email/templates/
    const isCompiled = __dirname.includes('dist');
    if (isCompiled) {
      // Compiled: dist/src/email/ -> dist/email/templates/
      this.templatesPath = path.join(__dirname, '..', '..', 'email', 'templates');
    } else {
      // Development: src/email/ -> src/email/templates/
      this.templatesPath = path.join(__dirname, 'templates');
    }

    // Check if SMTP is configured
    const hasSMTPConfig =
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.SMTP_HOST;

    this.isProductionMode = !!hasSMTPConfig;

    // Configure email transporter
    if (!hasSMTPConfig) {
      // Development mode: log to console
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
      console.log('⚠️  [EmailService] DEV MODE - Emails will be logged to console');
      console.log('⚠️  [EmailService] To enable real emails, configure:');
      console.log('   - SMTP_USER');
      console.log('   - SMTP_PASSWORD');
      console.log('   - SMTP_HOST');
      console.log('   - SMTP_PORT (optional, default: 587)');
    } else {
      // Production mode: use SMTP
      const emailConfig = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        // Add connection timeout
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
      };

      this.transporter = nodemailer.createTransport(emailConfig);

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ [EmailService] SMTP connection failed:', error);
          console.error('❌ [EmailService] Check your SMTP configuration');
        } else {
          console.log('✅ [EmailService] SMTP connection verified');
          console.log(`📁 [EmailService] Templates: ${this.templatesPath}`);
        }
      });

      console.log('✅ [EmailService] Configured with SMTP');
      console.log(`   Host: ${process.env.SMTP_HOST}`);
      console.log(`   Port: ${process.env.SMTP_PORT || '587'}`);
      console.log(`   User: ${process.env.SMTP_USER}`);
    }
  }

  /**
   * Load and process email template
   * @param templateName Name of the template file (without .html extension)
   * @param variables Object with key-value pairs to replace in template
   * @returns Processed HTML string
   */
  private loadTemplate(
    templateName: string,
    variables: Record<string, string>,
  ): string {
    try {
      const templatePath = path.join(
        this.templatesPath,
        `${templateName}.html`,
      );

      if (!fs.existsSync(templatePath)) {
        console.error(`❌ [EmailService] Template not found: ${templatePath}`);
        throw new Error(`Template file not found: ${templateName}.html`);
      }

      let template = fs.readFileSync(templatePath, 'utf-8');

      // Replace all variables in format {{variableName}}
      Object.keys(variables).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, variables[key]);
      });

      return template;
    } catch (error) {
      console.error(`❌ [EmailService] Error loading template ${templateName}:`, error);
      throw new Error(`Failed to load email template: ${templateName}`);
    }
  }

  /**
   * Generate plain text version from HTML (basic conversion)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Send password reset email using template
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName?: string,
    origin?: string,
  ) {
    const baseUrl =
      origin ||
      process.env.ADMIN_URL ||
      process.env.CLIENT_URL ||
      'http://localhost:5173';
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

    try {
      const htmlContent = this.loadTemplate('password-reset', {
        userName: userName || 'there',
        resetUrl: resetUrl,
        userEmail: email,
        year: new Date().getFullYear().toString(),
      });

      const mailOptions = {
        from:
          process.env.SMTP_FROM || '"TrustTax Support" <noreply@trusttax.com>',
        to: email,
        subject: 'Password Reset Request - TrustTax',
        html: htmlContent,
        text: this.htmlToText(htmlContent),
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (!this.isProductionMode) {
        console.log('\n📧 [EmailService] PASSWORD RESET EMAIL (DEV MODE)');
        console.log('═══════════════════════════════════════════');
        console.log(`To: ${email}`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log('═══════════════════════════════════════════\n');
      } else {
        console.log(`✅ [EmailService] Password reset email sent to ${email}`);
        console.log(`📬 [EmailService] Message ID: ${info.messageId}`);
        console.log(`📬 [EmailService] Response: ${info.response || 'N/A'}`);

        // Verificar que realmente se envió
        if (!info.messageId) {
          console.warn('⚠️ [EmailService] Email sent but no messageId received');
        }
      }

      return info;
    } catch (error: any) {
      console.error('❌ [EmailService] Error sending password reset email:', {
        email,
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
      });
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  /**
   * Admin -> Client: Request a document upload for a specific order.
   */
  async sendOrderDocumentRequestEmail(
    email: string,
    data: {
      userName: string;
      orderId: string;
      orderDisplayId: string;
      documentName: string;
      message?: string;
      docType?: string;
      origin?: string;
    },
  ) {
    const baseUrl =
      data.origin ||
      process.env.CLIENT_URL ||
      process.env.ADMIN_URL ||
      'http://localhost:5175';

    const orderUrl = `${baseUrl}/dashboard/orders/${data.orderId}`;
    const messageBlock =
      data.message && data.message.trim().length > 0
        ? `<p style="margin: 12px 0 0 0; font-size: 14px; color: #334155; line-height: 20px;"><strong>Message:</strong> ${data.message}</p>`
        : '';

    try {
      const htmlContent = this.loadTemplate('document-request', {
        userName: data.userName || 'there',
        orderUrl,
        orderId: data.orderDisplayId || data.orderId,
        documentName: data.documentName,
        messageBlock,
        docType: data.docType || 'OTHER',
        year: new Date().getFullYear().toString(),
      });

      const mailOptions = {
        from:
          process.env.SMTP_FROM || '"TrustTax Support" <noreply@trusttax.com>',
        to: email,
        subject: `Action Required: Upload Document for Order #${data.orderDisplayId || data.orderId.slice(0, 8)}`,
        html: htmlContent,
        text: this.htmlToText(htmlContent),
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (!this.isProductionMode) {
        console.log('\n📧 [EmailService] DOCUMENT REQUEST EMAIL (DEV MODE)');
        console.log('═══════════════════════════════════════════');
        console.log(`To: ${email}`);
        console.log(`Order URL: ${orderUrl}`);
        console.log(`Document: ${data.documentName}`);
        console.log('═══════════════════════════════════════════\n');
      } else {
        console.log(`✅ [EmailService] Document request email sent to ${email}`);
        console.log(`📬 [EmailService] Message ID: ${info.messageId}`);
      }

      return info;
    } catch (error: any) {
      console.error(
        `❌ [EmailService] Error sending document request email to ${email}:`,
        error?.message || error,
      );
      throw error;
    }
  }

  /**
   * Send account not found email (marketing opportunity)
   */
  async sendAccountNotFoundEmail(email: string) {
    try {
      const htmlContent = this.loadTemplate('account-not-found', {
        userEmail: email,
        year: new Date().getFullYear().toString(),
      });

      const mailOptions = {
        from:
          process.env.SMTP_FROM || '"TrustTax Support" <noreply@trusttax.com>',
        to: email,
        subject: 'Account Not Found - TrustTax Services',
        html: htmlContent,
        text: this.htmlToText(htmlContent),
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (!this.isProductionMode) {
        console.log('\n📧 [EmailService] ACCOUNT NOT FOUND EMAIL (DEV MODE)');
        console.log('═══════════════════════════════════════════');
        console.log(`To: ${email}`);
        console.log('Message: Marketing email sent');
        console.log('═══════════════════════════════════════════\n');
      } else {
        console.log(`✅ [EmailService] Account not found email sent to ${email}`);
        console.log(`📬 [EmailService] Message ID: ${info.messageId}`);
      }

      return info;
    } catch (error: any) {
      console.error('❌ [EmailService] Error sending account not found email:', {
        email,
        error: error.message,
        code: error.code,
      });
      throw new Error(`Failed to send account not found email: ${error.message}`);
    }
  }

  /**
   * Send email verification email using template
   */
  async sendEmailVerification(
    email: string,
    verificationToken: string,
    userName?: string,
    origin?: string,
  ) {
    const verifyUrl = `${origin || process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;

    try {
      const htmlContent = this.loadTemplate('email-verification', {
        userName: userName || 'there',
        verifyUrl: verifyUrl,
        userEmail: email,
        year: new Date().getFullYear().toString(),
      });

      const mailOptions = {
        from:
          process.env.SMTP_FROM || '"TrustTax Support" <noreply@trusttax.com>',
        to: email,
        subject: 'Verify Your Email Address - TrustTax',
        html: htmlContent,
        text: this.htmlToText(htmlContent),
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (!this.isProductionMode) {
        console.log('\n📧 [EmailService] EMAIL VERIFICATION (DEV MODE)');
        console.log('═══════════════════════════════════════════');
        console.log(`To: ${email}`);
        console.log(`Verification URL: ${verifyUrl}`);
        console.log('═══════════════════════════════════════════\n');
      } else {
        console.log(`✅ [EmailService] Verification email sent to ${email}`);
        console.log(`📬 [EmailService] Message ID: ${info.messageId}`);
      }

      return info;
    } catch (error: any) {
      console.error('❌ [EmailService] Error sending verification email:', {
        email,
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
      });
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  /**
   * Send password reset confirmation email
   */
  async sendPasswordResetConfirmation(email: string, userName?: string) {
    try {
      const htmlContent = this.loadTemplate('password-changed', {
        userName: userName || 'there',
        userEmail: email,
        year: new Date().getFullYear().toString(),
      });

      const mailOptions = {
        from:
          process.env.SMTP_FROM || '"TrustTax Support" <noreply@trusttax.com>',
        to: email,
        subject: 'Password Changed Successfully - TrustTax',
        html: htmlContent,
        text: this.htmlToText(htmlContent),
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (!this.isProductionMode) {
        console.log('\n📧 [EmailService] PASSWORD CHANGED CONFIRMATION (DEV MODE)');
        console.log('═══════════════════════════════════════════');
        console.log(`To: ${email}`);
        console.log('Message: Password changed confirmation sent');
        console.log('═══════════════════════════════════════════\n');
      } else {
        console.log(`✅ [EmailService] Password changed confirmation sent to ${email}`);
        console.log(`📬 [EmailService] Message ID: ${info.messageId}`);
      }

      return info;
    } catch (error: any) {
      console.error('❌ [EmailService] Error sending password changed confirmation:', {
        email,
        error: error.message,
        code: error.code,
      });
      throw new Error(`Failed to send password changed confirmation: ${error.message}`);
    }
  }

  /**
   * Send admin invitation email
   */
  async sendAdminInvitationEmail(
    email: string,
    setupToken: string,
    userName?: string,
  ) {
    const setupUrl = `${process.env.ADMIN_URL || 'http://localhost:5174'}/reset-password/${setupToken}`;

    try {
      const htmlContent = this.loadTemplate('admin-invitation', {
        userName: userName || email,
        setupUrl: setupUrl,
        year: new Date().getFullYear().toString(),
      });

      const mailOptions = {
        from:
          process.env.SMTP_FROM || '"TrustTax Support" <noreply@trusttax.com>',
        to: email,
        subject: 'TrustTax Administration Panel Invitation',
        html: htmlContent,
        text: this.htmlToText(htmlContent),
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (!this.isProductionMode) {
        console.log('\n📧 [EmailService] ADMIN INVITATION (DEV MODE)');
        console.log('═══════════════════════════════════════════');
        console.log(`To: ${email}`);
        console.log(`Setup URL: ${setupUrl}`);
        console.log('═══════════════════════════════════════════\n');
      } else {
        console.log(`✅ [EmailService] Admin invitation sent to ${email}`);
        console.log(`📬 [EmailService] Message ID: ${info.messageId}`);
      }

      return info;
    } catch (error: any) {
      console.error('❌ [EmailService] Error sending admin invitation:', {
        email,
        error: error.message,
        code: error.code,
        command: error.command,
      });
      throw new Error(`Failed to send admin invitation: ${error.message}`);
    }
  }

  /**
   * Send PIN activation confirmation email (Security Alert)
   */
  async sendPinActivatedEmail(email: string, userName?: string) {
    try {
      const htmlContent = this.loadTemplate('pin-activated', {
        userName: userName || 'there',
        year: new Date().getFullYear().toString(),
      });

      const mailOptions = {
        from:
          process.env.SMTP_FROM || '"TrustTax Support" <noreply@trusttax.com>',
        to: email,
        subject: 'Security Alert: PIN Activated - TrustTax',
        html: htmlContent,
        text: this.htmlToText(htmlContent),
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (!this.isProductionMode) {
        console.log('\n📧 [EmailService] PIN ACTIVATED ALERT (DEV MODE)');
        console.log('═══════════════════════════════════════════');
        console.log(`To: ${email}`);
        console.log('Message: Security PIN activated alert sent');
        console.log('═══════════════════════════════════════════\n');
      } else {
        console.log(`✅ [EmailService] PIN activated alert sent to ${email}`);
        console.log(`📬 [EmailService] Message ID: ${info.messageId}`);
      }

      return info;
    } catch (error: any) {
      console.error('❌ [EmailService] Error sending PIN activation email:', {
        email,
        error: error.message,
        code: error.code,
      });
      // Don't throw here to avoid blocking the API response if email fails
    }
  }

  /**
   * Send document uploaded notification
   */
  async sendDocumentUploaded(
    email: string,
    documentTitle: string,
    userName?: string,
    origin?: string,
  ) {
    const actionUrl = `${origin || process.env.CLIENT_URL || 'http://localhost:5173'}/documents`;

    try {
      const htmlContent = this.loadTemplate('document-uploaded', {
        userName: userName || 'Customer',
        documentTitle: documentTitle,
        itemType: 'document',
        actionUrl: actionUrl,
        uploadDate: new Date().toLocaleDateString(),
        year: new Date().getFullYear().toString(),
      });

      const mailOptions = {
        from:
          process.env.SMTP_FROM || '"TrustTax Support" <noreply@trusttax.com>',
        to: email,
        subject: 'New Document Available - TrustTax',
        html: htmlContent,
        text: this.htmlToText(htmlContent),
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (!this.isProductionMode) {
        console.log('\n📧 [EmailService] DOCUMENT UPLOADED NOTIFICATION (DEV MODE)');
        console.log('═══════════════════════════════════════════');
        console.log(`To: ${email}`);
        console.log(`Document: ${documentTitle}`);
        console.log(`Action URL: ${actionUrl}`);
        console.log('═══════════════════════════════════════════\n');
      } else {
        console.log(`✅ [EmailService] Document notification sent to ${email}`);
        console.log(`📬 [EmailService] Message ID: ${info.messageId}`);
      }

      return info;
    } catch (error: any) {
      console.error('❌ [EmailService] Error sending document notification:', {
        email,
        documentTitle,
        error: error.message,
        code: error.code,
      });
      // Don't block upload if email fails
    }
  }
}

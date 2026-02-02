import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private templatesPath: string;

  constructor() {
    // Set templates directory path
    this.templatesPath = path.join(__dirname, 'templates');

    // Configure email transporter
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    };

    // If no SMTP credentials, use console logging for development
    if (!process.env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
      console.log(
        '⚠️  Email service in DEV mode - emails will be logged to console',
      );
    } else {
      this.transporter = nodemailer.createTransport(emailConfig);
      console.log('✅ Email service configured with SMTP');
      console.log(`📁 Email templates loaded from: ${this.templatesPath}`);
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
      let template = fs.readFileSync(templatePath, 'utf-8');

      // Replace all variables in format {{variableName}}
      Object.keys(variables).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, variables[key]);
      });

      return template;
    } catch (error) {
      console.error(`❌ Error loading template ${templateName}:`, error);
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

    try {
      const info = await this.transporter.sendMail(mailOptions);

      // Log to console in dev mode
      if (!process.env.SMTP_USER) {
        console.log('\n📧 PASSWORD RESET EMAIL (DEV MODE)');
        console.log('═══════════════════════════════════════════');
        console.log(`To: ${email}`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log('═══════════════════════════════════════════\n');
      } else {
        console.log(`✅ Password reset email sent to ${email}`);
        console.log(`📬 SMTP Response: ${info.response}`);
        console.log(`🆔 Message ID: ${info.messageId}`);
      }

      return info;
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send account not found email (marketing opportunity)
   */
  async sendAccountNotFoundEmail(email: string) {
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

    try {
      const info = await this.transporter.sendMail(mailOptions);

      // Log to console in dev mode
      if (!process.env.SMTP_USER) {
        console.log('\n📧 ACCOUNT NOT FOUND EMAIL (DEV MODE)');
        console.log('═══════════════════════════════════════════');
        console.log(`To: ${email}`);
        console.log('Message: Marketing email sent');
        console.log('═══════════════════════════════════════════\n');
      } else {
        console.log(`✅ Account not found email (marketing) sent to ${email}`);
        console.log(`📬 SMTP Response: ${info.response}`);
        console.log(`🆔 Message ID: ${info.messageId}`);
      }

      return info;
    } catch (error) {
      console.error('❌ Error sending account not found email:', error);
      throw new Error('Failed to send account not found email');
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

    try {
      const info = await this.transporter.sendMail(mailOptions);

      // Log to console in dev mode
      if (!process.env.SMTP_USER) {
        console.log('\n📧 EMAIL VERIFICATION (DEV MODE)');
        console.log('═══════════════════════════════════════════');
        console.log(`To: ${email}`);
        console.log(`Verification URL: ${verifyUrl}`);
        console.log('═══════════════════════════════════════════\n');
      } else {
        console.log(`✅ Verification email sent to ${email}`);
        console.log(`📬 SMTP Response: ${info.response}`);
        console.log(`🆔 Message ID: ${info.messageId}`);
      }

      return info;
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send password reset confirmation email
   */
  async sendPasswordResetConfirmation(email: string, userName?: string) {
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

    try {
      const info = await this.transporter.sendMail(mailOptions);

      // Log to console in dev mode
      if (!process.env.SMTP_USER) {
        console.log('\n📧 PASSWORD CHANGED CONFIRMATION (DEV MODE)');
        console.log('═══════════════════════════════════════════');
        console.log(`To: ${email}`);
        console.log('Message: Password changed confirmation sent');
        console.log('═══════════════════════════════════════════\n');
      } else {
        console.log(`✅ Password changed confirmation sent to ${email}`);
        console.log(`📬 SMTP Response: ${info.response}`);
        console.log(`🆔 Message ID: ${info.messageId}`);
      }

      return info;
    } catch (error) {
      console.error('❌ Error sending password changed confirmation:', error);
      throw new Error('Failed to send password changed confirmation');
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

    try {
      const info = await this.transporter.sendMail(mailOptions);

      // Log to console in dev mode
      if (!process.env.SMTP_USER) {
        console.log('\n📧 ADMIN INVITATION (DEV MODE)');
        console.log('═══════════════════════════════════════════');
        console.log(`To: ${email}`);
        console.log(`Setup URL: ${setupUrl}`);
        console.log('═══════════════════════════════════════════\n');
      } else {
        console.log(`✅ Admin invitation sent to ${email}`);
        console.log(`📬 SMTP Response: ${info.response}`);
        console.log(`🆔 Message ID: ${info.messageId}`);
      }

      return info;
    } catch (error) {
      console.error('❌ Error sending admin invitation:', error);
      throw new Error('Failed to send admin invitation');
    }
  }

  /**
   * Send PIN activation confirmation email (Security Alert)
   */
  async sendPinActivatedEmail(email: string, userName?: string) {
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

    try {
      const info = await this.transporter.sendMail(mailOptions);

      // Log to console in dev mode
      if (!process.env.SMTP_USER) {
        console.log('\n📧 PIN ACTIVATED ALERT (DEV MODE)');
        console.log('═══════════════════════════════════════════');
        console.log(`To: ${email}`);
        console.log('Message: Security PIN activated alert sent');
        console.log('═══════════════════════════════════════════\n');
      } else {
        console.log(`✅ PIN activated alert sent to ${email}`);
        console.log(`📬 SMTP Response: ${info.response}`);
        console.log(`🆔 Message ID: ${info.messageId}`);
      }

      return info;
    } catch (error) {
      console.error('❌ Error sending PIN activation email:', error);
      // Don't throw here to avoid blocking the API response if email fails
      // Just log the error
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
    // Direct to documents page
    const actionUrl = `${origin || process.env.CLIENT_URL || 'http://localhost:5173'}/documents`;

    const htmlContent = this.loadTemplate('document-uploaded', {
      userName: userName || 'Customer',
      documentTitle: documentTitle,
      itemType: 'document', // For tracking
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

    try {
      const info = await this.transporter.sendMail(mailOptions);

      if (!process.env.SMTP_USER) {
        console.log('\n📧 DOCUMENT UPLOADED NOTIFICATION (DEV MODE)');
        console.log('═══════════════════════════════════════════');
        console.log(`To: ${email}`);
        console.log(`Document: ${documentTitle}`);
        console.log(`Action URL: ${actionUrl}`);
        console.log('═══════════════════════════════════════════\n');
      } else {
        console.log(`✅ Document notification sent to ${email}`);
      }

      return info;
    } catch (error) {
      console.error('❌ Error sending document notification:', error);
      // Don't block upload if email fails
    }
  }
}

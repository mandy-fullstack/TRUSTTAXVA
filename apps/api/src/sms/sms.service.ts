import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class SMSService {
  private readonly logger = new Logger(SMSService.name);
  private readonly ringCentralClientId = process.env.RINGCENTRAL_CLIENT_ID;
  private readonly ringCentralClientSecret =
    process.env.RINGCENTRAL_CLIENT_SECRET;
  private readonly ringCentralAccountId = process.env.RINGCENTRAL_ACCOUNT_ID;
  private readonly ringCentralExtensionId =
    process.env.RINGCENTRAL_EXTENSION_ID;
  private readonly ringCentralPhoneNumber =
    process.env.RINGCENTRAL_PHONE_NUMBER;
  private readonly ringCentralApiUrl =
    process.env.RINGCENTRAL_API_URL || 'https://platform.ringcentral.com';
  private readonly ringCentralJWT = process.env.RINGCENTRAL_JWT_NOT_EXPIRED;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private prisma: PrismaService) {}

  /**
   * Authenticate with RingCentral using JWT token
   * Exchanges JWT for access token using Basic Auth
   * Only uses JWT for security - never uses account_id
   */
  private async authenticate(): Promise<string> {
    // Check if we have a valid cached access token
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken as string;
    }

    // Use JWT token exclusively for security
    if (!this.ringCentralJWT) {
      throw new Error(
        'RingCentral JWT token not configured. Please set RINGCENTRAL_JWT_NOT_EXPIRED',
      );
    }

    if (!this.ringCentralClientId || !this.ringCentralClientSecret) {
      throw new Error(
        'RingCentral client credentials not configured. Please set RINGCENTRAL_CLIENT_ID and RINGCENTRAL_CLIENT_SECRET',
      );
    }

    try {
      // Exchange JWT for access token using Basic Auth
      const basicAuth = Buffer.from(
        `${this.ringCentralClientId}:${this.ringCentralClientSecret}`,
      ).toString('base64');

      const response = await axios.post(
        `${this.ringCentralApiUrl}/restapi/oauth/token`,
        new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: this.ringCentralJWT,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${basicAuth}`,
          },
        },
      );

      // Cache the access token
      const accessToken = response.data.access_token;
      if (!accessToken) {
        throw new Error('No access token received from RingCentral');
      }
      this.accessToken = accessToken;
      const expiresIn = response.data.expires_in || 3600;
      this.tokenExpiry = new Date(Date.now() + (expiresIn - 300) * 1000); // Refresh 5 min before expiry

      this.logger.log(
        'Successfully authenticated with RingCentral using JWT (exchanged for access token)',
      );
      return accessToken;
    } catch (error: any) {
      this.logger.error(
        'Failed to authenticate with RingCentral using JWT',
        error.response?.data || error.message,
      );
      throw new Error(
        'Failed to exchange JWT for access token. Please verify RINGCENTRAL_JWT_NOT_EXPIRED is valid.',
      );
    }
  }

  /**
   * Send SMS message via RingCentral
   */
  async sendSMS(to: string, message: string, userId?: string): Promise<void> {
    if (!this.ringCentralPhoneNumber) {
      throw new Error('RingCentral phone number not configured');
    }

    // Normalize phone number (remove non-digits, ensure +1 prefix for US)
    const normalizedPhone = this.normalizePhoneNumber(to);

    try {
      const token = await this.authenticate();

      // Use ~ for account and extension (JWT handles authentication, no account_id needed)
      const response = await axios.post(
        `${this.ringCentralApiUrl}/restapi/v1.0/account/~/extension/~/sms`,
        {
          from: { phoneNumber: this.ringCentralPhoneNumber },
          to: [{ phoneNumber: normalizedPhone }],
          text: message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`SMS sent successfully to ${normalizedPhone}`);

      // Log SMS in database if userId provided
      if (userId) {
        await this.logSMSMessage(
          userId,
          normalizedPhone,
          message,
          'sent',
          response.data.id,
        );
      }
    } catch (error: any) {
      this.logger.error(
        'Failed to send SMS',
        error.response?.data || error.message,
      );

      // Log failed attempt
      if (userId) {
        await this.logSMSMessage(
          userId,
          normalizedPhone,
          message,
          'failed',
          null,
          error.message,
        );
      }

      throw new Error('Failed to send SMS message');
    }
  }

  /**
   * Opt-in user to SMS messages
   */
  async optInSMS(userId: string, phoneNumber: string): Promise<void> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    // Update user's SMS consent
    await this.prisma.client.user.update({
      where: { id: userId },
      data: {
        phone: normalizedPhone,
        smsConsent: true,
        smsConsentDate: new Date(),
        smsConsentVersion: '2026.1',
      },
    });

    this.logger.log(`User ${userId} opted in to SMS messages`);

    // Send confirmation SMS
    try {
      await this.sendSMS(
        normalizedPhone,
        'You have successfully opted in to receive SMS messages from TrustTax. Reply STOP to opt-out. Message and data rates may apply.',
        userId,
      );
    } catch (error) {
      // Log error but don't fail the opt-in
      this.logger.warn('Failed to send opt-in confirmation SMS', error);
    }
  }

  /**
   * Opt-out user from SMS messages
   */
  async optOutSMS(userId: string): Promise<void> {
    await this.prisma.client.user.update({
      where: { id: userId },
      data: {
        smsConsent: false,
        smsOptOutDate: new Date(),
      },
    });

    this.logger.log(`User ${userId} opted out of SMS messages`);
  }

  /**
   * Check if user has SMS consent
   */
  async hasSMSConsent(userId: string): Promise<boolean> {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { smsConsent: true },
    });

    return user?.smsConsent || false;
  }

  /**
   * Log SMS message in database
   */
  private async logSMSMessage(
    userId: string,
    phoneNumber: string,
    message: string,
    status: 'sent' | 'failed',
    externalId?: string | null,
    errorMessage?: string,
  ): Promise<void> {
    // Note: This assumes you have an SMS log table in your database
    // If not, you may want to create one or use a different logging mechanism
    try {
      // You can create an SMS log table in Prisma schema if needed
      // For now, we'll just log to console
      this.logger.log(`SMS ${status} for user ${userId} to ${phoneNumber}`);
    } catch (error) {
      this.logger.error('Failed to log SMS message', error);
    }
  }

  /**
   * Normalize phone number to E.164 format
   */
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let digits = phone.replace(/\D/g, '');

    // If it's 10 digits, assume US number and add +1
    if (digits.length === 10) {
      return `+1${digits}`;
    }

    // If it's 11 digits and starts with 1, add +
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }

    // If it already starts with +, return as is
    if (phone.startsWith('+')) {
      return phone.replace(/\D/g, '').replace(/^/, '+');
    }

    // Default: assume US number
    return `+1${digits.slice(-10)}`;
  }

  /**
   * Send order status update SMS
   */
  async sendOrderStatusUpdate(
    userId: string,
    orderId: string,
    status: string,
  ): Promise<void> {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { phone: true, smsConsent: true },
    });

    if (!user?.smsConsent || !user.phone) {
      return; // User hasn't opted in or doesn't have a phone number
    }

    const message = `Your order #${orderId} status has been updated to: ${status}. Check your dashboard for details. Reply STOP to opt-out.`;

    await this.sendSMS(user.phone, message, userId);
  }

  /**
   * Send appointment reminder SMS
   */
  async sendAppointmentReminder(
    userId: string,
    appointmentDate: Date,
    appointmentType: string,
  ): Promise<void> {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { phone: true, smsConsent: true },
    });

    if (!user?.smsConsent || !user.phone) {
      return;
    }

    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const message = `Reminder: You have a ${appointmentType} appointment on ${formattedDate}. Reply STOP to opt-out.`;

    await this.sendSMS(user.phone, message, userId);
  }

  /**
   * Send security alert SMS
   */
  async sendSecurityAlert(
    userId: string,
    alertType: string,
    details?: string,
  ): Promise<void> {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { phone: true, smsConsent: true },
    });

    if (!user?.smsConsent || !user.phone) {
      return;
    }

    const message = `Security Alert: ${alertType}${details ? ` - ${details}` : ''}. If this wasn't you, please contact us immediately. Reply STOP to opt-out.`;

    await this.sendSMS(user.phone, message, userId);
  }
}

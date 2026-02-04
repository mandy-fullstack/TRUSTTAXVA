import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import * as crypto from 'crypto';

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

    constructor(private prisma: PrismaService) { }

    private readonly otpSecret =
        process.env.SMS_OTP_SECRET ||
        process.env.JWT_SECRET ||
        'dev_sms_otp_secret_change_me';

    private hashOtp(code: string): string {
        return crypto
            .createHash('sha256')
            .update(`${code}:${this.otpSecret}`)
            .digest('hex');
    }

    private generateOtpCode(): string {
        // 6-digit numeric code
        const n = crypto.randomInt(0, 1000000);
        return n.toString().padStart(6, '0');
    }

    async startSmsOtp(phoneNumber: string, purpose: string = 'REGISTRATION') {
        const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

        // Basic rate limit: max 3 OTPs per phone per 10 minutes
        const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
        const recentCount = await (this.prisma.client as any).smsOtpSession.count({
            where: {
                phone: normalizedPhone,
                createdAt: { gt: tenMinAgo },
            },
        });
        if (recentCount >= 3) {
            throw new HttpException(
                'Too many OTP requests. Please wait and try again.',
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        const code = this.generateOtpCode();
        const codeHash = this.hashOtp(code);
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await (this.prisma.client as any).smsOtpSession.create({
            data: {
                id: sessionId,
                phone: normalizedPhone,
                codeHash,
                purpose,
                attempts: 0,
                expiresAt,
            },
        });

        // Send OTP SMS (include HELP/STOP language + rates disclosure)
        try {
            const baseUrl = process.env.CLIENT_URL || 'http://localhost:5175';
            const privacyUrl = `${baseUrl}/legal/privacy`;
            const smsConsentUrl = `${baseUrl}/legal/sms-consent`;

            await this.sendSMS(
                normalizedPhone,
                `TrustTax verification code: ${code}. Expires in 10 minutes. Msg frequency varies. Msg&data rates may apply. Reply STOP to opt-out, HELP for help. Privacy: ${privacyUrl} SMS Policy: ${smsConsentUrl}`,
            );
        } catch (e) {
            // If SMS fails, delete the session to prevent dead sessions
            await (this.prisma.client as any).smsOtpSession.delete({
                where: { id: sessionId },
            });
            throw e;
        }

        return { sessionId, expiresAt };
    }

    async verifySmsOtp(sessionId: string, code: string) {
        if (!sessionId || !code) {
            throw new BadRequestException('sessionId and code are required');
        }

        const session = await (this.prisma.client as any).smsOtpSession.findUnique({
            where: { id: sessionId },
        });
        if (!session) throw new NotFoundException('OTP session not found');

        if (session.verifiedAt) {
            return { verified: true };
        }

        if (new Date(session.expiresAt).getTime() < Date.now()) {
            throw new BadRequestException('OTP code expired');
        }

        if (session.attempts >= 5) {
            throw new HttpException('Too many attempts', HttpStatus.TOO_MANY_REQUESTS);
        }

        const ok = this.hashOtp(code) === session.codeHash;
        if (!ok) {
            await (this.prisma.client as any).smsOtpSession.update({
                where: { id: sessionId },
                data: { attempts: { increment: 1 } },
            });
            throw new BadRequestException('Invalid OTP code');
        }

        await (this.prisma.client as any).smsOtpSession.update({
            where: { id: sessionId },
            data: { verifiedAt: new Date() },
        });

        return { verified: true };
    }

    async consumeVerifiedOtp(sessionId: string, phoneNumber: string) {
        const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
        const session = await (this.prisma.client as any).smsOtpSession.findUnique({
            where: { id: sessionId },
        });
        if (!session) throw new NotFoundException('OTP session not found');

        if (!session.verifiedAt) {
            throw new BadRequestException('OTP session not verified');
        }
        if (new Date(session.expiresAt).getTime() < Date.now()) {
            throw new BadRequestException('OTP session expired');
        }
        if (session.phone !== normalizedPhone) {
            throw new BadRequestException('OTP session phone mismatch');
        }

        // One-time use
        await (this.prisma.client as any).smsOtpSession.delete({
            where: { id: sessionId },
        });
        return true;
    }

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
    async optInSMS(
        userId: string,
        phoneNumber: string,
        otpSessionId?: string,
    ): Promise<void> {
        const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

        // If OTP session is provided, enforce verification
        if (otpSessionId) {
            await this.consumeVerifiedOtp(otpSessionId, normalizedPhone);
        }

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
            const baseUrl = process.env.CLIENT_URL || 'http://localhost:5175';
            const privacyUrl = `${baseUrl}/legal/privacy`;
            await this.sendSMS(
                normalizedPhone,
                `TrustTax SMS: You are opted in. Msg frequency varies. Msg&data rates may apply. Reply STOP to opt-out, HELP for help. Privacy: ${privacyUrl}`,
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
     * Accepts E.164 format (e.g., +15401234567) or various other formats
     */
    private normalizePhoneNumber(phone: string): string {
        if (!phone || !phone.trim()) {
            throw new Error('Phone number is required');
        }

        // If it already starts with +, it's likely E.164 format
        // Clean it but preserve the + and country code
        if (phone.startsWith('+')) {
            // Remove spaces, dashes, parentheses but keep + and digits
            const cleaned = phone.replace(/[\s\-()]/g, '');
            // Validate it has at least country code + number (min 8 chars: +1234567)
            if (cleaned.length >= 8 && /^\+[1-9]\d{6,14}$/.test(cleaned)) {
                return cleaned;
            }
        }

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

        // If it's 11 digits but doesn't start with 1, assume it's a US number with leading 1
        if (digits.length === 11) {
            return `+${digits}`;
        }

        // Default: assume US number (take last 10 digits)
        if (digits.length > 10) {
            return `+1${digits.slice(-10)}`;
        }

        // If less than 10 digits, assume US and pad or return as is
        return `+1${digits}`;
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

import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class TwoFactorService {
    // Encryption key from environment (fallback for development)
    private readonly encryptionKey = process.env.ENCRYPTION_KEY || 'dev-key-32-characters-long!!!';

    /**
     * Generate a new TOTP secret for a user
     */
    generateSecret(userEmail: string) {
        const secret = speakeasy.generateSecret({
            name: `TrustTax Admin (${userEmail})`,
            issuer: 'TrustTax',
            length: 32,
        });

        return {
            secret: secret.base32!,
            otpauth_url: secret.otpauth_url!,
        };
    }

    /**
     * Generate QR code as data URL
     */
    async generateQRCode(otpauth_url: string): Promise<string> {
        try {
            return await QRCode.toDataURL(otpauth_url);
        } catch (error) {
            console.error('QR code generation error:', error);
            throw new Error('Failed to generate QR code');
        }
    }

    /**
     * Verify a TOTP token
     */
    verifyToken(secret: string, token: string): boolean {
        return speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: 2, // Allow 2 time steps before/after (±1 minute tolerance)
        });
    }

    /**
     * Generate backup codes
     */
    generateBackupCodes(count: number = 10): string[] {
        const codes: string[] = [];
        for (let i = 0; i < count; i++) {
            // Generate 8-character alphanumeric code
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            codes.push(code);
        }
        return codes;
    }

    /**
     * Encrypt secret before storing in database
     */
    encryptSecret(secret: string): string {
        try {
            const algorithm = 'aes-256-cbc';
            const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
            const iv = crypto.randomBytes(16);

            const cipher = crypto.createCipheriv(algorithm, key, iv);
            let encrypted = cipher.update(secret, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            // Prepend IV to encrypted data
            return iv.toString('hex') + ':' + encrypted;
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt secret');
        }
    }

    /**
     * Decrypt secret from database
     */
    decryptSecret(encryptedSecret: string): string {
        try {
            const algorithm = 'aes-256-cbc';
            const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);

            // Extract IV and encrypted data
            const parts = encryptedSecret.split(':');
            const iv = Buffer.from(parts[0], 'hex');
            const encrypted = parts[1];

            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt secret');
        }
    }
}

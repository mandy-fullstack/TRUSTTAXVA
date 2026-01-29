import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Professional encryption service using AES-256-GCM
 * This service encrypts sensitive user data (SSN, driver license, passport)
 * before storing in the database.
 * 
 * Uses AES-256-GCM which provides:
 * - Authenticated encryption (prevents tampering)
 * - High security (256-bit key)
 * - Industry standard algorithm
 */
@Injectable()
export class EncryptionService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly keyLength = 32; // 256 bits
    private readonly ivLength = 16; // 128 bits
    private readonly saltLength = 64;
    private readonly tagLength = 16;
    private readonly iterations = 100000; // PBKDF2 iterations

    /**
     * Get encryption key from environment variable
     * Falls back to a default for development (MUST be changed in production)
     */
    private getEncryptionKey(): Buffer {
        const keyMaterial = process.env.ENCRYPTION_KEY;

        if (!keyMaterial || keyMaterial.length < 32) {
            throw new Error('ENCRYPTION_KEY must be configured and at least 32 characters long');
        }

        // Derive a consistent key from the material using PBKDF2
        return crypto.pbkdf2Sync(
            keyMaterial,
            'trusttax-salt', // Salt for key derivation
            this.iterations,
            this.keyLength,
            'sha256'
        );
    }

    /**
     * Encrypt sensitive data
     * Returns: base64(IV + Salt + Tag + EncryptedData)
     */
    encrypt(plaintext: string): string | null {
        if (!plaintext) {
            return null;
        }

        try {
            const key = this.getEncryptionKey();
            const iv = crypto.randomBytes(this.ivLength);
            const salt = crypto.randomBytes(this.saltLength);

            const cipher = crypto.createCipheriv(this.algorithm, key, iv);

            let encrypted = cipher.update(plaintext, 'utf8');
            encrypted = Buffer.concat([encrypted, cipher.final()]);

            const tag = cipher.getAuthTag();

            // Combine: IV + Salt + Tag + EncryptedData
            const combined = Buffer.concat([
                iv,
                salt,
                tag,
                encrypted
            ]);

            return combined.toString('base64');
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt sensitive data');
        }
    }

    /**
     * Decrypt sensitive data
     * Input: base64(IV + Salt + Tag + EncryptedData)
     */
    decrypt(encryptedData: string): string | null {
        if (!encryptedData) {
            return null;
        }

        try {
            const key = this.getEncryptionKey();
            const combined = Buffer.from(encryptedData, 'base64');

            // Extract components
            const iv = combined.subarray(0, this.ivLength);
            const salt = combined.subarray(this.ivLength, this.ivLength + this.saltLength);
            const tag = combined.subarray(
                this.ivLength + this.saltLength,
                this.ivLength + this.saltLength + this.tagLength
            );
            const encrypted = combined.subarray(this.ivLength + this.saltLength + this.tagLength);

            const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
            decipher.setAuthTag(tag);

            let decrypted = decipher.update(encrypted);
            decrypted = Buffer.concat([decrypted, decipher.final()]);

            return decrypted.toString('utf8');
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt sensitive data');
        }
    }

    /**
     * Encrypt a Buffer (for files/photos)
     * Returns: Buffer(IV + Salt + Tag + EncryptedData)
     */
    encryptBuffer(buffer: Buffer): Buffer {
        try {
            const key = this.getEncryptionKey();
            const iv = crypto.randomBytes(this.ivLength);
            const salt = crypto.randomBytes(this.saltLength);

            const cipher = crypto.createCipheriv(this.algorithm, key, iv);

            let encrypted = cipher.update(buffer);
            encrypted = Buffer.concat([encrypted, cipher.final()]);

            const tag = cipher.getAuthTag();

            // Combine: IV + Salt + Tag + EncryptedData
            return Buffer.concat([iv, salt, tag, encrypted]);
        } catch (error) {
            console.error('Buffer encryption error:', error);
            throw new Error('Failed to encrypt file buffer');
        }
    }

    /**
     * Decrypt an encrypted Buffer
     * Input: Buffer(IV + Salt + Tag + EncryptedData)
     */
    decryptBuffer(encryptedBuffer: Buffer): Buffer {
        try {
            const key = this.getEncryptionKey();

            // Extract components
            const iv = encryptedBuffer.subarray(0, this.ivLength);
            const salt = encryptedBuffer.subarray(this.ivLength, this.ivLength + this.saltLength);
            const tag = encryptedBuffer.subarray(
                this.ivLength + this.saltLength,
                this.ivLength + this.saltLength + this.tagLength
            );
            const encrypted = encryptedBuffer.subarray(this.ivLength + this.saltLength + this.tagLength);

            const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
            decipher.setAuthTag(tag);

            let decrypted = decipher.update(encrypted);
            decrypted = Buffer.concat([decrypted, decipher.final()]);

            return decrypted;
        } catch (error) {
            console.error('Buffer decryption error:', error);
            throw new Error('Failed to decrypt file buffer');
        }
    }

    /**
     * Extract last 4 digits from SSN for display purposes
     * Format: XXX-XX-1234 -> returns "1234"
     */
    extractSSNLast4(ssn: string): string | null {
        if (!ssn) return null;

        // Remove all non-digits
        const digits = ssn.replace(/\D/g, '');

        if (digits.length < 4) return null;

        // Return last 4 digits
        return digits.slice(-4);
    }

    /**
     * Mask SSN for display (shows only last 4)
     * Format: XXX-XX-1234
     */
    maskSSN(ssn: string): string | null {
        if (!ssn) return null;

        const digits = ssn.replace(/\D/g, '');
        if (digits.length !== 9) return null;

        return `XXX-XX-${digits.slice(-4)}`;
    }

    /**
     * Extract last 4 characters from driver license number for display
     */
    extractLicenseLast4(licenseNumber: string): string | null {
        if (!licenseNumber) return null;
        if (licenseNumber.length < 4) return null;
        return licenseNumber.slice(-4);
    }

    /**
     * Mask driver license for display (shows only last 4)
     * Format: ••••1234
     */
    maskDriverLicense(licenseNumber: string): string | null {
        if (!licenseNumber) return null;
        if (licenseNumber.length < 4) return '••••';
        return `••••${licenseNumber.slice(-4)}`;
    }

    /**
     * Extract last 4 characters from passport number for display
     */
    extractPassportLast4(passportNumber: string): string | null {
        if (!passportNumber) return null;
        if (passportNumber.length < 4) return null;
        return passportNumber.slice(-4);
    }

    /**
     * Mask passport for display (shows only last 4)
     * Format: ••••1234
     */
    maskPassport(passportNumber: string): string | null {
        if (!passportNumber) return null;
        if (passportNumber.length < 4) return '••••';
        return `••••${passportNumber.slice(-4)}`;
    }
}

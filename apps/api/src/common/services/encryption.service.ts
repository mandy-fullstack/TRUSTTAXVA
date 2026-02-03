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
            throw new Error(
                'ENCRYPTION_KEY must be configured and at least 32 characters long',
            );
        }

        // Derive a consistent key from the material using PBKDF2
        return crypto.pbkdf2Sync(
            keyMaterial,
            'trusttax-salt', // Salt for key derivation
            this.iterations,
            this.keyLength,
            'sha256',
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
            const combined = Buffer.concat([iv, salt, tag, encrypted]);

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
            // Salt is extracted but not used in decryption (it's only used in key derivation)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const salt = combined.subarray(
                this.ivLength,
                this.ivLength + this.saltLength,
            );
            const tag = combined.subarray(
                this.ivLength + this.saltLength,
                this.ivLength + this.saltLength + this.tagLength,
            );
            const encrypted = combined.subarray(
                this.ivLength + this.saltLength + this.tagLength,
            );

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
            // Salt is extracted but not used in decryption (it's only used in key derivation)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const salt = encryptedBuffer.subarray(
                this.ivLength,
                this.ivLength + this.saltLength,
            );
            const tag = encryptedBuffer.subarray(
                this.ivLength + this.saltLength,
                this.ivLength + this.saltLength + this.tagLength,
            );
            const encrypted = encryptedBuffer.subarray(
                this.ivLength + this.saltLength + this.tagLength,
            );

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
     * Encrypt sensitive fields within an object (e.g., formData)
     *
     * This method encrypts PII (Personally Identifiable Information) and financial data
     * according to professional tax security standards (IRS Publication 4557, SOC 2).
     *
     * Fields encrypted:
     * - SSN/ITIN numbers (taxpayer, spouse, dependents)
     * - Bank account information (routing, account numbers)
     * - Employer Identification Numbers (EIN)
     * - State identification numbers
     * - Complete addresses (street, apartment, city, state, zip)
     * - Dates of birth (PII)
     * - Full names in tax context (PII)
     * - Financial amounts (wages, withholdings, benefits)
     * - Employer/provider information
     *
     * This method recursively processes nested objects and arrays
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    encryptSensitiveFields(data: any): any {
        if (!data || typeof data !== 'object') return data;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = Array.isArray(data) ? [...data] : { ...data };
        const sensitiveFields = [
            // === SSN/ITIN Identification Numbers ===
            'ssn',
            'ssnOrItin', // Dependents SSN/ITIN
            'taxpayerSsnMasked',
            'taxpayerSsnConfirm',

            // === Bank Account Information ===
            'routingNumber',
            'accountNumber',

            // === Employer Identification Numbers (EIN) ===
            'ein',
            'employerEin',
            'childcareEin', // Childcare provider EIN

            // === State Identification Numbers ===
            'stateIdNumber', // State ID from W-2
            'controlNumber', // W-2 control number

            // === Address Information (PII) ===
            'street',
            'apartment',
            'address', // Full address string
            'employerAddress', // Employer address from W-2
            'childcareAddress', // Childcare provider address

            // === Dates of Birth (PII) ===
            'dateOfBirth',

            // === Full Names in Tax Context (PII) ===
            'taxpayerName', // Full name from W-2
            'firstName', // When in tax context (dependents, spouse)
            'lastName', // When in tax context
            'middleName', // When in tax context
            'childcareProvider', // Provider name

            // === Financial Information ===
            'wages',
            'federalWithholding',
            'socialSecurityWages',
            'socialSecurityWithheld',
            'medicareWages',
            'medicareWithheld',
            'socialSecurityTips',
            'allocatedTips',
            'dependentCareBenefits',
            'nonqualifiedPlans',
            'stateWages',
            'stateWithholding',
            'localWages',
            'localTax',
            'childcareAmount',

            // === Employer Information (PII) ===
            'employerName',
        ];

        for (const key in result) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const value = result[key];

            // Handle string fields
            if (sensitiveFields.includes(key)) {
                if (typeof value === 'string' && value.length > 0) {
                    // If it's already encrypted (starts with base64 pattern and is long), skip
                    if (value.length > 40 && /^[a-zA-Z0-9+/=]+$/.test(value)) continue;
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    result[key] = this.encrypt(value);
                } else if (
                    typeof value === 'number' &&
                    (key.includes('wages') ||
                        key.includes('withholding') ||
                        key.includes('amount') ||
                        key.includes('benefits') ||
                        key.includes('tax'))
                ) {
                    // Encrypt financial amounts as strings
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    result[key] = this.encrypt(value.toString());
                }
            }
            // Handle nested objects and arrays (recursive)
            else if (typeof value === 'object' && value !== null) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                result[key] = this.encryptSensitiveFields(value);
            }
        }

        return result;
    }

    /**
     * Decrypt sensitive fields within an object
     *
     * This method decrypts all fields that were encrypted by encryptSensitiveFields.
     * It recursively processes nested objects and arrays.
     *
     * ⚠️ WARNING: Only decrypt when absolutely necessary (e.g., processing tax returns,
     * generating official documents, or API integrations). Never decrypt just for display.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    decryptSensitiveFields(data: any): any {
        if (!data || typeof data !== 'object') return data;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = Array.isArray(data) ? [...data] : { ...data };
        const sensitiveFields = [
            // === SSN/ITIN Identification Numbers ===
            'ssn',
            'ssnOrItin',
            'taxpayerSsnMasked',
            'taxpayerSsnConfirm',

            // === Bank Account Information ===
            'routingNumber',
            'accountNumber',

            // === Employer Identification Numbers (EIN) ===
            'ein',
            'employerEin',
            'childcareEin',

            // === State Identification Numbers ===
            'stateIdNumber',
            'controlNumber',

            // === Address Information (PII) ===
            'street',
            'apartment',
            'address',
            'employerAddress',
            'childcareAddress',

            // === Dates of Birth (PII) ===
            'dateOfBirth',

            // === Full Names in Tax Context (PII) ===
            'taxpayerName',
            'firstName',
            'lastName',
            'middleName',
            'childcareProvider',

            // === Financial Information ===
            'wages',
            'federalWithholding',
            'socialSecurityWages',
            'socialSecurityWithheld',
            'medicareWages',
            'medicareWithheld',
            'socialSecurityTips',
            'allocatedTips',
            'dependentCareBenefits',
            'nonqualifiedPlans',
            'stateWages',
            'stateWithholding',
            'localWages',
            'localTax',
            'childcareAmount',

            // === Employer Information (PII) ===
            'employerName',
        ];

        for (const key in result) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const value = result[key];

            // Handle encrypted string fields
            if (
                sensitiveFields.includes(key) &&
                typeof value === 'string' &&
                value.length > 40
            ) {
                try {
                    const decrypted = this.decrypt(value);
                    if (decrypted) {
                        // If it was a number, try to convert back
                        if (
                            key.includes('wages') ||
                            key.includes('withholding') ||
                            key.includes('amount') ||
                            key.includes('benefits') ||
                            key.includes('tax')
                        ) {
                            const numValue = parseFloat(decrypted);
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            result[key] = isNaN(numValue) ? decrypted : numValue;
                        } else {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            result[key] = decrypted;
                        }
                    }
                } catch {
                    // Not encrypted or failed, keep original
                }
            }
            // Handle nested objects and arrays (recursive)
            else if (typeof value === 'object' && value !== null) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                result[key] = this.decryptSensitiveFields(value);
            }
        }

        return result;
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

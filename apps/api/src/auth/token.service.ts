import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
  private readonly algorithm = 'aes-256-gcm';
  // Use a fixed key from env or fallback for dev (32 bytes for AES-256)
  // In production, this MUST be a secure random 32-byte hex string provided via env
  private readonly secretKey: Buffer;

  constructor() {
    // Fallback key only for development convenience/safety during initial setup
    // Real key should be 64 hex chars (32 bytes)
    const envSecret =
      process.env.TOKEN_SECRET ||
      '0000000000000000000000000000000000000000000000000000000000000000';
    this.secretKey = Buffer.from(envSecret, 'hex');

    if (this.secretKey.length !== 32) {
      console.warn(
        'WARNING: TOKEN_SECRET is not 32 bytes (64 hex chars). Falling back to derived key for safety.',
      );
      // Derive a 32-byte key from whatever string was provided
      this.secretKey = crypto.createHash('sha256').update(envSecret).digest();
    }
  }

  /**
   * Creates a secure, URL-safe encrypted token containing JSON data.
   */
  createUrlToken(payload: Record<string, any>): string {
    try {
      const iv = crypto.randomBytes(12); // GCM standard IV size
      const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);

      const jsonPayload = JSON.stringify({
        ...payload,
        _ts: Date.now(),
        _nonce: crypto.randomBytes(4).toString('hex'),
      });

      let encrypted = cipher.update(jsonPayload, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      // Format: iv.authTag.encryptedContent (all hex)
      // This is URL safe enough, but we can base64url encode if preferred.
      // For simplicity and readability in URLs, hex with dots is robust.
      return `${iv.toString('hex')}.${authTag.toString('hex')}.${encrypted}`;
    } catch (error) {
      console.error('Token generation failed:', error);
      throw new InternalServerErrorException(
        'Failed to generate security token',
      );
    }
  }

  /**
   * Decrypts and verifies a token. Returns null if invalid or tampered.
   */
  verifyUrlToken<T = any>(token: string): T | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [ivHex, authTagHex, contentHex] = parts;

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.secretKey,
        iv,
      );
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(contentHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted) as T;
    } catch (error) {
      // Decryption failed (auth tag mismatch, invalid format, etc.)
      // Do not log the specific error to avoid leaking info, just return null/invalid
      return null;
    }
  }
}

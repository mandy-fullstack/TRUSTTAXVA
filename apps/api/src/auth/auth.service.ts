import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Optional,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Role } from '@trusttax/database';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/services/encryption.service';
import { AuditService } from '../common/services/audit.service';
import { EmailService } from '../email/email.service';
import { TwoFactorService } from './two-factor.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChatGateway } from '../chat/chat.gateway';
import { StorageService } from '../common/services/storage.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  // Service for handling authentication and user identity management
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private encryptionService: EncryptionService,
    private auditService: AuditService,
    private emailService: EmailService,
    private twoFactorService: TwoFactorService,
    private chatGateway: ChatGateway,
    private storageService: StorageService,
    private tokenService: TokenService,
  ) { }

  async register(data: {
    email: string;
    password: string;
    name?: string;
    role?: string;
    [key: string]: any;
  }) {
    // SECURITY: Check if user already exists
    // DO NOT throw error - this would reveal if email is registered (enumeration attack)
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      // IMPORTANT: Return success message WITHOUT creating user
      // This prevents hackers from discovering which emails are in the database
      // The user will receive instructions to check email (which they won't get if already registered)
      console.log(`Registration attempt with existing email: ${data.email}`);

      // Return generic success - don't reveal that user exists
      return {
        message:
          'Registration successful! Please check your email to verify your account.',
      };
    }

    // Email is new - proceed with registration
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Generate Secure URL Token
    const verificationToken = this.tokenService.createUrlToken({
      email: data.email,
      type: 'email_verification',
    });

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        emailVerificationToken: verificationToken,
        emailVerified: false,
        ...(data.role && { role: data.role as Role }),
      },
    });

    // Send verification email
    try {
      await this.emailService.sendEmailVerification(
        user.email,
        verificationToken,
        user.name || undefined,
        data.origin,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't throw error, user is still created
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    return {
      message:
        'Registration successful! Please check your email to verify your account.',
    };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    if (!user || !user.email || !user.id) {
      throw new BadRequestException('Invalid user data for login');
    }

    if (!process.env.JWT_SECRET) {
      throw new BadRequestException('Server configuration error');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    if (!access_token) {
      throw new BadRequestException('Failed to generate authentication token');
    }

    return {
      access_token,
      user: {
        ...user,
        isProfileComplete: user.profileCompleted,
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      // Removed heavy relations (orders, invoices) to optimize initial load.
      // These should be fetched via dedicated endpoints where needed.
    } as any);

    if (!user) {
      throw new UnauthorizedException('User not found or has been deleted');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    // Calculate profile completion
    const profileComplete = this.calculateProfileCompletion(user);

    // IMPORTANTE: NUNCA descifrar datos solo para mostrar valores enmascarados.
    // Usar los campos Last4 almacenados en la BD (generados al cifrar).
    // Los datos cifrados solo se descifran cuando es absolutamente necesario (p.ej., verificación).
    const driverLicenseMasked = user.driverLicenseLast4
      ? `••••${user.driverLicenseLast4}`
      : null;
    const passportMasked = user.passportLast4
      ? `••••${user.passportLast4}`
      : null;

    return {
      ...result,
      isProfileComplete: profileComplete,
      // Never return encrypted data, only masked values from Last4 fields
      // (no descifrar nunca solo para mostrar)
      ssnMasked: user.ssnLast4 ? `XXX-XX-${user.ssnLast4}` : null,
      driverLicenseMasked,
      passportMasked,
    };
  }

  /**
   * Update user profile with encryption for sensitive fields
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updateData: any = {};

    // Basic fields
    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.middleName !== undefined) updateData.middleName = dto.middleName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.dateOfBirth !== undefined) {
      updateData.dateOfBirth = new Date(dto.dateOfBirth);
    }
    if (dto.countryOfBirth !== undefined)
      updateData.countryOfBirth = dto.countryOfBirth;
    if (dto.primaryLanguage !== undefined)
      updateData.primaryLanguage = dto.primaryLanguage;

    // Encrypt sensitive fields
    // SSN: Solo actualizar si se proporciona un valor
    if (dto.ssn && dto.ssn.trim().length > 0) {
      updateData.ssnEncrypted = this.encryptionService.encrypt(dto.ssn);
      updateData.ssnLast4 = this.encryptionService.extractSSNLast4(dto.ssn);
    }

    // Driver License: actualizar solo si hay al menos un campo con valor (evitar sobrescribir con vacío)
    const hasLicenseData =
      (dto.driverLicenseNumber && dto.driverLicenseNumber.trim().length > 0) ||
      (dto.driverLicenseStateCode &&
        dto.driverLicenseStateCode.trim().length > 0) ||
      (dto.driverLicenseExpiration &&
        dto.driverLicenseExpiration.trim().length > 0);
    if (hasLicenseData) {
      const dlJson = JSON.stringify({
        number: dto.driverLicenseNumber?.trim() ?? '',
        stateCode: dto.driverLicenseStateCode?.trim() ?? '',
        stateName: dto.driverLicenseStateName?.trim() ?? '',
        issueDate: dto.driverLicenseIssueDate?.trim() ?? '',
        expirationDate: dto.driverLicenseExpiration?.trim() ?? '',
      });
      updateData.driverLicenseEncrypted =
        this.encryptionService.encrypt(dlJson);
      if (
        dto.driverLicenseNumber &&
        dto.driverLicenseNumber.trim().length > 0
      ) {
        updateData.driverLicenseLast4 =
          this.encryptionService.extractLicenseLast4(dto.driverLicenseNumber);
      } else {
        updateData.driverLicenseLast4 = null;
      }
    }

    // Passport: igual que licencia; no sobrescribir con datos vacíos
    const hasPassportData =
      (dto.passportNumber && dto.passportNumber.trim().length > 0) ||
      (dto.passportCountryOfIssue &&
        dto.passportCountryOfIssue.trim().length > 0) ||
      (dto.passportExpiration && dto.passportExpiration.trim().length > 0);
    if (hasPassportData) {
      const ppJson = JSON.stringify({
        number: dto.passportNumber?.trim() ?? '',
        countryOfIssue: dto.passportCountryOfIssue?.trim() ?? '',
        issueDate: dto.passportIssueDate?.trim() ?? '',
        expirationDate: dto.passportExpiration?.trim() ?? '',
      });
      updateData.passportDataEncrypted = this.encryptionService.encrypt(ppJson);
      if (dto.passportNumber && dto.passportNumber.trim().length > 0) {
        updateData.passportLast4 = this.encryptionService.extractPassportLast4(
          dto.passportNumber,
        );
      } else {
        updateData.passportLast4 = null;
      }
    }
    if (dto.taxIdType) {
      updateData.taxIdType = dto.taxIdType;
    }

    // Terms acceptance
    if (dto.acceptTerms === true) {
      updateData.termsAcceptedAt = new Date();
      updateData.termsVersion = dto.termsVersion || '1.0';
    }

    // Update profile
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Check if profile is now complete
    const profileComplete = this.calculateProfileCompletion(updatedUser);

    if (profileComplete && !updatedUser.profileCompleted) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          profileCompleted: true,
          profileCompletedAt: new Date(),
        },
      });

      // Notify frontend via WebSocket to auto-redirect
      this.chatGateway.server.to(`user_${userId}`).emit('profile_completed', {
        userId,
        completedAt: new Date(),
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      password,
      ssnEncrypted,
      driverLicenseEncrypted,
      passportDataEncrypted,
      ...result
    } = updatedUser;

    // IMPORTANTE: Usar campos Last4 almacenados, NO descifrar nunca solo para mostrar
    const driverLicenseMasked = updatedUser.driverLicenseLast4
      ? `••••${updatedUser.driverLicenseLast4}`
      : null;
    const passportMasked = updatedUser.passportLast4
      ? `••••${updatedUser.passportLast4}`
      : null;

    return {
      ...result,
      isProfileComplete: profileComplete,
      ssnMasked: updatedUser.ssnLast4 ? `XXX-XX-${updatedUser.ssnLast4}` : null,
      driverLicenseMasked,
      passportMasked,
    };
  }

  async updateFCMToken(userId: string, token: string | null) {
    return (this.prisma.user as any).update({
      where: { id: userId },
      data: { fcmToken: token },
    });
  }

  /**
   * Calculate if user profile is complete
   * Required fields: firstName, lastName, dateOfBirth, countryOfBirth, primaryLanguage, ssnEncrypted, termsAcceptedAt
   */
  private calculateProfileCompletion(user: any): boolean {
    // Critical fields only: Identity, Tax ID, and Consent
    const checks = {
      firstName: !!user.firstName,
      lastName: !!user.lastName,
      ssnEncrypted: !!user.ssnEncrypted,
      termsAcceptedAt: !!user.termsAcceptedAt,
    };

    const missing = Object.entries(checks)
      .filter(([_, exists]) => !exists)
      .map(([key]) => key);

    if (missing.length > 0) {
      console.log(
        `[Profile Completion] User ${user.id} is missing critical fields:`,
        missing.join(', '),
      );
      // Also log non-critical but useful fields for debugging
      if (!user.dateOfBirth)
        console.log(
          `[Profile Completion] Note: User ${user.id} missing DOB (non-critical)`,
        );
      if (!user.countryOfBirth)
        console.log(
          `[Profile Completion] Note: User ${user.id} missing Country (non-critical)`,
        );
    } else {
      console.log(`[Profile Completion] User ${user.id} profile is COMPLETE.`);
    }

    return missing.length === 0;
  }

  /**
   * Descifra y devuelve el SSN completo del usuario.
   * SOLO se llama cuando el usuario explícitamente hace clic en "editar".
   * Se registra para auditoría.
   */
  async decryptSSN(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { ssnEncrypted: true },
    });

    if (!user || !user.ssnEncrypted) {
      return null;
    }

    try {
      const decrypted = this.encryptionService.decrypt(user.ssnEncrypted);
      await this.auditService.logDecryption({
        userId,
        field: 'ssn',
        entity: 'User',
        entityId: userId,
      });
      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt SSN:', error);
      return null;
    }
  }

  /**
   * Descifra y devuelve los datos completos de la licencia de conducir.
   * SOLO se llama cuando el usuario explícitamente hace clic en "editar".
   */
  async decryptDriverLicense(userId: string): Promise<{
    number: string;
    stateCode: string;
    stateName: string;
    issueDate: string;
    expirationDate: string;
    photoKey?: string;
  } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { driverLicenseEncrypted: true },
    });

    if (!user || !user.driverLicenseEncrypted) {
      return null;
    }

    try {
      const decrypted = this.encryptionService.decrypt(
        user.driverLicenseEncrypted,
      );
      if (!decrypted) return null;

      const dlData = JSON.parse(decrypted);
      await this.auditService.logDecryption({
        userId,
        field: 'driverLicense',
        entity: 'User',
        entityId: userId,
      });
      return {
        number: dlData.number || '',
        stateCode: dlData.stateCode || '',
        stateName: dlData.stateName || '',
        issueDate: dlData.issueDate || '',
        expirationDate: dlData.expirationDate || '',
        photoKey: dlData.photoKey,
      };
    } catch (error) {
      console.error('Failed to decrypt driver license:', error);
      return null;
    }
  }

  /**
   * Descifra y devuelve los datos completos del pasaporte.
   * SOLO se llama cuando el usuario explícitamente hace clic en "editar".
   */
  async decryptPassport(userId: string): Promise<{
    number: string;
    countryOfIssue: string;
    issueDate: string;
    expirationDate: string;
    photoKey?: string;
  } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passportDataEncrypted: true },
    });

    if (!user || !user.passportDataEncrypted) {
      return null;
    }

    try {
      const decrypted = this.encryptionService.decrypt(
        user.passportDataEncrypted,
      );
      if (!decrypted) return null;

      const ppData = JSON.parse(decrypted);
      await this.auditService.logDecryption({
        userId,
        field: 'passport',
        entity: 'User',
        entityId: userId,
      });
      return {
        number: ppData.number || '',
        countryOfIssue: ppData.countryOfIssue || '',
        issueDate: ppData.issueDate || '',
        expirationDate: ppData.expirationDate || '',
        photoKey: ppData.photoKey,
      };
    } catch (error) {
      console.error('Failed to decrypt passport:', error);
      return null;
    }
  }

  /**
   * Request password reset - generates token and sends email
   */
  async requestPasswordReset(email: string, origin?: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Account doesn't exist - send marketing email
    if (!user) {
      try {
        // Send professional "account not found" email with sales opportunity
        await this.emailService.sendAccountNotFoundEmail(email);
        console.log(
          `📧 Account not found email sent to ${email} (marketing opportunity)`,
        );
      } catch (error) {
        console.error('Failed to send account not found email:', error);
        // Still continue - don't reveal email doesn't exist
      }

      // Still wait to prevent timing attacks
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Return same message to prevent enumeration
      return {
        message:
          'If an account exists with this email, you will receive a password reset link.',
      };
    }

    // Generate Secure URL Token
    const resetToken = this.tokenService.createUrlToken({
      sub: user.id,
      type: 'password_reset',
    });
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Send email
    try {
      await this.emailService.sendPasswordResetEmail(
        email,
        resetToken,
        user.name || undefined,
        origin,
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't throw error to user, still return success message
    }

    return {
      message:
        'If an account exists with this email, you will receive a password reset link.',
    };
  }

  /**
   * Verify reset token validity
   */
  async verifyResetToken(token: string) {
    // 1. Decrypt and validate format
    const payload = this.tokenService.verifyUrlToken<{
      sub: string;
      type: string;
    }>(token);
    if (!payload || payload.type !== 'password_reset') {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    // 2. Check against database state (ensure token matches and expiry matches)
    // Note: We still check against DB to prevent replay attacks if user re-requested
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        passwordResetToken: token,
        passwordResetExpires: {
          gte: new Date(), // Token hasn't expired
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    return { valid: true, email: user.email };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    // 1. Decrypt
    console.log('   [DEBUG] Verifying Token in AuthService...');
    const payload = this.tokenService.verifyUrlToken<{
      sub: string;
      type: string;
    }>(token);
    console.log('   [DEBUG] Token Payload:', payload);

    if (!payload || payload.type !== 'password_reset') {
      console.error('   [DEBUG] Invalid Token Payload or Type mismatch');
      throw new BadRequestException('Invalid or expired password reset token');
    }

    // 2. Verify against DB
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        passwordResetToken: token,
        passwordResetExpires: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Send confirmation email
    try {
      await this.emailService.sendPasswordResetConfirmation(
        user.email,
        user.name || undefined,
      );
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      // Don't throw, password was already reset successfully
    }

    return { message: 'Password has been reset successfully' };
  }

  /**
   * Verify email and auto-login
   */
  async verifyEmail(token: string) {
    // 1. Decrypt
    const payload = this.tokenService.verifyUrlToken<{
      email: string;
      type: string;
    }>(token);
    if (!payload || payload.type !== 'email_verification') {
      throw new BadRequestException('Invalid or expired verification link');
    }

    // 2. Find by token AND email (double verification)
    const user = await this.prisma.user.findFirst({
      where: {
        email: payload.email,
        emailVerificationToken: token,
        emailVerified: false,
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Invalid or already used verification link',
      );
    }

    // Mark email as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationToken: null, // Clear token (single-use)
      },
    });

    // Auto-login: generate JWT token
    const jwtPayload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(jwtPayload);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      access_token,
      user: {
        ...userWithoutPassword,
        emailVerified: true,
        isProfileComplete: userWithoutPassword.profileCompleted,
      },
      message: 'Email verified successfully! You are now logged in.',
    };
  }

  // ==================== TWO-FACTOR AUTHENTICATION (2FA) METHODS ====================

  /**
   * Setup 2FA - Generate secret and QR code
   */
  async setup2FA(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only allow admins to use 2FA
    if (user.role !== 'ADMIN') {
      throw new BadRequestException('2FA is only available for admin users');
    }

    // Generate secret
    const { secret, otpauth_url } = this.twoFactorService.generateSecret(
      user.email,
    );

    // Generate QR code
    const qrCodeUrl = await this.twoFactorService.generateQRCode(otpauth_url);

    // Store temporary secret (not enabled yet until verified)
    const encryptedSecret = this.twoFactorService.encryptSecret(secret);
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: encryptedSecret },
    });

    return {
      secret: secret, // For manual entry in authenticator app
      qrCode: qrCodeUrl, // Data URL for QR image
    };
  }

  /**
   * Enable 2FA - Verify code and activate
   */
  async enable2FA(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException(
        '2FA not set up. Please call setup endpoint first.',
      );
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    // Decrypt secret
    const secret = this.twoFactorService.decryptSecret(user.twoFactorSecret);

    // Verify token
    const isValid = this.twoFactorService.verifyToken(secret, token);

    if (!isValid) {
      throw new UnauthorizedException(
        'Invalid verification code. Please try again.',
      );
    }

    // Generate backup codes
    const backupCodes = this.twoFactorService.generateBackupCodes();
    const encryptedBackupCodes = this.twoFactorService.encryptSecret(
      JSON.stringify(backupCodes),
    );

    // Enable 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: encryptedBackupCodes,
      },
    });

    return {
      message:
        '2FA enabled successfully! Save these backup codes in a secure location.',
      backupCodes: backupCodes, // Show once, user must save securely
    };
  }

  /**
   * Disable 2FA - Verify code before disabling
   */
  async disable2FA(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Verify token before disabling (security measure)
    const secret = this.twoFactorService.decryptSecret(user.twoFactorSecret!);
    const isValid = this.twoFactorService.verifyToken(secret, token);

    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Disable 2FA and remove all related data
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
      },
    });

    return { message: '2FA disabled successfully' };
  }

  /**
   * Verify 2FA code during login (supports both TOTP and backup codes)
   */
  async verify2FA(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return false;
    }

    // Check if it's a backup code first
    if (user.twoFactorBackupCodes) {
      try {
        const backupCodes = JSON.parse(
          this.twoFactorService.decryptSecret(user.twoFactorBackupCodes),
        );

        const codeIndex = backupCodes.indexOf(token.toUpperCase());
        if (codeIndex !== -1) {
          // Remove used backup code
          backupCodes.splice(codeIndex, 1);
          const encryptedCodes = this.twoFactorService.encryptSecret(
            JSON.stringify(backupCodes),
          );

          await this.prisma.user.update({
            where: { id: userId },
            data: { twoFactorBackupCodes: encryptedCodes },
          });

          console.log(`Backup code used for user ${userId}`);
          return true; // Backup code valid
        }
      } catch (error) {
        console.error('Error checking backup codes:', error);
      }
    }

    // Verify TOTP token
    const secret = this.twoFactorService.decryptSecret(user.twoFactorSecret);
    return this.twoFactorService.verifyToken(secret, token);
  }

  /**
   * Complete login after 2FA verification
   */
  async complete2FALogin(tempToken: string, twoFactorCode: string) {
    try {
      // Verify temp token
      const payload = this.jwtService.verify(tempToken);

      if (payload.type !== '2fa_temp') {
        throw new UnauthorizedException('Invalid token type');
      }

      const userId = payload.sub;

      // Verify 2FA code
      const isValid = await this.verify2FA(userId, twoFactorCode);

      if (!isValid) {
        throw new UnauthorizedException('Invalid 2FA code');
      }

      // Get user
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Generate final access token
      const finalPayload = { email: user.email, sub: user.id, role: user.role };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;

      return {
        access_token: this.jwtService.sign(finalPayload),
        user: {
          ...userWithoutPassword,
          isProfileComplete: userWithoutPassword.profileCompleted,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired temp token');
    }
  }

  /**
   * Generate temporary token for 2FA verification step
   */
  private generateTempToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: '2fa_temp' },
      { expiresIn: '5m' }, // Expires in 5 minutes
    );
  }

  /**
   * Updated login method that checks for 2FA
   */
  async loginWith2FA(user: any) {
    // Check if 2FA is enabled for this user
    if (user.twoFactorEnabled) {
      // Return special response - frontend will show 2FA input
      return {
        requires2FA: true,
        tempToken: this.generateTempToken(user.id),
      };
    }

    // Normal login (2FA not enabled)
    const payload = { email: user.email, sub: user.id, role: user.role };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  /**
   * Create a new administrator and send invitation
   */
  async createAdminInvitation(email: string, name?: string) {
    // 1. Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists but has no password (or very short placeholder), it's a pending invitation - resend it
      // Real bcrypt hashes are always ~60 chars
      if (!existingUser.password || existingUser.password.length < 10) {
        const setupToken = crypto.randomBytes(32).toString('hex');
        const setupExpires = new Date(Date.now() + 86400000);

        await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            passwordResetToken: setupToken,
            passwordResetExpires: setupExpires,
          },
        });

        await this.emailService.sendAdminInvitationEmail(
          email,
          setupToken,
          existingUser.name || name || undefined,
        );
        return {
          message: 'Admin invitation has been resent successfully',
          email,
        };
      }

      // Otherwise, just use the reset password flow
      return this.requestPasswordReset(email);
    }

    // 2. Generate secure random token for setup
    const setupToken = crypto.randomBytes(32).toString('hex');
    const setupExpires = new Date(Date.now() + 86400000); // 24 hours for setup

    // 3. Create user with ADMIN role (no password yet)
    const user = await this.prisma.user.create({
      data: {
        email,
        name: name || 'Admin User',
        role: 'ADMIN' as Role,
        password: '', // Empty password initially
        passwordResetToken: setupToken,
        passwordResetExpires: setupExpires,
        emailVerified: true, // Mark as verified since it's an invite
        emailVerifiedAt: new Date(),
      },
    });

    // 4. Send invitation email
    try {
      await this.emailService.sendAdminInvitationEmail(
        email,
        setupToken,
        user.name || undefined,
      );
      console.log(`📧 Admin invitation sent to ${email}`);
    } catch (error) {
      console.error('Failed to send admin invitation email:', error);
      throw new BadRequestException('Failed to send invitation email');
    }

    return { message: 'Admin invitation has been sent successfully', email };
  }

  /**
   * Upload and encrypt a profile document photo
   */
  async uploadProfileDocument(
    userId: string,
    file: Express.Multer.File,
    docType: 'DL' | 'PASSPORT',
  ) {
    try {
      // Get user details for renaming
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });

      if (!user) throw new NotFoundException('User not found');

      const year = new Date().getFullYear();
      const fName = (user.firstName || 'UNKNOWN')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      const lName = (user.lastName || 'UNKNOWN')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      // Extension from original file (e.g., .jpg, .pdf)
      const originalExt = file.originalname.split('.').pop() || 'bin';

      // Format: YEAR_DOCTYPE_FIRSTNAME_LASTNAME.ext.enc
      // Example: 2024_PASSPORT_MANDY_FERRO.jpg.enc
      const newFileName = `${year}_${docType}_${fName}_${lName}.${originalExt}.enc`;

      // 1. Encrypt the file buffer
      const encryptedBuffer = this.encryptionService.encryptBuffer(file.buffer);

      // 2. Prepare file metadata for storage
      const encryptedFile = {
        ...file,
        buffer: encryptedBuffer,
        originalname: newFileName,
        mimetype: 'application/octet-stream', // Force encrypted binary type
      };

      // 3. Upload to private folder
      // Path: users/{userId}/documents/{docType}/...
      const path = `users/${userId}/documents/${docType.toLowerCase()}`;

      // Pass the custom file name to the storage service
      // --- CLEANUP OLD DOCUMENT IF EXISTS ---
      const oldIdDocs = await this.prisma.document.findMany({
        where: {
          userId,
          type: docType === 'DL' ? 'DRIVER_LICENSE' : ('PASSPORT' as any),
        },
      });

      for (const oldDoc of oldIdDocs) {
        if (oldDoc.s3Key) {
          await this.storageService.deleteFile(oldDoc.s3Key);
        }
        await this.prisma.document.delete({ where: { id: oldDoc.id } });
      }
      // ---------------------------------------

      const uploadResult = await this.storageService.uploadFile(
        encryptedFile,
        path,
        false,
        newFileName,
      );

      // 4. Create record in Document table for unified view
      await this.prisma.document.create({
        data: {
          title: newFileName.replace('.enc', ''),
          type: docType === 'DL' ? 'DRIVER_LICENSE' : ('PASSPORT' as any),
          url: uploadResult.url,
          s3Key: uploadResult.fileName,
          mimeType: file.mimetype,
          size: file.size,
          userId: userId,
        },
      });

      // 5. Update the profile with the storage key
      const decryptedProfile =
        docType === 'DL'
          ? await this.decryptDriverLicense(userId)
          : await this.decryptPassport(userId);

      if (decryptedProfile) {
        const updatedJson = JSON.stringify({
          ...decryptedProfile,
          photoKey: uploadResult.fileName,
        });

        const updateData =
          docType === 'DL'
            ? {
              driverLicenseEncrypted:
                this.encryptionService.encrypt(updatedJson),
            }
            : {
              passportDataEncrypted:
                this.encryptionService.encrypt(updatedJson),
            };

        await this.prisma.user.update({
          where: { id: userId },
          data: updateData,
        });
      }

      return {
        message: 'Document photo uploaded and encrypted successfully',
        fileName: uploadResult.fileName,
      };
    } catch (error) {
      console.error('Document upload error:', error);
      throw new Error('Failed to securely upload document');
    }
  }

  // ==================== PIN MANAGEMENT ====================

  async getPinStatus(userId: string): Promise<{ hasPin: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pinEnabled: true, pinHash: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { hasPin: !!user.pinHash && user.pinEnabled };
  }

  async setupPin(userId: string, pin: string): Promise<{ message: string }> {
    // Validate PIN (basic check)
    if (!pin || pin.length < 4) {
      throw new BadRequestException('PIN must be at least 4 digits');
    }

    // Hash the PIN
    const pinHash = await bcrypt.hash(pin, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        pinHash,
        pinEnabled: true,
      },
    });

    return { message: 'PIN setup successful' };
  }

  async verifyPin(userId: string, pin: string): Promise<{ valid: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pinHash: true, pinEnabled: true },
    });

    if (!user || !user.pinEnabled || !user.pinHash) {
      throw new BadRequestException('PIN is not set up');
    }

    const valid = await bcrypt.compare(pin, user.pinHash);

    if (!valid) {
      throw new UnauthorizedException('Invalid PIN');
    }

    return { valid: true };
  }

  async changePin(
    userId: string,
    oldPin: string,
    newPin: string,
  ): Promise<{ message: string }> {
    // First verify old PIN
    await this.verifyPin(userId, oldPin);

    // Then setup new PIN
    return this.setupPin(userId, newPin);
  }
}

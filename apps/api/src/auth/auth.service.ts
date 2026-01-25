import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Role } from '@trusttax/database';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/services/encryption.service';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private encryptionService: EncryptionService,
    ) { }

    async register(data: {
        email: string;
        password: string;
        name?: string;
        role?: string;
        [key: string]: any;
    }) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                ...(data.role && { role: data.role as Role }),
            },
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && (await bcrypt.compare(pass, user.password))) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                orders: {
                    include: {
                        service: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                invoices: {
                    where: {
                        status: {
                            in: ['DRAFT', 'SENT', 'OVERDUE']
                        }
                    }
                }
            }
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
            profileComplete,
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
        if (dto.countryOfBirth !== undefined) updateData.countryOfBirth = dto.countryOfBirth;
        if (dto.primaryLanguage !== undefined) updateData.primaryLanguage = dto.primaryLanguage;

        // Encrypt sensitive fields
        // SSN: Solo actualizar si se proporciona un valor
        if (dto.ssn && dto.ssn.trim().length > 0) {
            updateData.ssnEncrypted = this.encryptionService.encrypt(dto.ssn);
            updateData.ssnLast4 = this.encryptionService.extractSSNLast4(dto.ssn);
        }
        
        // Driver License: actualizar solo si hay al menos un campo con valor (evitar sobrescribir con vacío)
        const hasLicenseData =
            (dto.driverLicenseNumber && dto.driverLicenseNumber.trim().length > 0) ||
            (dto.driverLicenseStateCode && dto.driverLicenseStateCode.trim().length > 0) ||
            (dto.driverLicenseExpiration && dto.driverLicenseExpiration.trim().length > 0);
        if (hasLicenseData) {
            const dlJson = JSON.stringify({
                number: dto.driverLicenseNumber?.trim() ?? '',
                stateCode: dto.driverLicenseStateCode?.trim() ?? '',
                stateName: dto.driverLicenseStateName?.trim() ?? '',
                expirationDate: dto.driverLicenseExpiration?.trim() ?? '',
            });
            updateData.driverLicenseEncrypted = this.encryptionService.encrypt(dlJson);
            if (dto.driverLicenseNumber && dto.driverLicenseNumber.trim().length > 0) {
                updateData.driverLicenseLast4 = this.encryptionService.extractLicenseLast4(dto.driverLicenseNumber);
            } else {
                updateData.driverLicenseLast4 = null;
            }
        }

        // Passport: igual que licencia; no sobrescribir con datos vacíos
        const hasPassportData =
            (dto.passportNumber && dto.passportNumber.trim().length > 0) ||
            (dto.passportCountryOfIssue && dto.passportCountryOfIssue.trim().length > 0) ||
            (dto.passportExpiration && dto.passportExpiration.trim().length > 0);
        if (hasPassportData) {
            const ppJson = JSON.stringify({
                number: dto.passportNumber?.trim() ?? '',
                countryOfIssue: dto.passportCountryOfIssue?.trim() ?? '',
                expirationDate: dto.passportExpiration?.trim() ?? '',
            });
            updateData.passportDataEncrypted = this.encryptionService.encrypt(ppJson);
            if (dto.passportNumber && dto.passportNumber.trim().length > 0) {
                updateData.passportLast4 = this.encryptionService.extractPassportLast4(dto.passportNumber);
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
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ssnEncrypted, driverLicenseEncrypted, passportDataEncrypted, ...result } = updatedUser;
        
        // IMPORTANTE: Usar campos Last4 almacenados, NO descifrar nunca solo para mostrar
        const driverLicenseMasked = updatedUser.driverLicenseLast4 
            ? `••••${updatedUser.driverLicenseLast4}` 
            : null;
        const passportMasked = updatedUser.passportLast4 
            ? `••••${updatedUser.passportLast4}` 
            : null;
        
        return {
            ...result,
            profileComplete,
            ssnMasked: updatedUser.ssnLast4 ? `XXX-XX-${updatedUser.ssnLast4}` : null,
            driverLicenseMasked,
            passportMasked,
        };
    }

    /**
     * Calculate if user profile is complete
     * Required fields: firstName, lastName, dateOfBirth, countryOfBirth, primaryLanguage, ssnEncrypted, termsAcceptedAt
     */
    private calculateProfileCompletion(user: any): boolean {
        return !!(
            user.firstName &&
            user.lastName &&
            user.dateOfBirth &&
            user.countryOfBirth &&
            user.primaryLanguage &&
            user.ssnEncrypted &&
            user.termsAcceptedAt
        );
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
            // Log para auditoría (en producción, usar un servicio de logging apropiado)
            console.log(`[AUDIT] SSN decrypted for user ${userId} at ${new Date().toISOString()}`);
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
        expirationDate: string;
    } | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { driverLicenseEncrypted: true },
        });

        if (!user || !user.driverLicenseEncrypted) {
            return null;
        }

        try {
            const decrypted = this.encryptionService.decrypt(user.driverLicenseEncrypted);
            if (!decrypted) return null;
            
            const dlData = JSON.parse(decrypted);
            console.log(`[AUDIT] Driver license decrypted for user ${userId} at ${new Date().toISOString()}`);
            return {
                number: dlData.number || '',
                stateCode: dlData.stateCode || '',
                stateName: dlData.stateName || '',
                expirationDate: dlData.expirationDate || '',
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
        expirationDate: string;
    } | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { passportDataEncrypted: true },
        });

        if (!user || !user.passportDataEncrypted) {
            return null;
        }

        try {
            const decrypted = this.encryptionService.decrypt(user.passportDataEncrypted);
            if (!decrypted) return null;
            
            const ppData = JSON.parse(decrypted);
            console.log(`[AUDIT] Passport decrypted for user ${userId} at ${new Date().toISOString()}`);
            return {
                number: ppData.number || '',
                countryOfIssue: ppData.countryOfIssue || '',
                expirationDate: ppData.expirationDate || '',
            };
        } catch (error) {
            console.error('Failed to decrypt passport:', error);
            return null;
        }
    }
}

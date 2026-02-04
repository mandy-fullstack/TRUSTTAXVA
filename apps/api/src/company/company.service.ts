import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(private prisma: PrismaService) { }

  private normalizeNotificationSenderName(value: any): string | null {
    if (value === undefined) return null;
    if (value === null) return null;
    const s = String(value).trim();
    return s.length === 0 ? null : s;
  }

  private isPlainObject(value: any): value is Record<string, any> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * When the DB schema is out of sync (e.g. column missing), Prisma will fail even on updates that
   * don't touch the missing column because it returns all model columns by default.
   * This select avoids referencing `notificationSenderName` when that column doesn't exist.
   */
  private readonly selectWithoutNotificationSenderName = {
    id: true,
    companyName: true,
    dba: true,
    description: true,
    email: true,
    phone: true,
    address: true,
    website: true,
    businessHours: true,
    socialLinks: true,
    primaryColor: true,
    secondaryColor: true,
    updatedAt: true,
    faviconUrl: true,
    logoUrl: true,
    themeOptions: true,
  } as const;

  async getProfile() {
    try {
      // Find existing or create default
      let profile = await (this.prisma.client as any).companyProfile.findFirst();

      if (!profile) {
        profile = await (this.prisma.client as any).companyProfile.create({
          data: {
            companyName: 'Trust Tax Services',
            email: 'contact@trusttax.com',
            phone: '(555) 123-4567',
            address: '123 Business Ave, VA',
            primaryColor: '#0F172A',
            secondaryColor: '#2563EB',
          },
        });
      }

      return profile;
    } catch (error: any) {
      // If error is about missing notificationSenderName column, try using select to exclude it
      const errorMessage = error.message || '';
      const metaMessage = error.meta?.message || '';
      const fullMessage = `${errorMessage} ${metaMessage}`.toLowerCase();

      const isColumnMissingError =
        error.code === 'P2010' ||
        error.meta?.code === '42703' ||
        fullMessage.includes('column') ||
        fullMessage.includes('does not exist') ||
        fullMessage.includes('notificationsendername') ||
        fullMessage.includes('notification_sender_name');

      if (isColumnMissingError) {
        this.logger.warn(
          'notificationSenderName column does not exist. Fetching profile without it.'
        );

        // Try to fetch using raw query to exclude the problematic column
        try {
          const profiles = await (this.prisma.client as any).$queryRaw`
            SELECT id, "companyName", dba, description, email, phone, address, website, 
                   "businessHours", "socialLinks", "primaryColor", "secondaryColor", 
                   "updatedAt", "faviconUrl", "logoUrl", "themeOptions"
            FROM "CompanyProfile"
            LIMIT 1
          `;

          if (profiles && profiles.length > 0) {
            // Fallback: if stored in themeOptions JSON, expose it as notificationSenderName
            const themeOptions = (profiles[0] as any).themeOptions;
            const fromTheme =
              this.isPlainObject(themeOptions) &&
                typeof themeOptions.notificationSenderName === 'string'
                ? this.normalizeNotificationSenderName(
                  themeOptions.notificationSenderName,
                )
                : null;

            return {
              ...profiles[0],
              notificationSenderName: fromTheme,
            };
          }

          // If no profile exists, create one without notificationSenderName
          const newProfile = await (this.prisma.client as any).$queryRaw`
            INSERT INTO "CompanyProfile" ("companyName", email, phone, address, "primaryColor", "secondaryColor")
            VALUES ('Trust Tax Services', 'contact@trusttax.com', '(555) 123-4567', '123 Business Ave, VA', '#0F172A', '#2563EB')
            RETURNING id, "companyName", dba, description, email, phone, address, website, 
                      "businessHours", "socialLinks", "primaryColor", "secondaryColor", 
                      "updatedAt", "faviconUrl", "logoUrl", "themeOptions"
          `;

          // Add notificationSenderName as null since it doesn't exist
          return {
            ...newProfile[0],
            notificationSenderName: null,
          };
        } catch (rawError: any) {
          this.logger.error('Error fetching profile with raw query', rawError.stack);
          throw rawError;
        }
      }

      // For any other error, log and throw
      this.logger.error(`Error in getProfile: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateProfile(data: any) {
    const profile = await this.getProfile();

    // Filter out undefined values to avoid Prisma errors
    const updateData: any = {};
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        // Asegurar que los campos JSON sean objetos válidos
        if (['businessHours', 'socialLinks', 'themeOptions'].includes(key)) {
          // Si es null, undefined, o ya es un objeto/array, mantenerlo
          if (data[key] === null || Array.isArray(data[key]) || (typeof data[key] === 'object' && data[key] !== null)) {
            updateData[key] = data[key];
          } else {
            // Si es string, intentar parsearlo
            try {
              updateData[key] = JSON.parse(data[key]);
            } catch (e) {
              this.logger.warn(`Invalid JSON for ${key}, setting to null: ${e.message}`);
              updateData[key] = null;
            }
          }
        } else {
          updateData[key] = data[key];
        }
      }
    });

    // Normalize notificationSenderName: treat empty string as null (means "use admin name")
    const hasNotificationSenderName = updateData.notificationSenderName !== undefined;
    const normalizedNotificationSenderName = hasNotificationSenderName
      ? this.normalizeNotificationSenderName(updateData.notificationSenderName)
      : null;
    if (hasNotificationSenderName) {
      updateData.notificationSenderName = normalizedNotificationSenderName;
    }

    this.logger.log(`Updating profile: fields [${Object.keys(updateData).join(', ')}]`);

    try {
      return await (this.prisma.client as any).companyProfile.update({
        where: { id: profile.id },
        data: updateData,
      });
    } catch (error: any) {
      // Check if error is about missing column (PostgreSQL error code 42703 or Prisma P2010)
      const errorMessage = error.message || '';
      const metaMessage = error.meta?.message || '';
      const fullMessage = `${errorMessage} ${metaMessage}`.toLowerCase();

      const isColumnMissingError =
        error.code === 'P2010' ||
        error.meta?.code === '42703' ||
        fullMessage.includes('column') ||
        fullMessage.includes('does not exist') ||
        fullMessage.includes('notificationsendername') ||
        fullMessage.includes('notification_sender_name');

      // If error is about missing notificationSenderName column, retry without it
      if (isColumnMissingError && hasNotificationSenderName) {
        const { notificationSenderName, ...dataWithoutField } = updateData;
        this.logger.warn(
          'notificationSenderName column does not exist in database. Saving without it.'
        );

        try {
          // Fallback persistence: store it inside themeOptions JSON when the column doesn't exist
          if (normalizedNotificationSenderName !== null) {
            const currentTheme = this.isPlainObject(dataWithoutField.themeOptions)
              ? dataWithoutField.themeOptions
              : {};
            dataWithoutField.themeOptions = {
              ...currentTheme,
              notificationSenderName: normalizedNotificationSenderName,
            };
          } else if (this.isPlainObject(dataWithoutField.themeOptions)) {
            // If cleared, remove it from themeOptions to avoid stale values
            const { notificationSenderName: _nsn, ...rest } =
              dataWithoutField.themeOptions;
            dataWithoutField.themeOptions = rest;
          }

          // IMPORTANT:
          // Prisma returns all model columns by default. If the DB column is missing,
          // the update will still fail unless we restrict the returned columns.
          const updated = await (this.prisma.client as any).companyProfile.update({
            where: { id: profile.id },
            data: dataWithoutField,
            select: this.selectWithoutNotificationSenderName,
          });

          // Maintain API contract: return notificationSenderName (stored in themeOptions fallback)
          return {
            ...updated,
            notificationSenderName: normalizedNotificationSenderName,
          };
        } catch (retryError: any) {
          this.logger.error(`Error on retry without notificationSenderName: ${retryError.message}`, retryError.stack);
          throw retryError;
        }
      }

      // For any other error, log and re-throw
      this.logger.error(`Update profile failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}

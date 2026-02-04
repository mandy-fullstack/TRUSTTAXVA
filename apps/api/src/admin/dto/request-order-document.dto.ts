import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { DocType } from '@trusttax/database';

export class RequestOrderDocumentDto {
  @IsString()
  documentName!: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(DocType)
  docType?: DocType;

  /**
   * If true, the email will point to the authenticated dashboard flow (login required).
   * If false/undefined, the email will point to a private one-time portal link (no login required).
   */
  @IsOptional()
  @IsBoolean()
  requireLogin?: boolean;
}


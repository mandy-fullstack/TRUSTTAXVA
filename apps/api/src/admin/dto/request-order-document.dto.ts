import { IsBoolean, IsEnum, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
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
   * Bulk requests: if provided, this array takes precedence over single fields.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestItem)
  requests?: RequestItem[];

  /**
   * If true, the email will point to the authenticated dashboard flow (login required).
   * If false/undefined, the email will point to a private one-time portal link (no login required).
   */
  @IsOptional()
  @IsBoolean()
  requireLogin?: boolean;
}

export class RequestItem {
  @IsString()
  documentName!: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(DocType)
  docType?: DocType;
}


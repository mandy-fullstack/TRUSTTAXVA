import { IsEnum, IsOptional, IsString } from 'class-validator';
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
}


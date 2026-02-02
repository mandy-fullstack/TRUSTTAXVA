import { IsString, IsOptional, IsEnum } from 'class-validator';
import { DocType } from '@trusttax/database';

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(DocType)
  @IsOptional()
  type?: DocType;
}

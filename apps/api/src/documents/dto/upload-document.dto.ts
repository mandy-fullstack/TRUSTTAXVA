import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { DocType } from '@trusttax/database';

export class UploadDocumentDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsEnum(DocType)
    @IsOptional()
    type?: DocType = DocType.OTHER;

    @IsUUID()
    @IsOptional()
    taxReturnId?: string;

    @IsUUID()
    @IsOptional()
    immigrationCaseId?: string;

    @IsUUID()
    @IsOptional()
    orderId?: string;

    @IsUUID()
    @IsOptional()
    conversationId?: string;
}

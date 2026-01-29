import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    middleName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;

    @IsOptional()
    @IsString()
    countryOfBirth?: string;

    @IsOptional()
    @IsString()
    primaryLanguage?: string;

    @IsOptional()
    @IsString()
    // Using IsString instead of IsEnum because schema is String, but valid values are SSN/ITIN
    taxIdType?: 'SSN' | 'ITIN';

    @IsOptional()
    @IsString()
    ssn?: string; // XXX-XX-XXXX, encrypted

    @IsOptional()
    @IsString()
    driverLicenseNumber?: string;

    @IsOptional()
    @IsString()
    driverLicenseStateCode?: string;

    @IsOptional()
    @IsString()
    driverLicenseStateName?: string;

    @IsOptional()
    @IsString()
    driverLicenseIssueDate?: string; // YYYY-MM-DD

    @IsOptional()
    @IsString() // Accepting string, frontend validation ensures format
    driverLicenseExpiration?: string; // YYYY-MM-DD

    @IsOptional()
    @IsString()
    passportNumber?: string;

    @IsOptional()
    @IsString()
    passportCountryOfIssue?: string;

    @IsOptional()
    @IsString()
    passportIssueDate?: string; // YYYY-MM-DD

    @IsOptional()
    @IsString()
    passportExpiration?: string; // YYYY-MM-DD

    @IsOptional()
    @IsBoolean()
    acceptTerms?: boolean;

    @IsOptional()
    @IsString()
    termsVersion?: string;
}

export class UpdateProfileDto {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    dateOfBirth?: string;
    countryOfBirth?: string;
    primaryLanguage?: string;

    taxIdType?: 'SSN' | 'ITIN';
    ssn?: string; // XXX-XX-XXXX, encrypted

    driverLicenseNumber?: string;
    driverLicenseStateCode?: string;
    driverLicenseStateName?: string;
    driverLicenseExpiration?: string; // YYYY-MM-DD

    passportNumber?: string;
    passportCountryOfIssue?: string;
    passportExpiration?: string; // YYYY-MM-DD

    acceptTerms?: boolean;
    termsVersion?: string;
}

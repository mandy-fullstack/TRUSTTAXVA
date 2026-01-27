import { IsString, MinLength, MaxLength } from 'class-validator';

export class Verify2FADto {
    @IsString({ message: 'Temp token is required' })
    tempToken: string;

    @IsString({ message: 'Code must be a string' })
    @MinLength(6, { message: 'Code must be 6 digits' })
    @MaxLength(8, { message: 'Code must be 6 digits or backup code' })
    code: string;
}

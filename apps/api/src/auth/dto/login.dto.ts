import { IsEmail, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;

    @IsString({ message: 'Password is required' })
    @MinLength(1, { message: 'Password cannot be empty' })
    password: string;
}

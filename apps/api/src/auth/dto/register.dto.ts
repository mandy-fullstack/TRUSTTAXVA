import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email is too long' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(128, { message: 'Password is too long' })
  @Transform(({ value }) => value?.trim())
  password: string;

  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name is too long' })
  @Matches(/^[a-zA-Z\s\-'áéíóúüñÁÉÍÓÚÜÑ]+$/, {
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  })
  @Transform(({ value }) => value?.trim())
  name: string;
}

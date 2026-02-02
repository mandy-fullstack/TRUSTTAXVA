import { IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class ResetPasswordDto {
  @IsString({ message: 'Token is required' })
  @MinLength(32, { message: 'Invalid token' })
  @MaxLength(1024, { message: 'Invalid token' })
  token: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(128, { message: 'Password is too long' })
  @Transform(({ value }) => value?.trim())
  password: string;
}

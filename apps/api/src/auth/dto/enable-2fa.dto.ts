import { IsString, MinLength, MaxLength } from 'class-validator';

export class Enable2FADto {
  @IsString({ message: 'Token must be a string' })
  @MinLength(6, { message: 'Token must be 6 digits' })
  @MaxLength(8, { message: 'Token must be 6 digits or backup code' })
  token: string;
}

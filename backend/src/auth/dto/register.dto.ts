import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '../../generated/prisma/enums.js';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  name!: string;

  @IsEnum(Role)
  role!: Role;
}

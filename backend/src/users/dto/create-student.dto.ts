import { IsArray, IsEmail, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStudentDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  className?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  graduationYear?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}

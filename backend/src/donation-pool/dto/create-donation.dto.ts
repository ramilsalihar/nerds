import { IsEmail, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateDonationDto {
  @IsNumber()
  @Min(1)
  amount!: number;

  @IsOptional()
  @IsString()
  donorName?: string;

  @IsOptional()
  @IsEmail()
  donorEmail?: string;

  @IsOptional()
  @IsString()
  message?: string;
}

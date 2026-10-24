import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  message!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  proposedPrice?: number;
}

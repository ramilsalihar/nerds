import { IsBoolean, IsNumber, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  studentId!: string;

  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsUrl()
  repoUrl?: string;

  @IsOptional()
  @IsUrl()
  liveUrl?: string;

  @IsOptional()
  @IsBoolean()
  deployed?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  usersCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  revenueAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  uiUxRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  functionalityRating?: number;
}

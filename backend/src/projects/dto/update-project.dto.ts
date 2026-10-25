import { ArrayMaxSize, IsArray, IsBoolean, IsNumber, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  repoUrl?: string;

  @IsOptional()
  @IsUrl()
  liveUrl?: string;

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsUrl({}, { each: true })
  imageUrls?: string[];

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

import { ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { ProjectType } from '../../generated/prisma/enums.js';

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
  @IsEnum(ProjectType)
  type?: ProjectType;

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


}

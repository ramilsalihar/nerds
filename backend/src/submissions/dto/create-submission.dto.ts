import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateSubmissionDto {
  @IsArray()
  @IsString({ each: true })
  files!: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

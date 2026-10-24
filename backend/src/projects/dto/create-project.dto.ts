import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { BudgetType } from '../../generated/prisma/enums.js';

export class CreateProjectDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  technicalSpec?: string;

  @IsEnum(BudgetType)
  budgetType!: BudgetType;

  @IsNumber()
  @Min(0)
  budgetAmount!: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}

import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  authorName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body!: string;
}

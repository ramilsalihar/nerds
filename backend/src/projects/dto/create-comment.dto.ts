import { IsString, MaxLength, MinLength } from 'class-validator';

// Author is taken from the authenticated user, not the request body.
export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body!: string;
}

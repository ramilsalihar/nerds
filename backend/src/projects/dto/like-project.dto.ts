import { IsString, MinLength } from 'class-validator';

export class LikeProjectDto {
  @IsString()
  @MinLength(8)
  viewerToken!: string;
}

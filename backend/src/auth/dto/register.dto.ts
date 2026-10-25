import { IsEmail, IsInt, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

// Public self-registration always creates a student account with status "pending" —
// an admin must approve it before the student can log in.
// Admin accounts are seeded; additional pre-approved students are created by an admin via POST /users/students.
export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  name!: string;

  @IsString()
  className!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1900)
  graduationYear!: number;
}

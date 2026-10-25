import { IsEmail, IsString, MinLength } from 'class-validator';

// Public self-registration always creates a student account.
// Admin accounts are seeded; additional students are created by an admin via POST /users/students.
export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  name!: string;
}

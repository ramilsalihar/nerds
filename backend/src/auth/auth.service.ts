import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role, UserStatus } from '../generated/prisma/enums.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        className: dto.className,
        graduationYear: dto.graduationYear,
        role: Role.student,
        status: UserStatus.pending,
        studentProfile: { create: { skills: [], portfolioLinks: [] } },
      },
    });

    // No token issued — the student can't log in until an admin approves the account.
    return { pending: true, message: 'Registration submitted. An admin will review your account before you can log in.' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.pending) {
      throw new ForbiddenException('Your registration is still pending admin approval.');
    }
    if (user.status === UserStatus.rejected) {
      throw new ForbiddenException('Your registration was rejected. Contact an admin for details.');
    }

    return this.issueToken(user.id, user.email, user.role);
  }

  private issueToken(sub: string, email: string, role: string) {
    return {
      accessToken: this.jwt.sign({ sub, email, role }),
    };
  }
}

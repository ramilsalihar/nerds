import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role, UserStatus } from '../generated/prisma/enums.js';
import type { CreateStudentDto } from './dto/create-student.dto.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';

const SAFE_USER_SELECT = {
  id: true,
  email: true,
  role: true,
  status: true,
  name: true,
  avatarUrl: true,
  bio: true,
  className: true,
  graduationYear: true,
  createdAt: true,
  studentProfile: { select: { skills: true, portfolioLinks: true } },
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: SAFE_USER_SELECT });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  findStudents(status?: UserStatus) {
    return this.prisma.user.findMany({
      where: { role: Role.student, ...(status ? { status } : {}) },
      select: SAFE_USER_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStudent(dto: CreateStudentDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        bio: dto.bio,
        className: dto.className,
        graduationYear: dto.graduationYear,
        role: Role.student,
        status: UserStatus.approved,
        studentProfile: { create: { skills: dto.skills ?? [], portfolioLinks: [] } },
      },
      select: SAFE_USER_SELECT,
    });
    return user;
  }

  async setStatus(id: string, status: typeof UserStatus.approved | typeof UserStatus.rejected) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== Role.student) throw new ForbiddenException('Only student accounts can be approved or rejected');

    return this.prisma.user.update({ where: { id }, data: { status }, select: SAFE_USER_SELECT });
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
        className: dto.className,
        graduationYear: dto.graduationYear,
        studentProfile:
          dto.skills !== undefined || dto.portfolioLinks !== undefined
            ? {
                upsert: {
                  create: { skills: dto.skills ?? [], portfolioLinks: dto.portfolioLinks ?? [] },
                  update: {
                    ...(dto.skills !== undefined ? { skills: dto.skills } : {}),
                    ...(dto.portfolioLinks !== undefined ? { portfolioLinks: dto.portfolioLinks } : {}),
                  },
                },
              }
            : undefined,
      },
      select: SAFE_USER_SELECT,
    });
  }
}

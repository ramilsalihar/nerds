import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '../generated/prisma/enums.js';
import type { CreateStudentDto } from './dto/create-student.dto.js';

const SAFE_USER_SELECT = {
  id: true,
  email: true,
  role: true,
  name: true,
  avatarUrl: true,
  bio: true,
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

  findStudents() {
    return this.prisma.user.findMany({
      where: { role: Role.student },
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
        role: Role.student,
        studentProfile: dto.skills?.length
          ? { create: { skills: dto.skills, portfolioLinks: [] } }
          : undefined,
      },
      select: SAFE_USER_SELECT,
    });
    return user;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { VerificationStatus } from '../generated/prisma/enums.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async verify(id: string) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { verificationStatus: VerificationStatus.verified },
    });
  }
}

import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProjectStatus, Role } from '../generated/prisma/enums.js';
import type { CreateProjectDto } from './dto/create-project.dto.js';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  findOpen() {
    return this.prisma.project.findMany({ where: { status: ProjectStatus.open } });
  }

  findPendingReview() {
    return this.prisma.project.findMany({ where: { status: ProjectStatus.pending_review } });
  }

  findMineAsClient(clientId: string) {
    return this.prisma.project.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findMineAsStudent(studentId: string) {
    return this.prisma.project.findMany({
      where: { assignedStudentId: studentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true } },
        assignedStudent: { select: { id: true, name: true } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  create(creatorId: string, creatorRole: Role, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        clientId: creatorId,
        title: dto.title,
        description: dto.description,
        technicalSpec: dto.technicalSpec,
        budgetType: dto.budgetType,
        budgetAmount: dto.budgetAmount,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        status: creatorRole === Role.admin ? ProjectStatus.open : ProjectStatus.pending_review,
      },
    });
  }

  async approve(id: string) {
    const project = await this.findOne(id);
    this.assertStatus(project.status, ProjectStatus.pending_review);
    return this.prisma.project.update({
      where: { id },
      data: { status: ProjectStatus.open },
    });
  }

  async reject(id: string) {
    const project = await this.findOne(id);
    this.assertStatus(project.status, ProjectStatus.pending_review);
    return this.prisma.project.update({
      where: { id },
      data: { status: ProjectStatus.rejected },
    });
  }

  private assertStatus(actual: ProjectStatus, expected: ProjectStatus) {
    if (actual !== expected) {
      throw new ForbiddenException(`Project must be in "${expected}" status for this action`);
    }
  }
}

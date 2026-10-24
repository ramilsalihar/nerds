import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ApplicationStatus, ProjectStatus } from '../generated/prisma/enums.js';
import type { CreateApplicationDto } from './dto/create-application.dto.js';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async apply(projectId: string, studentId: string, dto: CreateApplicationDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.status !== ProjectStatus.open) {
      throw new ForbiddenException('Project is not open for applications');
    }

    return this.prisma.application.create({
      data: {
        projectId,
        studentId,
        message: dto.message,
        proposedPrice: dto.proposedPrice,
      },
    });
  }

  async listForProject(projectId: string) {
    return this.prisma.application.findMany({
      where: { projectId },
      include: { student: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listMine(studentId: string) {
    return this.prisma.application.findMany({
      where: { studentId },
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async accept(applicationId: string, requesterId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { project: true },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.project.clientId !== requesterId) {
      throw new ForbiddenException('Only the owning client can accept an application');
    }
    if (application.project.status !== ProjectStatus.open) {
      throw new ForbiddenException('Project is not open');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.application.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.accepted },
      });

      await tx.application.updateMany({
        where: { projectId: application.projectId, id: { not: applicationId } },
        data: { status: ApplicationStatus.rejected },
      });

      return tx.project.update({
        where: { id: application.projectId },
        data: {
          status: ProjectStatus.in_progress,
          assignedStudentId: application.studentId,
        },
      });
    });
  }
}

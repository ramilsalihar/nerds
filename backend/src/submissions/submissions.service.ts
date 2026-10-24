import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  LedgerEntryType,
  ProjectStatus,
  SubmissionStatus,
  TransactionStatus,
} from '../generated/prisma/enums.js';
import type { CreateSubmissionDto } from './dto/create-submission.dto.js';

// Open decision (spec commands/spec.md §9): % of budget routed to the donation pool.
// Defaults to 10% until that's settled; override with DONATION_POOL_PERCENT.
const DONATION_POOL_PERCENT = Number(process.env.DONATION_POOL_PERCENT ?? 10) / 100;

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async listForProject(projectId: string, requesterId: string, requesterRole: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    const isOwner = project.clientId === requesterId;
    const isAssignedStudent = project.assignedStudentId === requesterId;
    if (!isOwner && !isAssignedStudent && requesterRole !== 'admin') {
      throw new ForbiddenException('Not authorized to view submissions for this project');
    }

    return this.prisma.submission.findMany({
      where: { projectId },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async submit(projectId: string, studentId: string, dto: CreateSubmissionDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.assignedStudentId !== studentId) {
      throw new ForbiddenException('Only the assigned student can submit work');
    }
    if (project.status !== ProjectStatus.in_progress) {
      throw new ForbiddenException('Project is not in progress');
    }

    await this.prisma.project.update({
      where: { id: projectId },
      data: { status: ProjectStatus.submitted },
    });

    return this.prisma.submission.create({
      data: {
        projectId,
        studentId,
        files: dto.files,
        notes: dto.notes,
      },
    });
  }

  async approve(submissionId: string, requesterId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { project: true },
    });
    if (!submission) throw new NotFoundException('Submission not found');
    if (submission.project.clientId !== requesterId) {
      throw new ForbiddenException('Only the owning client can approve a submission');
    }

    const total = submission.project.budgetAmount;
    const toDonationPool = total.toNumber() * DONATION_POOL_PERCENT;
    const toStudent = total.toNumber() - toDonationPool;

    return this.prisma.$transaction(async (tx) => {
      await tx.submission.update({
        where: { id: submissionId },
        data: { status: SubmissionStatus.approved },
      });

      await tx.project.update({
        where: { id: submission.projectId },
        data: { status: ProjectStatus.completed },
      });

      const transaction = await tx.transaction.create({
        data: {
          projectId: submission.projectId,
          amountTotal: total,
          amountToStudent: toStudent,
          amountToDonationPool: toDonationPool,
          status: TransactionStatus.released,
        },
      });

      await tx.donationPoolLedger.create({
        data: {
          transactionId: transaction.id,
          amount: toDonationPool,
          type: LedgerEntryType.inflow,
          description: `Project ${submission.projectId} completion`,
        },
      });

      return transaction;
    });
  }

  async requestChanges(submissionId: string, requesterId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { project: true },
    });
    if (!submission) throw new NotFoundException('Submission not found');
    if (submission.project.clientId !== requesterId) {
      throw new ForbiddenException('Only the owning client can request changes');
    }

    await this.prisma.project.update({
      where: { id: submission.projectId },
      data: { status: ProjectStatus.in_progress },
    });

    return this.prisma.submission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.changes_requested },
    });
  }
}

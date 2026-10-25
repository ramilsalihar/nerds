import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateProjectDto } from './dto/create-project.dto.js';
import type { UpdateProjectDto } from './dto/update-project.dto.js';
import type { CreateCommentDto } from './dto/create-comment.dto.js';

const STUDENT_SELECT = { select: { id: true, name: true, avatarUrl: true } };

// Composite leaderboard score — weights are a product decision, tune here.
function scoreOf(project: {
  uiUxRating: number;
  functionalityRating: number;
  usersCount: number;
  revenueAmount: unknown;
  likeCount: number;
  deployed: boolean;
}): number {
  const revenue = Number(project.revenueAmount);
  const raw =
    project.uiUxRating * 8 +
    project.functionalityRating * 8 +
    Math.log10(project.usersCount + 1) * 15 +
    Math.log10(revenue + 1) * 10 +
    project.likeCount * 2 +
    (project.deployed ? 15 : 0);
  return Math.round(raw * 10) / 10;
}

function withRanking<T extends { id: string }>(
  projects: (T & Parameters<typeof scoreOf>[0])[],
) {
  const ranked = projects
    .map((p) => ({ ...p, score: scoreOf(p) }))
    .sort((a, b) => b.score - a.score);
  return ranked.map((p, index) => ({ ...p, rank: index + 1 }));
}

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const projects = await this.prisma.project.findMany({
      include: { student: STUDENT_SELECT, _count: { select: { comments: true } } },
    });
    return withRanking(projects);
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        student: STUDENT_SELECT,
        comments: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return { ...project, score: scoreOf(project) };
  }

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        studentId: dto.studentId,
        title: dto.title,
        description: dto.description,
        repoUrl: dto.repoUrl,
        liveUrl: dto.liveUrl,
        deployed: dto.deployed ?? false,
        usersCount: dto.usersCount ?? 0,
        revenueAmount: dto.revenueAmount ?? 0,
        uiUxRating: dto.uiUxRating ?? 0,
        functionalityRating: dto.functionalityRating ?? 0,
      },
      include: { student: STUDENT_SELECT },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.assertExists(id);
    return this.prisma.project.update({
      where: { id },
      data: dto,
      include: { student: STUDENT_SELECT },
    });
  }

  async remove(id: string) {
    await this.assertExists(id);
    await this.prisma.$transaction([
      this.prisma.comment.deleteMany({ where: { projectId: id } }),
      this.prisma.like.deleteMany({ where: { projectId: id } }),
      this.prisma.project.delete({ where: { id } }),
    ]);
    return { id };
  }

  async toggleLike(projectId: string, viewerToken: string) {
    await this.assertExists(projectId);
    const existing = await this.prisma.like.findUnique({
      where: { projectId_viewerToken: { projectId, viewerToken } },
    });

    if (existing) {
      const [, project] = await this.prisma.$transaction([
        this.prisma.like.delete({ where: { id: existing.id } }),
        this.prisma.project.update({ where: { id: projectId }, data: { likeCount: { decrement: 1 } } }),
      ]);
      return { liked: false, likeCount: project.likeCount };
    }

    const [, project] = await this.prisma.$transaction([
      this.prisma.like.create({ data: { projectId, viewerToken } }),
      this.prisma.project.update({ where: { id: projectId }, data: { likeCount: { increment: 1 } } }),
    ]);
    return { liked: true, likeCount: project.likeCount };
  }

  async addComment(projectId: string, dto: CreateCommentDto) {
    await this.assertExists(projectId);
    return this.prisma.comment.create({
      data: { projectId, authorName: dto.authorName, body: dto.body },
    });
  }

  listComments(projectId: string) {
    return this.prisma.comment.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
  }

  private async assertExists(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }
}

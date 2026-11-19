import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UploadsService } from '../uploads/uploads.service.js';
import { ProjectType, Role } from '../generated/prisma/enums.js';
import type { CreateProjectDto } from './dto/create-project.dto.js';
import type { UpdateProjectDto } from './dto/update-project.dto.js';
import type { CreateCommentDto } from './dto/create-comment.dto.js';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}

const STUDENT_SELECT = { select: { id: true, name: true, avatarUrl: true } };

interface ScoreInput {
  type: ProjectType;
  uiUxRating: number;
  functionalityRating: number;
  usersCount: number;
  revenueAmount: unknown;
  likeCount: number;
  deployed: boolean;
}

// Composite leaderboard score — weights are a product decision, tune here.
// Startups are judged on traction (users + revenue). Outsource projects are
// client work: the client owns the users, so we judge delivery quality and
// what the client paid instead.
const SCORE_WEIGHTS: Record<ProjectType, {
  uiUx: number;
  functionality: number;
  users: number;
  revenue: number;
  like: number;
  deployed: number;
}> = {
  [ProjectType.startup]: { uiUx: 8, functionality: 8, users: 15, revenue: 10, like: 2, deployed: 15 },
  [ProjectType.outsource]: { uiUx: 12, functionality: 12, users: 0, revenue: 12, like: 2, deployed: 15 },
};

function scoreOf(project: ScoreInput): number {
  const w = SCORE_WEIGHTS[project.type];
  const revenue = Number(project.revenueAmount);
  const raw =
    project.uiUxRating * w.uiUx +
    project.functionalityRating * w.functionality +
    Math.log10(project.usersCount + 1) * w.users +
    Math.log10(revenue + 1) * w.revenue +
    project.likeCount * w.like +
    (project.deployed ? w.deployed : 0);
  return Math.round(raw * 10) / 10;
}

function withRanking<T extends { id: string }>(
  projects: (T & ScoreInput)[],
) {
  const ranked = projects
    .map((p) => ({ ...p, score: scoreOf(p) }))
    .sort((a, b) => b.score - a.score);
  return ranked.map((p, index) => ({ ...p, rank: index + 1 }));
}

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private uploads: UploadsService,
  ) {}

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

  create(dto: CreateProjectDto, user: AuthenticatedUser) {
    const studentId = user.role === Role.admin ? dto.studentId : user.id;
    if (!studentId) throw new BadRequestException('studentId is required');

    return this.prisma.project.create({
      data: {
        studentId,
        title: dto.title,
        description: dto.description,
        repoUrl: dto.repoUrl,
        liveUrl: dto.liveUrl,
        videoUrl: dto.videoUrl,
        imageUrls: dto.imageUrls ?? [],
        type: dto.type ?? ProjectType.startup,
        deployed: dto.deployed ?? false,
        usersCount: dto.usersCount ?? 0,
        revenueAmount: dto.revenueAmount ?? 0,
        uiUxRating: dto.uiUxRating ?? 0,
        functionalityRating: dto.functionalityRating ?? 0,
      },
      include: { student: STUDENT_SELECT },
    });
  }

  async update(id: string, dto: UpdateProjectDto, user: AuthenticatedUser) {
    const project = await this.assertExists(id);
    this.assertOwnership(project, user);
    const updated = await this.prisma.project.update({
      where: { id },
      data: dto,
      include: { student: STUDENT_SELECT },
    });
    if (dto.imageUrls) {
      const kept = new Set(dto.imageUrls);
      await this.uploads.deleteImages(project.imageUrls.filter((url) => !kept.has(url)));
    }
    return updated;
  }

  async remove(id: string, user: AuthenticatedUser) {
    const project = await this.assertExists(id);
    this.assertOwnership(project, user);
    await this.prisma.$transaction([
      this.prisma.comment.deleteMany({ where: { projectId: id } }),
      this.prisma.like.deleteMany({ where: { projectId: id } }),
      this.prisma.project.delete({ where: { id } }),
    ]);
    await this.uploads.deleteImages(project.imageUrls);
    return { id };
  }

  private assertOwnership(project: { studentId: string }, user: AuthenticatedUser) {
    if (user.role !== Role.admin && project.studentId !== user.id) {
      throw new ForbiddenException('You can only manage your own project');
    }
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

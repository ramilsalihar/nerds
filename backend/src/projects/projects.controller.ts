import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Role } from '../generated/prisma/enums.js';
import { ProjectsService } from './projects.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  findOpen() {
    return this.projectsService.findOpen();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Get('pending-review')
  findPendingReview() {
    return this.projectsService.findPendingReview();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.client, Role.admin)
  @Get('mine/client')
  findMineAsClient(@CurrentUser() user: { id: string }) {
    return this.projectsService.findMineAsClient(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.student)
  @Get('mine/student')
  findMineAsStudent(@CurrentUser() user: { id: string }) {
    return this.projectsService.findMineAsStudent(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.client, Role.admin)
  @Post()
  create(@CurrentUser() user: { id: string; role: Role }, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(user.id, user.role, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.projectsService.approve(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.projectsService.reject(id);
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../generated/prisma/enums.js';
import { ProjectsService } from './projects.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { LikeProjectDto } from './dto/like-project.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Post(':id/like')
  toggleLike(@Param('id') id: string, @Body() dto: LikeProjectDto) {
    return this.projectsService.toggleLike(id, dto.viewerToken);
  }

  @Get(':id/comments')
  listComments(@Param('id') id: string) {
    return this.projectsService.listComments(id);
  }

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() dto: CreateCommentDto) {
    return this.projectsService.addComment(id, dto);
  }
}

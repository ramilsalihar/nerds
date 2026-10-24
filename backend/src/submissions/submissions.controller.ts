import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Role } from '../generated/prisma/enums.js';
import { SubmissionsService } from './submissions.service.js';
import { CreateSubmissionDto } from './dto/create-submission.dto.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class SubmissionsController {
  constructor(private submissionsService: SubmissionsService) {}

  @Get('projects/:projectId/submissions')
  listForProject(@Param('projectId') projectId: string, @CurrentUser() user: { id: string; role: Role }) {
    return this.submissionsService.listForProject(projectId, user.id, user.role);
  }

  @Roles(Role.student)
  @Post('projects/:projectId/submissions')
  submit(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateSubmissionDto,
  ) {
    return this.submissionsService.submit(projectId, user.id, dto);
  }

  @Roles(Role.client)
  @Patch('submissions/:id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.submissionsService.approve(id, user.id);
  }

  @Roles(Role.client)
  @Patch('submissions/:id/request-changes')
  requestChanges(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.submissionsService.requestChanges(id, user.id);
  }
}

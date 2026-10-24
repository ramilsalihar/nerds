import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Role } from '../generated/prisma/enums.js';
import { ApplicationsService } from './applications.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Roles(Role.student)
  @Post('projects/:projectId/applications')
  apply(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.apply(projectId, user.id, dto);
  }

  @Roles(Role.client, Role.admin)
  @Get('projects/:projectId/applications')
  listForProject(@Param('projectId') projectId: string) {
    return this.applicationsService.listForProject(projectId);
  }

  @Roles(Role.student)
  @Get('applications/mine')
  listMine(@CurrentUser() user: { id: string }) {
    return this.applicationsService.listMine(user.id);
  }

  @Roles(Role.client)
  @Patch('applications/:id/accept')
  accept(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.applicationsService.accept(id, user.id);
  }
}

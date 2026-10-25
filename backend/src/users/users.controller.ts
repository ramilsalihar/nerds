import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Role, UserStatus } from '../generated/prisma/enums.js';
import { UsersService } from './users.service.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Get('students')
  findStudents(@Query('status') status?: UserStatus) {
    return this.usersService.findStudents(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Post('students')
  createStudent(@Body() dto: CreateStudentDto) {
    return this.usersService.createStudent(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.usersService.setStatus(id, UserStatus.approved);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.usersService.setStatus(id, UserStatus.rejected);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateProfile(@Param('id') id: string, @Body() dto: UpdateProfileDto, @CurrentUser() user: AuthenticatedUser) {
    if (user.role !== Role.admin && user.id !== id) {
      throw new ForbiddenException('You can only edit your own profile');
    }
    return this.usersService.updateProfile(id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../generated/prisma/enums.js';
import { UsersService } from './users.service.js';
import { CreateStudentDto } from './dto/create-student.dto.js';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Get('students')
  findStudents() {
    return this.usersService.findStudents();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Post('students')
  createStudent(@Body() dto: CreateStudentDto) {
    return this.usersService.createStudent(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}

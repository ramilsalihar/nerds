import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { ProjectsModule } from './projects/projects.module.js';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ProjectsModule],
})
export class AppModule {}

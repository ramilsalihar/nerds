import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { ApplicationsModule } from './applications/applications.module.js';
import { SubmissionsModule } from './submissions/submissions.module.js';
import { DonationPoolModule } from './donation-pool/donation-pool.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    ApplicationsModule,
    SubmissionsModule,
    DonationPoolModule,
  ],
})
export class AppModule {}

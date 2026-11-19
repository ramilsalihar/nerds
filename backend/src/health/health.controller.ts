import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

// Pinged by .github/workflows/keep-alive.yml so Render's free instance
// doesn't spin down (it sleeps after ~15 min idle and takes 30s+ to wake,
// longer than social crawlers wait for link previews). The DB round-trip
// keeps the connection pool warm too.
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException({ status: 'error', db: 'down' });
    }
    return { status: 'ok' };
  }
}

import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  const passwordHash = await hash('password123');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nerds.dev' },
    update: {},
    create: { email: 'admin@nerds.dev', passwordHash, role: 'admin', name: 'Admin' },
  });

  const alex = await prisma.user.upsert({
    where: { email: 'alex@nerds.dev' },
    update: {},
    create: {
      email: 'alex@nerds.dev',
      passwordHash,
      role: 'student',
      name: 'Alex Kim',
      className: 'Cohort 2026-A',
      graduationYear: 2026,
      studentProfile: { create: { skills: ['React', 'TypeScript', 'Tailwind'], portfolioLinks: ['https://alexkim.dev'] } },
    },
  });

  const jordan = await prisma.user.upsert({
    where: { email: 'jordan@nerds.dev' },
    update: {},
    create: {
      email: 'jordan@nerds.dev',
      passwordHash,
      role: 'student',
      name: 'Jordan Lee',
      className: 'Cohort 2025-B',
      graduationYear: 2025,
      studentProfile: { create: { skills: ['Node.js', 'PostgreSQL', 'NestJS'], portfolioLinks: ['https://github.com/jordanlee'] } },
    },
  });

  const sam = await prisma.user.upsert({
    where: { email: 'sam@nerds.dev' },
    update: {},
    create: {
      email: 'sam@nerds.dev',
      passwordHash,
      role: 'student',
      name: 'Sam Rivera',
      className: 'Cohort 2026-A',
      graduationYear: 2026,
      studentProfile: { create: { skills: ['Figma', 'UI Design'], portfolioLinks: [] } },
    },
  });

  await prisma.user.upsert({
    where: { email: 'taylor@nerds.dev' },
    update: {},
    create: {
      email: 'taylor@nerds.dev',
      passwordHash,
      role: 'student',
      status: 'pending',
      name: 'Taylor Nguyen',
      className: 'Cohort 2026-B',
      graduationYear: 2026,
      studentProfile: { create: { skills: ['Python', 'Django'], portfolioLinks: [] } },
    },
  });

  await prisma.project.create({
    data: {
      studentId: jordan.id,
      title: 'Nonprofit inventory tracker',
      description: 'Simple CRUD app so a local food bank can track donated inventory by category.',
      repoUrl: 'https://github.com/jordanlee/inventory-tracker',
      liveUrl: 'https://inventory-tracker.example.com',
      deployed: true,
      usersCount: 240,
      revenueAmount: 0,
      uiUxRating: 4.2,
      functionalityRating: 4.6,
    },
  });

  await prisma.project.create({
    data: {
      studentId: alex.id,
      title: 'Marketing analytics dashboard',
      description: 'Dashboard pulling campaign spend and conversion data into one view.',
      repoUrl: 'https://github.com/alexkim/analytics-dash',
      liveUrl: 'https://analytics-dash.example.com',
      deployed: true,
      usersCount: 85,
      revenueAmount: 1200,
      uiUxRating: 4.8,
      functionalityRating: 4.1,
    },
  });

  await prisma.project.create({
    data: {
      studentId: sam.id,
      title: 'Campus event finder',
      description: 'Browse and RSVP to campus events, with a Figma-polished UI.',
      deployed: false,
      usersCount: 10,
      revenueAmount: 0,
      uiUxRating: 4.9,
      functionalityRating: 2.5,
    },
  });

  console.log('Seeded:', {
    admin: admin.email,
    students: [alex.email, jordan.email, sam.email],
    password: 'password123 (for every seeded user)',
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

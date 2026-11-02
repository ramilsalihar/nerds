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
    students: [sam.email],
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

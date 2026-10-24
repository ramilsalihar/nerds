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
    create: { email: 'admin@nerds.dev', passwordHash, role: 'admin', name: 'Admin', verificationStatus: 'verified' },
  });

  const acme = await prisma.user.upsert({
    where: { email: 'acme@nerds.dev' },
    update: {},
    create: {
      email: 'acme@nerds.dev',
      passwordHash,
      role: 'client',
      name: 'Acme Co',
      verificationStatus: 'verified',
      clientProfile: { create: { companyName: 'Acme Co', companyWebsite: 'https://acme.example' } },
    },
  });

  const initech = await prisma.user.upsert({
    where: { email: 'initech@nerds.dev' },
    update: {},
    create: {
      email: 'initech@nerds.dev',
      passwordHash,
      role: 'client',
      name: 'Initech',
      verificationStatus: 'pending',
      clientProfile: { create: { companyName: 'Initech', companyWebsite: 'https://initech.example' } },
    },
  });

  const alex = await prisma.user.upsert({
    where: { email: 'alex@nerds.dev' },
    update: {},
    create: {
      email: 'alex@nerds.dev',
      passwordHash,
      role: 'student',
      name: 'Alex Kim',
      verificationStatus: 'verified',
      studentProfile: {
        create: { skills: ['React', 'TypeScript', 'Tailwind'], portfolioLinks: ['https://alexkim.dev'] },
      },
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
      verificationStatus: 'verified',
      studentProfile: {
        create: { skills: ['Node.js', 'PostgreSQL', 'NestJS'], portfolioLinks: ['https://github.com/jordanlee'] },
      },
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
      verificationStatus: 'unverified',
      studentProfile: { create: { skills: ['Figma', 'UI Design'], portfolioLinks: [] } },
    },
  });

  const inTwoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const landingPage = await prisma.project.create({
    data: {
      clientId: acme.id,
      title: 'Build a landing page',
      description: 'Need a responsive marketing landing page for our new product launch.',
      budgetType: 'fixed_tier',
      budgetAmount: 450,
      status: 'open',
      deadline: inTwoWeeks,
    },
  });

  const onboardingRedesign = await prisma.project.create({
    data: {
      clientId: initech.id,
      title: 'Redesign onboarding flow',
      description: 'Simplify our 6-step signup into something a first-time user can finish in under a minute.',
      technicalSpec: 'Existing flow lives in /src/onboarding — happy to share Figma access on request.',
      budgetType: 'custom',
      budgetAmount: 900,
      status: 'pending_review',
    },
  });

  const analyticsDashboard = await prisma.project.create({
    data: {
      clientId: acme.id,
      title: 'Marketing analytics dashboard',
      description: 'Internal dashboard pulling campaign spend + conversion data into one view.',
      budgetType: 'fixed_tier',
      budgetAmount: 700,
      status: 'in_progress',
      assignedStudentId: alex.id,
    },
  });

  const inventoryTracker = await prisma.project.create({
    data: {
      clientId: initech.id,
      title: 'Nonprofit inventory tracker',
      description: 'Simple CRUD app so a local food bank can track donated inventory by category.',
      budgetType: 'fixed_tier',
      budgetAmount: 900,
      status: 'completed',
      assignedStudentId: jordan.id,
    },
  });

  await prisma.project.create({
    data: {
      clientId: acme.id,
      title: 'Sketchy crypto trading bot',
      description: 'Automated trading bot promising guaranteed returns.',
      budgetType: 'custom',
      budgetAmount: 5000,
      status: 'rejected',
    },
  });

  await prisma.application.create({
    data: { projectId: landingPage.id, studentId: sam.id, message: "I'd love to take this on — here's my portfolio." },
  });

  await prisma.application.create({
    data: {
      projectId: analyticsDashboard.id,
      studentId: alex.id,
      message: 'Built something similar for a campus club last semester.',
      status: 'accepted',
    },
  });

  await prisma.application.create({
    data: {
      projectId: analyticsDashboard.id,
      studentId: jordan.id,
      message: 'Happy to help if Alex needs a hand.',
      status: 'rejected',
    },
  });

  await prisma.submission.create({
    data: {
      projectId: inventoryTracker.id,
      studentId: jordan.id,
      files: ['https://github.com/jordanlee/inventory-tracker'],
      notes: 'Deployed to Render, admin login is seeded with demo/demo.',
      status: 'approved',
    },
  });

  const inventoryTx = await prisma.transaction.create({
    data: {
      projectId: inventoryTracker.id,
      amountTotal: 900,
      amountToStudent: 810,
      amountToDonationPool: 90,
      status: 'released',
    },
  });

  await prisma.donationPoolLedger.create({
    data: {
      transactionId: inventoryTx.id,
      amount: 90,
      type: 'inflow',
      description: 'Donation pool cut — Nonprofit inventory tracker',
    },
  });

  await prisma.donationPoolLedger.createMany({
    data: [
      { amount: 25, type: 'inflow', description: 'Donation from Taylor Morgan' },
      { amount: 100, type: 'inflow', description: 'Donation from an anonymous supporter' },
      { amount: 40, type: 'outflow', description: 'Hosting credits for student projects — March' },
    ],
  });

  await prisma.review.create({
    data: {
      projectId: inventoryTracker.id,
      reviewerId: initech.id,
      revieweeId: jordan.id,
      rating: 5,
      comment: 'Delivered early and communicated clearly the whole way through.',
    },
  });

  console.log('Seeded:', {
    users: { admin: admin.email, acme: acme.email, initech: initech.email, alex: alex.email, jordan: jordan.email, sam: sam.email },
    projects: {
      open: landingPage.title,
      pending_review: onboardingRedesign.title,
      in_progress: analyticsDashboard.title,
      completed: inventoryTracker.title,
    },
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

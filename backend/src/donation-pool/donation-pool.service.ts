import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateDonationDto } from './dto/create-donation.dto.js';

@Injectable()
export class DonationPoolService {
  constructor(private prisma: PrismaService) {}

  ledger() {
    return this.prisma.donationPoolLedger.findMany({ orderBy: { createdAt: 'desc' } });
  }

  donate(dto: CreateDonationDto) {
    return this.prisma.donationPoolLedger.create({
      data: {
        amount: dto.amount,
        type: 'inflow',
        donorName: dto.donorName,
        donorEmail: dto.donorEmail,
        description: dto.message?.trim() || 'Public donation',
      },
    });
  }
}

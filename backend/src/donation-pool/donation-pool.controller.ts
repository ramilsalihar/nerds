import { Body, Controller, Get, Post } from '@nestjs/common';
import { DonationPoolService } from './donation-pool.service.js';
import { CreateDonationDto } from './dto/create-donation.dto.js';

@Controller('donation-pool')
export class DonationPoolController {
  constructor(private donationPoolService: DonationPoolService) {}

  @Get('ledger')
  ledger() {
    return this.donationPoolService.ledger();
  }

  @Post('donate')
  donate(@Body() dto: CreateDonationDto) {
    return this.donationPoolService.donate(dto);
  }
}

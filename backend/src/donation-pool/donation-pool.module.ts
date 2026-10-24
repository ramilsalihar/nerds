import { Module } from '@nestjs/common';
import { DonationPoolController } from './donation-pool.controller.js';
import { DonationPoolService } from './donation-pool.service.js';

@Module({
  controllers: [DonationPoolController],
  providers: [DonationPoolService],
})
export class DonationPoolModule {}

import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type {} from 'multer';
import { MAX_IMAGE_BYTES, UploadsService } from './uploads.service.js';

@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  // Any logged-in user (approved student or admin) can upload. Attaching the
  // returned URL to a project still goes through the project ownership check.
  @UseGuards(JwtAuthGuard)
  @Post('image')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_IMAGE_BYTES, files: 1 } }))
  uploadImage(@UploadedFile() file: Express.Multer.File | undefined, @CurrentUser() user: { id: string }) {
    return this.uploadsService.uploadImage(file, user.id);
  }
}

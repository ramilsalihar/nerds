import { BadRequestException, HttpException, HttpStatus, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import type {} from 'multer';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

// Cloudinary is configured from the CLOUDINARY_URL env var
// (cloudinary://<api_key>:<api_secret>@<cloud_name>), which the SDK reads on import.

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const FOLDER = 'nerds/projects';
const MAX_DIMENSION = 1600;

// Generous for ~20 students; stops a runaway script from burning the free tier.
const UPLOADS_PER_HOUR = 60;
const HOUR_MS = 60 * 60 * 1000;

type ImageKind = 'jpeg' | 'png' | 'webp';

// Check the file's magic bytes rather than trusting the client's mimetype/extension.
export function detectImageKind(buf: Buffer): ImageKind | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

// Cloudinary public_id for an image we uploaded, or null for any other URL.
export function publicIdFromUrl(url: string, cloudName: string | undefined): string | null {
  if (!cloudName) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.hostname !== 'res.cloudinary.com') return null;
  const prefix = `/${cloudName}/image/upload/`;
  if (!parsed.pathname.startsWith(prefix)) return null;
  const rest = parsed.pathname.slice(prefix.length).replace(/^v\d+\//, '');
  if (!rest.startsWith(`${FOLDER}/`)) return null;
  return rest.replace(/\.[a-z0-9]+$/i, '');
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly recentUploads = new Map<string, number[]>();

  private get cloudName(): string | undefined {
    return cloudinary.config().cloud_name;
  }

  async uploadImage(file: Express.Multer.File | undefined, userId: string): Promise<{ url: string }> {
    if (!this.cloudName) throw new ServiceUnavailableException('Image uploads are not configured on this server.');
    if (!file) throw new BadRequestException('No file uploaded (expected form field "file").');
    if (!detectImageKind(file.buffer)) throw new BadRequestException('Only JPEG, PNG or WebP images are allowed.');
    this.checkRateLimit(userId);

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: FOLDER,
          resource_type: 'image',
          // Normalize on Cloudinary's side too: cap size and store as WebP.
          transformation: [{ width: MAX_DIMENSION, height: MAX_DIMENSION, crop: 'limit' }],
          format: 'webp',
        },
        (error, res) => (error || !res ? reject(error ?? new Error('Empty upload response')) : resolve(res)),
      );
      stream.end(file.buffer);
    }).catch((err: unknown) => {
      this.logger.error(`Cloudinary upload failed: ${String(err)}`);
      throw new ServiceUnavailableException('Image upload failed. Please try again.');
    });

    return { url: result.secure_url };
  }

  // Delete images we host; URLs pointing anywhere else are ignored. Never throws.
  async deleteImages(urls: string[]): Promise<void> {
    const publicIds = urls.map((u) => publicIdFromUrl(u, this.cloudName)).filter((id): id is string => !!id);
    if (publicIds.length === 0) return;
    try {
      await cloudinary.api.delete_resources(publicIds, { resource_type: 'image' });
    } catch (err) {
      this.logger.warn(`Failed to delete Cloudinary images ${publicIds.join(', ')}: ${String(err)}`);
    }
  }

  private checkRateLimit(userId: string) {
    const now = Date.now();
    const recent = (this.recentUploads.get(userId) ?? []).filter((t) => now - t < HOUR_MS);
    if (recent.length >= UPLOADS_PER_HOUR) {
      throw new HttpException('Upload limit reached. Try again in an hour.', HttpStatus.TOO_MANY_REQUESTS);
    }
    recent.push(now);
    this.recentUploads.set(userId, recent);
  }
}

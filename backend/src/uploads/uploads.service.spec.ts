import { detectImageKind, publicIdFromUrl } from './uploads.service.js';

describe('detectImageKind', () => {
  it('recognizes JPEG, PNG and WebP by magic bytes', () => {
    expect(detectImageKind(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('jpeg');
    expect(detectImageKind(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe('png');
    expect(detectImageKind(Buffer.from('RIFF\0\0\0\0WEBPVP8 ', 'binary'))).toBe('webp');
  });

  it('rejects other content even if it claims to be an image', () => {
    expect(detectImageKind(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBeNull();
    expect(detectImageKind(Buffer.from('GIF89a'))).toBeNull();
    expect(detectImageKind(Buffer.alloc(0))).toBeNull();
  });
});

describe('publicIdFromUrl', () => {
  const cloud = 'demo';

  it('extracts the public id from our uploaded image URLs', () => {
    expect(publicIdFromUrl('https://res.cloudinary.com/demo/image/upload/v1732000000/nerds/projects/abc123.webp', cloud)).toBe(
      'nerds/projects/abc123',
    );
    expect(publicIdFromUrl('https://res.cloudinary.com/demo/image/upload/nerds/projects/abc123.webp', cloud)).toBe('nerds/projects/abc123');
  });

  it('ignores URLs we do not own', () => {
    expect(publicIdFromUrl('https://i.imgur.com/abc.png', cloud)).toBeNull();
    expect(publicIdFromUrl('https://res.cloudinary.com/other/image/upload/v1/nerds/projects/abc.webp', cloud)).toBeNull();
    expect(publicIdFromUrl('https://res.cloudinary.com/demo/image/upload/v1/someone-else/abc.webp', cloud)).toBeNull();
    expect(publicIdFromUrl('not a url', cloud)).toBeNull();
    expect(publicIdFromUrl('https://res.cloudinary.com/demo/image/upload/v1/nerds/projects/abc.webp', undefined)).toBeNull();
  });
});

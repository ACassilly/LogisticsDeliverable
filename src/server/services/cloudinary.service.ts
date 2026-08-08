import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { InternalServerError } from '@/server/middlewares';

/**
 * Cloudflare R2 (S3-compatible) image storage service.
 *
 * Replaces Cloudinary. Uses R2 via the AWS S3 SDK.
 * Env vars:
 *   R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT,
 *   R2_BUCKET (default: user-assets), R2_PUBLIC_URL (default: https://assets.rivenai.io)
 */

const R2_BUCKET = process.env.R2_BUCKET || 'user-assets';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://assets.rivenai.io';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (s3Client) return s3Client;
  if (
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY ||
    !process.env.R2_ENDPOINT
  ) {
    throw new InternalServerError('Image storage (R2) is not configured');
  }
  s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
  return s3Client;
}

function checkConfig(): void {
  if (
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY ||
    !process.env.R2_ENDPOINT
  ) {
    throw new InternalServerError('Image storage (R2) is not configured');
  }
}

/** Upload response interface (kept for backward compat) */
export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Upload image to Cloudflare R2
 */
export async function uploadImage(
  file: File,
  folder = 'blog-images'
): Promise<CloudinaryUploadResult> {
  checkConfig();

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique key: folder/timestamp-random.ext
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type || 'image/jpeg',
        ContentLength: buffer.length,
      })
    );

    return {
      url: `${R2_PUBLIC_URL}/${key}`,
      publicId: key,
      width: 0,
      height: 0,
      format: ext,
      size: buffer.length,
    };
  } catch (error) {
    console.error('R2 upload error:', error);
    if (error instanceof Error) {
      throw new InternalServerError(`Image upload failed: ${error.message}`);
    }
    throw new InternalServerError('Image upload failed');
  }
}

/**
 * Delete image from Cloudflare R2
 */
export async function deleteImage(
  publicId: string
): Promise<{ success: boolean }> {
  checkConfig();

  try {
    const client = getS3Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: publicId,
      })
    );
    return { success: true };
  } catch (error) {
    console.error('R2 delete error:', error);
    if (error instanceof Error) {
      throw new InternalServerError(`Image deletion failed: ${error.message}`);
    }
    throw new InternalServerError('Image deletion failed');
  }
}

/**
 * Get image URL (R2 public URL)
 */
export function getImageUrl(
  publicId: string,
  _options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  }
): string {
  return `${R2_PUBLIC_URL}/${publicId}`;
}

/**
 * Extract public ID from R2 URL
 */
export function extractPublicId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.slice(1); // remove leading /
  } catch {
    return null;
  }
}

// Keep default export as null (cloudinary compat shim — unused)
export default null as any;

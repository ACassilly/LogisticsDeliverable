import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { InternalServerError } from '@/server/middlewares';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function checkCloudinaryConfig(): void {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new InternalServerError('Image upload service is not configured');
  }
}

export interface CloudinaryUploadResult {
  url: string; publicId: string; width: number; height: number; format: string; size: number;
}

export async function uploadImage(file: File, folder = 'blog-images'): Promise<CloudinaryUploadResult> {
  checkCloudinaryConfig();
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder, transformation: [{ width: 1200, height: 630, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }] },
        (error, result) => { if (error) reject(error); else if (result) resolve(result); else reject(new Error('Upload failed')); }
      ).end(buffer);
    });
    return { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height, format: result.format, size: result.bytes };
  } catch (error) {
    if (error instanceof Error) throw new InternalServerError(`Image upload failed: ${error.message}`);
    throw new InternalServerError('Image upload failed');
  }
}

export async function deleteImage(publicId: string): Promise<{ success: boolean }> {
  checkCloudinaryConfig();
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { success: result.result === 'ok' };
  } catch (error) {
    if (error instanceof Error) throw new InternalServerError(`Image deletion failed: ${error.message}`);
    throw new InternalServerError('Image deletion failed');
  }
}

export function getImageUrl(publicId: string, options?: { width?: number; height?: number; crop?: string; quality?: string }): string {
  return cloudinary.url(publicId, { ...options, secure: true });
}

export function extractPublicId(url: string): string | null {
  try {
    const regex = /\/v\d+\/(.+)\.[a-z]+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch { return null; }
}

export default cloudinary;

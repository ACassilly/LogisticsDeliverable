import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { InternalServerError } from '@/server/middlewares';

/**
 * Cloudinary configuration
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Check if Cloudinary is configured
 */
function checkCloudinaryConfig(): void {
  if (!process.env.CLOUDINARY_CLOUD_NAME || 
      !process.env.CLOUDINARY_API_KEY || 
      !process.env.CLOUDINARY_API_SECRET) {
    console.error('⚠️  Cloudinary credentials are not configured in environment variables');
    throw new InternalServerError('Image upload service is not configured');
  }
}

/**
 * Upload response interface
 */
export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Upload image to Cloudinary
 * 
 * @param file - File to upload
 * @param folder - Cloudinary folder (default: 'blog-images')
 * @returns Upload result with URL and metadata
 */
export async function uploadImage(
  file: File,
  folder = 'blog-images'
): Promise<CloudinaryUploadResult> {
  checkCloudinaryConfig();
  
  try {
    // Convert File to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to Cloudinary
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: folder,
          transformation: [
            { 
              width: 1200, 
              height: 630, 
              crop: 'limit', 
              quality: 'auto:good',
              fetch_format: 'auto',
            },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('Upload failed without error'));
          }
        }
      ).end(buffer);
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    if (error instanceof Error) {
      throw new InternalServerError(`Image upload failed: ${error.message}`);
    }
    
    throw new InternalServerError('Image upload failed');
  }
}

/**
 * Delete image from Cloudinary
 * 
 * @param publicId - Cloudinary public ID
 * @returns Deletion result
 */
export async function deleteImage(publicId: string): Promise<{ success: boolean }> {
  checkCloudinaryConfig();
  
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    return {
      success: result.result === 'ok',
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    
    if (error instanceof Error) {
      throw new InternalServerError(`Image deletion failed: ${error.message}`);
    }
    
    throw new InternalServerError('Image deletion failed');
  }
}

/**
 * Get image URL with transformations
 * 
 * @param publicId - Cloudinary public ID
 * @param options - Transformation options
 * @returns Transformed image URL
 */
export function getImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  }
): string {
  return cloudinary.url(publicId, {
    ...options,
    secure: true,
  });
}

/**
 * Extract public ID from Cloudinary URL
 * 
 * @param url - Cloudinary URL
 * @returns Public ID or null
 */
export function extractPublicId(url: string): string | null {
  try {
    const regex = /\/v\d+\/(.+)\.[a-z]+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}

export default cloudinary;


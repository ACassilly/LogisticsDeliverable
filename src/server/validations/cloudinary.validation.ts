import { z } from 'zod';

/**
 * Allowed image MIME types
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * Maximum file size (10MB in bytes)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validate uploaded file
 * 
 * This schema validates:
 * - File type (must be an image)
 * - File size (max 10MB)
 */
export const uploadFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'File is required')
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
    )
    .refine(
      (file) => ALLOWED_IMAGE_TYPES.includes(file.type),
      'File must be an image (JPEG, PNG, WebP, or GIF)'
    ),
});

/**
 * Validate file from FormData
 * Used for API route validation
 */
export function validateUploadedFile(file: File | null): {
  success: boolean;
  error?: string;
} {
  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      success: false,
      error: 'File must be an image (JPEG, PNG, WebP, or GIF)',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  if (file.size === 0) {
    return { success: false, error: 'File is empty' };
  }

  return { success: true };
}

/**
 * Type inference
 */
export type UploadFileInput = z.infer<typeof uploadFileSchema>;


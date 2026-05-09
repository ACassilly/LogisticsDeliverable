import { z } from 'zod';

/**
 * Base blog form schema with all fields
 * Used for form state management
 */
export const blogFormSchema = z.object({
  title: z.string().trim(),
  content: z.string().trim(),
  excerpt: z.string().trim(),
  category: z.string().trim(),
  tags: z.array(z.string().trim()).default([]),
  imageUrl: z.string().trim(),
});

/**
 * Draft blog schema - relaxed validation
 * Only title and category are required for drafts
 */
export const draftBlogFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title is required (minimum 2 characters)')
    .max(200, 'Title cannot exceed 200 characters'),
  content: z.string().trim().optional().or(z.literal('')),
  excerpt: z
    .string()
    .trim()
    .max(500, 'Excerpt cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  category: z.string().trim().min(1, 'Category is required to save as draft'),
  tags: z
    .array(z.string().trim())
    .max(10, 'Cannot have more than 10 tags')
    .default([]),
  imageUrl: z.string().trim().optional().or(z.literal('')),
});

/**
 * Published blog schema - strict validation
 * All fields required INCLUDING content (50+ chars)
 */
export const publishBlogFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  content: z
    .string()
    .trim()
    .min(50, 'Content must be at least 50 characters to publish')
    .refine(
      (content) => {
        // Remove HTML tags and check actual text length
        const textContent = content.replace(/<[^>]*>/g, '').trim();
        return textContent.length >= 50;
      },
      { message: 'Content must contain at least 50 characters of text (HTML tags excluded)' }
    ),
  excerpt: z
    .string()
    .trim()
    .max(500, 'Excerpt cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  category: z.string().trim().min(1, 'Category is required to publish'),
  tags: z
    .array(z.string().trim())
    .max(10, 'Cannot have more than 10 tags')
    .default([]),
  imageUrl: z.string().trim().optional().or(z.literal('')),
});

/**
 * Helper function to validate form data for draft
 */
export function validateDraft(data: Record<string, unknown>): { success: boolean; error?: string } {
  const result = draftBlogFormSchema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return { success: false, error: firstError.message };
  }
  return { success: true };
}

/**
 * Helper function to validate form data for publishing
 */
export function validatePublish(data: Record<string, unknown>): { success: boolean; error?: string } {
  const result = publishBlogFormSchema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return { success: false, error: firstError.message };
  }
  return { success: true };
}

export type BlogFormData = z.infer<typeof blogFormSchema>;
export type DraftBlogFormData = z.infer<typeof draftBlogFormSchema>;
export type PublishBlogFormData = z.infer<typeof publishBlogFormSchema>;


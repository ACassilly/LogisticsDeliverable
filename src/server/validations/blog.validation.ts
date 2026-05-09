import { z } from 'zod';
import { BlogCategory } from '@/server/db/models/blog.model';

/**
 * Blog category enum validation
 */
export const blogCategorySchema = z.nativeEnum(BlogCategory);
const normalizedBlogCategorySchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(blogCategorySchema);

/**
 * Slug validation schema
 * Validates URL-safe slugs (lowercase letters, numbers, hyphens)
 */
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(200, 'Slug cannot exceed 200 characters')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be lowercase letters, numbers, and hyphens only'
  );

/**
 * Schema for creating a blog draft (relaxed validation)
 * Only requires title OR content, but not both
 */
export const createDraftBlogSchema = z.object({
  title: z
    .string()
    .max(200, 'Title cannot exceed 200 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  content: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  excerpt: z
    .string()
    .max(500, 'Excerpt cannot exceed 500 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  category: z.union([normalizedBlogCategorySchema, z.literal(''), z.undefined()]).optional(),
  tags: z
    .array(z.string().trim().min(1, 'Tag cannot be empty'))
    .max(10, 'Cannot have more than 10 tags')
    .optional()
    .default([]),
  imageUrl: z
    .string()
    .url('Image URL must be a valid URL')
    .optional()
    .or(z.literal('')),
  published: z.boolean().optional().default(false),
}).refine(
  (data) => {
    // At least title or content must be provided
    return (data.title && data.title.trim().length > 0) || 
           (data.content && data.content.trim().length > 0);
  },
  {
    message: 'Either title or content must be provided for a draft',
  }
);

/**
 * Schema for creating/publishing a blog post (strict validation)
 */
export const createBlogSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  content: z
    .string()
    .min(10, 'Content must be at least 50 characters')
    .trim(),
  excerpt: z
    .string()
    .max(500, 'Excerpt cannot exceed 500 characters')
    .trim()
    .optional(),
  category: normalizedBlogCategorySchema,
  tags: z
    .array(z.string().trim().min(1, 'Tag cannot be empty'))
    .max(10, 'Cannot have more than 10 tags')
    .optional()
    .default([]),
  imageUrl: z
    .string()
    .url('Image URL must be a valid URL')
    .optional()
    .or(z.literal('')),
  published: z.boolean().optional().default(false),
});

/**
 * Schema for updating a blog post
 * All fields are optional
 */
export const updateBlogSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .trim()
    .optional(),
  content: z
    .string()
    .min(10, 'Content must be at least 50 characters')
    .trim()
    .optional(),
  excerpt: z
    .string()
    .max(500, 'Excerpt cannot exceed 500 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  category: normalizedBlogCategorySchema.optional(),
  tags: z
    .array(z.string().trim().min(1, 'Tag cannot be empty'))
    .max(10, 'Cannot have more than 10 tags')
    .optional(),
  imageUrl: z
    .string()
    .url('Image URL must be a valid URL')
    .optional()
    .or(z.literal('')),
  published: z.boolean().optional(),
  slug: slugSchema.optional(),
});

/**
 * Schema for blog query filters
 */
export const blogFiltersSchema = z.object({
  published: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  category: normalizedBlogCategorySchema.optional(),
  search: z.string().trim().optional(),
  tags: z
    .string()
    .transform((val) => val.split(',').map((tag) => tag.trim()))
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .optional()
    .default(1),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100)) // Increased from 100 to 1000
    .optional()
    .default(10),
});

/**
 * Type inference from schemas
 */
export type CreateDraftBlogInput = z.infer<typeof createDraftBlogSchema>;
export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export type BlogFiltersInput = z.infer<typeof blogFiltersSchema>;


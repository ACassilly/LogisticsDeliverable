import { z } from 'zod';
import { BlogCategory } from '@/server/db/models/blog.model';

export const blogCategorySchema = z.nativeEnum(BlogCategory);
const normalizedBlogCategorySchema = z.string().trim().toLowerCase().pipe(blogCategorySchema);

export const slugSchema = z.string().min(1, 'Slug is required').max(200, 'Slug cannot exceed 200 characters').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only');

export const createDraftBlogSchema = z.object({
  title: z.string().max(200).trim().optional().or(z.literal('')),
  content: z.string().trim().optional().or(z.literal('')),
  excerpt: z.string().max(500).trim().optional().or(z.literal('')),
  category: z.union([normalizedBlogCategorySchema, z.literal(''), z.undefined()]).optional(),
  tags: z.array(z.string().trim().min(1)).max(10).optional().default([]),
  imageUrl: z.string().url().optional().or(z.literal('')),
  published: z.boolean().optional().default(false),
}).refine((data) => (data.title && data.title.trim().length > 0) || (data.content && data.content.trim().length > 0), { message: 'Either title or content must be provided for a draft' });

export const createBlogSchema = z.object({
  title: z.string().min(2).max(200).trim(),
  content: z.string().min(10).trim(),
  excerpt: z.string().max(500).trim().optional(),
  category: normalizedBlogCategorySchema,
  tags: z.array(z.string().trim().min(1)).max(10).optional().default([]),
  imageUrl: z.string().url().optional().or(z.literal('')),
  published: z.boolean().optional().default(false),
});

export const updateBlogSchema = z.object({
  title: z.string().min(2).max(200).trim().optional(),
  content: z.string().min(10).trim().optional(),
  excerpt: z.string().max(500).trim().optional().or(z.literal('')),
  category: normalizedBlogCategorySchema.optional(),
  tags: z.array(z.string().trim().min(1)).max(10).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  published: z.boolean().optional(),
  slug: slugSchema.optional(),
});

export const blogFiltersSchema = z.object({
  published: z.string().transform((val) => val === 'true').optional(),
  category: normalizedBlogCategorySchema.optional(),
  search: z.string().trim().optional(),
  tags: z.string().transform((val) => val.split(',').map((tag) => tag.trim())).optional(),
  page: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()).optional().default(1),
  limit: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive().max(100)).optional().default(10),
});

export type CreateDraftBlogInput = z.infer<typeof createDraftBlogSchema>;
export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export type BlogFiltersInput = z.infer<typeof blogFiltersSchema>;

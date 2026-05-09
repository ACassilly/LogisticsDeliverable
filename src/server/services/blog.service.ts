import connectDB, { Blog, type IBlog, BlogCategory, type BlogFilters } from '@/server/db';
import { NotFoundError } from '@/server/middlewares';
import type { 
  CreateBlogInput as CreateBlogValidationInput, 
  CreateDraftBlogInput,
  UpdateBlogInput 
} from '@/server/validations';

/**
 * Generate URL-safe slug from title
 * 
 * @param title - Blog title
 * @returns URL-safe slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Ensure slug is unique by appending counter if needed
 * 
 * @param baseSlug - Base slug to check
 * @param excludeId - Blog ID to exclude from check (for updates)
 * @returns Unique slug
 */
async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  await connectDB();
  
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const query = excludeId 
      ? { slug, _id: { $ne: excludeId } }
      : { slug };
    
    const existingBlog = await Blog.findOne(query);
    
    if (!existingBlog) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Get all blogs with optional filters
 * 
 * @param filters - Optional filters (published, category, search, pagination)
 * @returns Array of blogs and pagination info
 */
export async function getAllBlogs(filters?: BlogFilters & { page?: number; limit?: number }) {
  await connectDB();
  
  const query: Record<string, unknown> = {};
  
  // Apply filters
  if (filters?.published !== undefined) {
    query.published = filters.published;
  }
  
  if (filters?.category) {
    const normalizedCategory = String(filters.category).toLowerCase();
    query.category = { $regex: `^${normalizedCategory}$`, $options: 'i' };
  }
  
  if (filters?.search) {
    query.$text = { $search: filters.search };
  }
  
  if (filters?.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  
  // Pagination
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;
  
  // Get total count for pagination
  const total = await Blog.countDocuments(query);
  
  // Get blogs with pagination
  const blogs = await Blog.find(query)
    .sort({ createdAt: -1 }) // Newest first
    .skip(skip)
    .limit(limit)
    .lean();
  
  return {
    blogs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get only published blogs (for public view)
 * 
 * @param filters - Optional filters
 * @returns Array of published blogs
 */
export async function getPublishedBlogs(filters?: { 
  category?: BlogCategory; 
  search?: string; 
  tags?: string[];
  page?: number; 
  limit?: number;
}) {
  return getAllBlogs({ ...filters, published: true });
}

/**
 * Get single blog by ID
 * 
 * @param id - Blog ID
 * @returns Blog document
 * @throws NotFoundError if blog not found
 */
export async function getBlogById(id: string): Promise<IBlog> {
  await connectDB();
  
  const blog = await Blog.findById(id).lean();
  
  if (!blog) {
    throw new NotFoundError('Blog not found');
  }
  
  return blog;
}

/**
 * Get single blog by slug
 * 
 * @param slug - Blog slug
 * @param publishedOnly - Only return if published (default: false)
 * @returns Blog document
 * @throws NotFoundError if blog not found
 */
export async function getBlogBySlug(slug: string, publishedOnly = false): Promise<IBlog> {
  await connectDB();
  
  const query: Record<string, unknown> = { slug };
  
  if (publishedOnly) {
    query.published = true;
  }
  
  const blog = await Blog.findOne(query).lean();
  
  if (!blog) {
    throw new NotFoundError('Blog not found');
  }
  
  return blog;
}

/**
 * Create new blog post (draft or published)
 * 
 * @param data - Blog data (can be draft with minimal fields or full published blog)
 * @returns Created blog document
 */
export async function createBlog(data: CreateBlogValidationInput | CreateDraftBlogInput): Promise<IBlog> {
  await connectDB();
  
  // Clean up data: remove empty string fields for drafts
  const cleanedData: Record<string, unknown> = { ...data };
  
  // If category is empty string or undefined, remove it (for drafts)
  if (!cleanedData.category || cleanedData.category === '') {
    delete cleanedData.category;
  } else if (typeof cleanedData.category === 'string') {
    cleanedData.category = cleanedData.category.toLowerCase();
  }
  
  // If title is empty, remove it
  if (!cleanedData.title || cleanedData.title === '') {
    delete cleanedData.title;
  }
  
  // If content is empty, remove it
  if (!cleanedData.content || cleanedData.content === '') {
    delete cleanedData.content;
  }
  
  // If excerpt is empty, remove it
  if (!cleanedData.excerpt || cleanedData.excerpt === '') {
    delete cleanedData.excerpt;
  }
  
  // If imageUrl is empty, remove it
  if (!cleanedData.imageUrl || cleanedData.imageUrl === '') {
    delete cleanedData.imageUrl;
  }
  
  // Generate unique slug from title (use title if available, otherwise generate from content or timestamp)
  const titleForSlugRaw = cleanedData.title && typeof cleanedData.title === 'string' && cleanedData.title.trim().length > 0
                          ? cleanedData.title
                          : (typeof cleanedData.content === 'string' && cleanedData.content.length > 0 
                              ? cleanedData.content.substring(0, 50) 
                              : `draft-${Date.now()}`);
  const baseSlug = generateSlug(titleForSlugRaw);
  const slug = await ensureUniqueSlug(baseSlug);
  
  // Create blog with unique slug
  const blog = await Blog.create({
    ...cleanedData,
    slug,
    publishedAt: cleanedData.published ? new Date() : undefined,
  });
  
  return blog.toObject();
}

/**
 * Update existing blog post
 * 
 * @param id - Blog ID
 * @param data - Updated blog data
 * @returns Updated blog document
 * @throws NotFoundError if blog not found
 */
export async function updateBlog(id: string, data: UpdateBlogInput): Promise<IBlog> {
  await connectDB();

  const normalizedData: UpdateBlogInput = {
    ...data,
    ...(typeof data.category === 'string'
      ? { category: data.category.toLowerCase() as BlogCategory }
      : {}),
  };
  
  // Check if blog exists
  const existingBlog = await Blog.findById(id);
  
  if (!existingBlog) {
    throw new NotFoundError('Blog not found');
  }
  
  // If title is being updated, regenerate slug
  let slug = normalizedData.slug;
  if (normalizedData.title && normalizedData.title !== existingBlog.title) {
    const baseSlug = generateSlug(normalizedData.title);
    slug = await ensureUniqueSlug(baseSlug, id);
  }
  
  // Handle publishedAt timestamp
  let publishedAt = existingBlog.publishedAt;
  if (normalizedData.published !== undefined) {
    if (normalizedData.published && !existingBlog.published) {
      // Being published for the first time
      publishedAt = new Date();
    } else if (!normalizedData.published) {
      // Being unpublished
      publishedAt = undefined;
    }
  }
  
  // Update blog
  const updatedBlog = await Blog.findByIdAndUpdate(
    id,
    {
      ...normalizedData,
      ...(slug && { slug }),
      publishedAt,
    },
    { new: true, runValidators: true }
  ).lean();
  
  if (!updatedBlog) {
    throw new NotFoundError('Blog not found');
  }
  
  return updatedBlog;
}

/**
 * Delete blog post
 * 
 * @param id - Blog ID
 * @returns Deleted blog document
 * @throws NotFoundError if blog not found
 */
export async function deleteBlog(id: string): Promise<IBlog> {
  await connectDB();
  
  const deletedBlog = await Blog.findByIdAndDelete(id).lean();
  
  if (!deletedBlog) {
    throw new NotFoundError('Blog not found');
  }
  
  return deletedBlog;
}

/**
 * Get blog categories with counts
 * 
 * @returns Array of categories with blog counts
 */
export async function getBlogCategories() {
  await connectDB();
  
  const categories = await Blog.aggregate([
    { $match: { published: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  
  return categories.map((cat) => ({
    category: typeof cat._id === 'string' ? cat._id.toLowerCase() : cat._id,
    count: cat.count,
  }));
}

/**
 * Get popular tags
 * 
 * @param limit - Number of tags to return
 * @returns Array of popular tags
 */
export async function getPopularTags(limit = 20) {
  await connectDB();
  
  const tags = await Blog.aggregate([
    { $match: { published: true } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
  
  return tags.map((tag) => ({
    tag: tag._id,
    count: tag.count,
  }));
}


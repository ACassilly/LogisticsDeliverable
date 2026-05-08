import connectDB, { Blog, type IBlog, BlogCategory, type BlogFilters } from '@/server/db';
import { NotFoundError } from '@/server/middlewares';
import type { CreateBlogInput as CreateBlogValidationInput, CreateDraftBlogInput, UpdateBlogInput } from '@/server/validations';

export function generateSlug(title: string): string {
  return title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  await connectDB();
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const query = excludeId ? { slug, _id: { $ne: excludeId } } : { slug };
    const existingBlog = await Blog.findOne(query);
    if (!existingBlog) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function getAllBlogs(filters?: BlogFilters & { page?: number; limit?: number }) {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (filters?.published !== undefined) query.published = filters.published;
  if (filters?.category) query.category = { $regex: `^${String(filters.category).toLowerCase()}$`, $options: 'i' };
  if (filters?.search) query.$text = { $search: filters.search };
  if (filters?.tags && filters.tags.length > 0) query.tags = { $in: filters.tags };
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;
  const total = await Blog.countDocuments(query);
  const blogs = await Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
  return { blogs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function getPublishedBlogs(filters?: { category?: BlogCategory; search?: string; tags?: string[]; page?: number; limit?: number }) {
  return getAllBlogs({ ...filters, published: true });
}

export async function getBlogById(id: string): Promise<IBlog> {
  await connectDB();
  const blog = await Blog.findById(id).lean();
  if (!blog) throw new NotFoundError('Blog not found');
  return blog;
}

export async function getBlogBySlug(slug: string, publishedOnly = false): Promise<IBlog> {
  await connectDB();
  const query: Record<string, unknown> = { slug };
  if (publishedOnly) query.published = true;
  const blog = await Blog.findOne(query).lean();
  if (!blog) throw new NotFoundError('Blog not found');
  return blog;
}

export async function createBlog(data: CreateBlogValidationInput | CreateDraftBlogInput): Promise<IBlog> {
  await connectDB();
  const cleanedData: Record<string, unknown> = { ...data };
  if (!cleanedData.category || cleanedData.category === '') delete cleanedData.category;
  else if (typeof cleanedData.category === 'string') cleanedData.category = cleanedData.category.toLowerCase();
  if (!cleanedData.title || cleanedData.title === '') delete cleanedData.title;
  if (!cleanedData.content || cleanedData.content === '') delete cleanedData.content;
  if (!cleanedData.excerpt || cleanedData.excerpt === '') delete cleanedData.excerpt;
  if (!cleanedData.imageUrl || cleanedData.imageUrl === '') delete cleanedData.imageUrl;
  const titleForSlugRaw = cleanedData.title && typeof cleanedData.title === 'string' && cleanedData.title.trim().length > 0
    ? cleanedData.title
    : (typeof cleanedData.content === 'string' && cleanedData.content.length > 0 ? cleanedData.content.substring(0, 50) : `draft-${Date.now()}`);
  const baseSlug = generateSlug(titleForSlugRaw);
  const slug = await ensureUniqueSlug(baseSlug);
  const blog = await Blog.create({ ...cleanedData, slug, publishedAt: cleanedData.published ? new Date() : undefined });
  return blog.toObject();
}

export async function updateBlog(id: string, data: UpdateBlogInput): Promise<IBlog> {
  await connectDB();
  const normalizedData: UpdateBlogInput = { ...data, ...(typeof data.category === 'string' ? { category: data.category.toLowerCase() as BlogCategory } : {}) };
  const existingBlog = await Blog.findById(id);
  if (!existingBlog) throw new NotFoundError('Blog not found');
  let slug = normalizedData.slug;
  if (normalizedData.title && normalizedData.title !== existingBlog.title) {
    const baseSlug = generateSlug(normalizedData.title);
    slug = await ensureUniqueSlug(baseSlug, id);
  }
  let publishedAt = existingBlog.publishedAt;
  if (normalizedData.published !== undefined) {
    if (normalizedData.published && !existingBlog.published) publishedAt = new Date();
    else if (!normalizedData.published) publishedAt = undefined;
  }
  const updatedBlog = await Blog.findByIdAndUpdate(id, { ...normalizedData, ...(slug && { slug }), publishedAt }, { new: true, runValidators: true }).lean();
  if (!updatedBlog) throw new NotFoundError('Blog not found');
  return updatedBlog;
}

export async function deleteBlog(id: string): Promise<IBlog> {
  await connectDB();
  const deletedBlog = await Blog.findByIdAndDelete(id).lean();
  if (!deletedBlog) throw new NotFoundError('Blog not found');
  return deletedBlog;
}

export async function getBlogCategories() {
  await connectDB();
  const categories = await Blog.aggregate([{ $match: { published: true } }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
  return categories.map((cat) => ({ category: typeof cat._id === 'string' ? cat._id.toLowerCase() : cat._id, count: cat.count }));
}

export async function getPopularTags(limit = 20) {
  await connectDB();
  const tags = await Blog.aggregate([{ $match: { published: true } }, { $unwind: '$tags' }, { $group: { _id: '$tags', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: limit }]);
  return tags.map((tag) => ({ tag: tag._id, count: tag.count }));
}

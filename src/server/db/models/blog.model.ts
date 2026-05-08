import mongoose, { Document, Model, Schema } from 'mongoose';

export enum BlogCategory { LTL = 'ltl', FTL = 'ftl', INTERMODAL = 'intermodal', DRAYAGE = 'drayage' }

export interface IBlog extends Document {
  title: string; slug: string; content: string; excerpt?: string
  category: BlogCategory; tags: string[]; imageUrl?: string
  published: boolean; publishedAt?: Date; createdAt: Date; updatedAt: Date
  readingTime: number
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: false, trim: true, minlength: [2, 'Title min 2 chars'], maxlength: [200, 'Title max 200 chars'] },
    slug: { type: String, required: [true, 'Slug is required'], unique: true, trim: true, lowercase: true, index: true },
    content: { type: String, required: false },
    excerpt: { type: String, trim: true, maxlength: [500, 'Excerpt max 500 chars'] },
    category: {
      type: String,
      set: (v: string) => (typeof v === 'string' ? v.toLowerCase() : v),
      enum: { values: Object.values(BlogCategory), message: '{VALUE} is not a valid category' },
      required: false, index: true,
    },
    tags: { type: [String], default: [], validate: { validator: (t: string[]) => t.length <= 10, message: 'Max 10 tags' } },
    imageUrl: { type: String, trim: true },
    published: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

BlogSchema.virtual('readingTime').get(function (this: IBlog) {
  if (!this.content) return 0;
  const text = this.content.replace(/<[^>]*>/g, '');
  return Math.ceil(text.split(/\s+/).filter(w => w.length > 0).length / 200);
});

BlogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
BlogSchema.index({ published: 1, category: 1, createdAt: -1 });

BlogSchema.pre('save', function (this: IBlog) {
  if (this.published && !this.publishedAt) this.publishedAt = new Date();
  else if (!this.published && this.publishedAt) this.publishedAt = undefined;
  const errors: string[] = [];
  if (!this.title || this.title.trim().length < 2) errors.push('Title is required (min 2 chars)');
  if (!this.category) errors.push('Category is required');
  if (this.published && (!this.content || this.content.trim().length < 50)) errors.push('Content required for published blogs (min 50 chars)');
  if (errors.length > 0) throw new Error(errors.join('; '));
});

if (process.env.NODE_ENV !== 'production' && mongoose.models.Blog) delete mongoose.models.Blog;

const Blog: Model<IBlog> = (mongoose.models.Blog as Model<IBlog>) || mongoose.model<IBlog>('Blog', BlogSchema);
export default Blog;

export type CreateBlogInput = { title: string; slug: string; content: string; excerpt?: string; category: BlogCategory; tags?: string[]; imageUrl?: string; published?: boolean };
export type UpdateBlogInput = Partial<CreateBlogInput>;
export type BlogFilters = { published?: boolean; category?: BlogCategory; search?: string; tags?: string[] };

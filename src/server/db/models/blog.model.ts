import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Blog category enum
 */
export enum BlogCategory {
  LTL = 'ltl',
  FTL = 'ftl',
  INTERMODAL = 'intermodal',
  DRAYAGE = 'drayage',
}

/**
 * Blog document interface
 */
export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category: BlogCategory;
  tags: string[];
  imageUrl?: string;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  readingTime: number; // Virtual field
}

/**
 * Blog schema definition
 */
const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: false, // Not strictly required - handled by validation
      trim: true,
      minlength: [2, 'Title must be at least 2 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    content: {
      type: String,
      required: false, // Not strictly required - handled by validation
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    category: {
      type: String,
      set: (value: string) => (typeof value === 'string' ? value.toLowerCase() : value),
      enum: {
        values: Object.values(BlogCategory),
        message: '{VALUE} is not a valid category',
      },
      required: false, // Not strictly required - handled by validation
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length <= 10,
        message: 'Cannot have more than 10 tags',
      },
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Virtual field: Calculate reading time based on content length
 * Assumes average reading speed of 200 words per minute
 */
BlogSchema.virtual('readingTime').get(function (this: IBlog) {
  if (!this.content) return 0;
  
  // Strip HTML tags and count words
  const text = this.content.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length;
  const minutes = Math.ceil(wordCount / 200);
  
  return minutes;
});

/**
 * Index for text search on title and content
 */
BlogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

/**
 * Compound index for published blogs by category
 */
BlogSchema.index({ published: 1, category: 1, createdAt: -1 });

/**
 * Pre-save middleware to automatically set publishedAt and validate
 */
BlogSchema.pre('save', function (this: IBlog) {
  // If blog is being published for the first time
  if (this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  // If blog is being unpublished
  else if (!this.published && this.publishedAt) {
    this.publishedAt = undefined;
  }
  
  // Custom validation for published blogs
  if (this.published) {
    const errors: string[] = [];
    
    if (!this.title || this.title.trim().length < 2) {
      errors.push('Title is required and must be at least 2 characters for published blogs');
    }
    if (!this.content || this.content.trim().length < 50) {
      errors.push('Content is required and must be at least 50 characters for published blogs');
    }
    if (!this.category) {
      errors.push('Category is required for published blogs');
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }
  }
  
  // For drafts, ensure title AND category exist (content is optional)
  if (!this.published) {
    const errors: string[] = [];
    
    if (!this.title || this.title.trim().length < 2) {
      errors.push('Title is required (minimum 2 characters) for drafts');
    }
    if (!this.category) {
      errors.push('Category is required for drafts');
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }
  }
});

/**
 * Export Blog model
 * In development, clear the cached model so schema changes (like enum updates)
 * are reflected during hot reload.
 */
if (process.env.NODE_ENV !== 'production' && mongoose.models.Blog) {
  delete mongoose.models.Blog;
}

const Blog: Model<IBlog> =
  (mongoose.models.Blog as Model<IBlog>) || mongoose.model<IBlog>('Blog', BlogSchema);

export default Blog;

/**
 * Type for creating a new blog (without auto-generated fields)
 */
export type CreateBlogInput = {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category: BlogCategory;
  tags?: string[];
  imageUrl?: string;
  published?: boolean;
};

/**
 * Type for updating a blog (all fields optional)
 */
export type UpdateBlogInput = Partial<CreateBlogInput>;

/**
 * Type for blog filters
 */
export type BlogFilters = {
  published?: boolean;
  category?: BlogCategory;
  search?: string;
  tags?: string[];
};


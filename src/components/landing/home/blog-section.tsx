"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedBlogs } from "@/services/blog.service";
import { BLOG_CATEGORIES } from "@/constants";
import { BlogCard } from "@/components/landing/blog/BlogCard";
import { resolveBlogImageSrc } from "@/components/landing/blog/blog-image";

/**
 * Format date to match the original format (e.g., "Feb 2, 2026")
 */
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Get category display name from enum
 */
function getCategoryName(category: string): string {
  const normalized = category.toLowerCase() as keyof typeof BLOG_CATEGORIES;
  return BLOG_CATEGORIES[normalized] || category;
}

/**
 * Fallback data - matches original design exactly
 */
const FALLBACK_BLOGS = [
  {
    id: 1,
    title: "How Real-Time Visibility Improves Supply Chain Efficiency",
    excerpt: "Learn how better tracking and communication reduce delays and improve planning.",
    image: "/images/blog/post-1.jpg",
    category: "Industry Insights",
    date: "Feb 2, 2026"
  },
  {
    id: 2,
    title: "5 Ways to Reduce Freight Costs Without Sacrificing Service",
    excerpt: "Practical strategies to optimize your logistics budget while maintaining quality.",
    image: "/images/blog/post-2.jpg",
    category: "Cost Optimization",
    date: "Jan 28, 2026"
  },
  {
    id: 3,
    title: "The Future of LTL Shipping: Trends to Watch in 2026",
    excerpt: "Emerging technologies and market shifts shaping the less-than-truckload industry.",
    image: "/images/blog/post-3.jpg",
    category: "Market Trends",
    date: "Jan 25, 2026"
  },
  {
    id: 4,
    title: "How Real-Time Visibility Improves Supply Chain Efficiency",
    excerpt: "Learn how better tracking and communication reduce delays and improve planning.",
    image: "/images/blog/post-4.jpg",
    category: "Industry Insights",
    date: "Feb 2, 2026"
  },
  {
    id: 5,
    title: "5 Ways to Reduce Freight Costs Without Sacrificing Service",
    excerpt: "Practical strategies to optimize your logistics budget while maintaining quality.",
    image: "/images/blog/post-1.jpg",
    category: "Cost Optimization",
    date: "Jan 28, 2026"
  },
  {
    id: 6,
    title: "The Future of LTL Shipping: Trends to Watch in 2026",
    excerpt: "Emerging technologies and market shifts shaping the less-than-truckload industry.",
    image: "/images/blog/post-2.jpg",
    category: "Market Trends",
    date: "Jan 25, 2026"
  }
];

export function BlogSection() {
  const [api, setApi] = useState<CarouselApi>();
  
  // Fetch blogs from backend API
  const { data: blogs } = useQuery({
    queryKey: ['featured-blogs'],
    queryFn: getFeaturedBlogs,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Transform API data to match BlogCard props format, or use fallback
  const blogPosts = blogs && blogs.length > 0 
    ? blogs.map((blog, index) => ({
        id: blog.slug || blog._id,
        title: blog.title,
        description: blog.excerpt || "Read this insightful article.",
        image: resolveBlogImageSrc(blog.imageUrl, index),
        category: getCategoryName(blog.category),
        date: formatDate(blog.publishedAt || blog.createdAt)
      }))
    : FALLBACK_BLOGS.map((blog) => ({
        ...blog,
        description: blog.excerpt,
        id: blog.id.toString()
      }));

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-gray-50">
      <div className="max-w-[1500px] mx-auto">
        {/* Section Header with Navigation Buttons */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--text-primary)] mb-4 sm:mb-6">
              Insights, Updates and Industry Perspectives
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Stay informed with expert insights, logistics trends, and company updates designed to help you make smarter shipping decisions.
            </p>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-center md:justify-end gap-2 px-4 sm:px-8 md:px-12">
            <button
              onClick={() => api?.scrollPrev()}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
              aria-label="Previous blogs"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={() => api?.scrollNext()}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
              aria-label="Next blogs"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Blog Carousel */}
        <div className="mb-8 sm:mb-10 md:mb-12 px-4 sm:px-8 md:px-12">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {blogPosts.map((post) => (
                <CarouselItem key={post.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <BlogCard post={post} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* View All CTA */}
        <div className="text-center">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center w-full sm:w-[280px] h-[50px] sm:h-[57px] gap-2 px-6 sm:px-8 py-3 text-white font-medium hover:opacity-90 transition-all btn-gradient-dark"
          >
            View Blogs
          </Link>
        </div>
      </div>
    </section>
  );
}

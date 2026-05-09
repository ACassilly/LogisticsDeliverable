/**
 * Blog Loading Skeleton Components
 * Reusable loading states for blog pages using Shadcn UI
 */

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton for individual blog card
 */
export function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden h-full flex flex-col">
      {/* Image Skeleton */}
      <Skeleton className="h-64 w-full rounded-none" />
      
      {/* Content Skeleton */}
      <div className="p-8 flex-1 flex flex-col space-y-4">
        {/* Date */}
        <div className="pt-4 border-t border-gray-50">
          <Skeleton className="h-3 w-24" />
        </div>
        
        {/* Title */}
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        
        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-50">
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for blog grid (9 cards)
 */
export function BlogGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for blog post page
 */
export function BlogPostSkeleton() {
  return (
    <article className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header Skeleton */}
      <header className="pt-12 pb-5 container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
        
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-3/4 mb-8" />
        
        <div className="flex items-center gap-6 border-b border-gray-100 pb-8">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
        </div>
      </header>
      
      {/* Content Skeleton */}
      <div className="container mx-auto px-4 max-w-6xl mt-8">
        <div className="space-y-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </article>
  );
}

/**
 * Skeleton for hero search section
 */
export function BlogHeroSkeleton() {
  return (
    <section className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
        <Skeleton className="h-6 w-2/3 mx-auto mb-12" />
        
        {/* Search Bar Skeleton */}
        <Skeleton className="h-14 w-full max-w-2xl mx-auto mb-10 rounded-2xl" />
        
        {/* Categories Skeleton */}
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
      </div>
    </section>
  );
}


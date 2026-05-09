'use client';

import { Search } from "lucide-react"
import { BarChart, StickyNote } from "lucide-react"
import { useBlogFilterStore, type BlogCategoryFilter } from '@/store';
import { useState, useEffect } from 'react';

// Map display names to category keys
const CATEGORY_MAP: Record<string, BlogCategoryFilter> = {
  "All Posts": "all",
  "LTL": "ltl",
  "FTL": "ftl",
  "Intermodal": "intermodal",
  "Drayage": "drayage",
};

const categories = [
  "All Posts",
  "LTL",
  "FTL",
  "Intermodal",
  "Drayage",
];

export function BlogHeroSection() {
  const { searchQuery, selectedCategory, setSearchQuery, setSelectedCategory } = useBlogFilterStore();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounced search - update store after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  const handleCategoryClick = (categoryName: string) => {
    const categoryKey = CATEGORY_MAP[categoryName];
    setSelectedCategory(categoryKey);
  };

  return (
    <section className="pt-24 pb-16 px-4">
      <div className="hidden lg:block absolute left-30 top-1/2 -translate-y-1/2">
        <div className="relative w-36 h-36 bg-[#E8F5ED] rounded-2xl rotate-[-12deg] shadow-xl flex items-center justify-center border border-[#3BAB6B]/20">
          <StickyNote className="text-[#3BAB6B] w-14 h-14" strokeWidth={1.5} />
          <div className="absolute top-2 right-4 w-6 h-6 bg-[#3BAB6B]/10 rounded-full" />
          <div className="absolute bottom-4 -left-2 w-10 h-10 bg-[#3BAB6B]/5 rounded-full" />
        </div>
      </div>

      {/* Right Graphic: Data Insight */}
      <div className="hidden lg:block absolute right-30 top-1/2 -translate-y-1/2">
        <div className="relative w-36 h-36 bg-[#E8F5ED] rounded-3xl rotate-[12deg] shadow-2xl flex items-center justify-center border border-[#3BAB6B]/20">
          <BarChart className="text-[#3BAB6B] w-14 h-14" strokeWidth={1.5} />
          {/* Decorative floating dots around the graphic */}
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#3BAB6B]/10 rounded-full" />
          <div className="absolute -bottom-4 right-4 w-10 h-10 bg-[#3BAB6B]/5 rounded-full" />
        </div>
      </div>

      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
          Insights, Updates <br /> and Industry <span className="text-[#3BAB6B]">Perspectives</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-12">
          Stay informed with recent insights, logistics trends, and company updates designed to help you make smarter shipping decisions.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-10">
          <input
            type="text"
            placeholder="Search articles..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full h-14 pl-14 pr-6 rounded-2xl border border-[#256c43] bg-white shadow-xl shadow-[#3BAB6B]/5 focus:ring-2 focus:ring-[#3BAB6B] transition-all outline-none"
            aria-label="Search blog articles"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => {
            const categoryKey = CATEGORY_MAP[cat];
            const isActive = categoryKey === selectedCategory;
            
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? "btn-gradient-green text-white shadow-lg shadow-[#3BAB6B]/30"
                    : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
                }`}
                aria-label={`Filter by ${cat}`}
                aria-pressed={isActive}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

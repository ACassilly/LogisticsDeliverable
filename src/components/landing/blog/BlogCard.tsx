// components/BlogCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface BlogCardProps {
  post: {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    date: string;
  };
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.id}`} className="group block">
      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute top-4 left-4">
            <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-[#3BAB6B] border border-gray-100">
              {post.category}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 flex-1 flex flex-col">
          <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-[11px] font-bold text-gray-400 uppercase tracking-tight">
            <span>{post.date}</span>
          </div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#3BAB6B] transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h3>
            <div className="bg-gray-50 p-2 rounded-full group-hover:bg-[#3BAB6B] group-hover:text-white transition-all">
              <ArrowUpRight size={18} />
            </div>
          </div>
          
          <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
            {post.description}
          </p>

          <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-[11px] font-bold text-gray-400 uppercase tracking-tight">
            <span className="text-[#3BAB6B]">Read Article</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
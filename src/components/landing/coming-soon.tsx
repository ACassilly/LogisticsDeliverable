'use client';

import Link from "next/link";

interface ComingSoonProps {
  title?: string;
  description?: string;
  showContactButton?: boolean;
}

export function ComingSoon({ 
  title = "Coming Soon",
  description = "We&apos;re working hard to bring you something amazing. Stay tuned for updates!",
  showContactButton = true 
}: ComingSoonProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--primary-darker)] via-[var(--primary)] to-[var(--primary-light)] py-20 sm:py-32 lg:py-40">
        <div className="absolute inset-0 bg-[url('/images/hero/pattern.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center">
                <svg 
                  className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--primary)]" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Title */}
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            {title}
          </h1>
          
          {/* Description */}
          <p 
            className="text-lg sm:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            {description}
          </p>
          
          {/* Decorative Line */}
          <div className="flex justify-center items-center gap-4 mb-12 animate-in fade-in duration-700 delay-500">
            <div className="h-[2px] w-16 bg-white/40"></div>
            <div className="h-2 w-2 rounded-full bg-white/60"></div>
            <div className="h-[2px] w-16 bg-white/40"></div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Feature 1 */}
          <div className="text-center p-8 rounded-2xl bg-[var(--accent-green-light)] border border-[var(--accent-green-border)] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white flex items-center justify-center shadow-md">
              <svg 
                className="w-8 h-8 text-[var(--primary)]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <h3 
              className="text-xl font-semibold text-[var(--text-primary)] mb-3"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Quality Service
            </h3>
            <p 
              className="text-[var(--text-muted)] text-sm leading-relaxed"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              We&apos;re committed to delivering exceptional service and solutions tailored to your needs.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center p-8 rounded-2xl bg-[var(--accent-green-light)] border border-[var(--accent-green-border)] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white flex items-center justify-center shadow-md">
              <svg 
                className="w-8 h-8 text-[var(--primary)]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" 
                />
              </svg>
            </div>
            <h3 
              className="text-xl font-semibold text-[var(--text-primary)] mb-3"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Fast & Reliable
            </h3>
            <p 
              className="text-[var(--text-muted)] text-sm leading-relaxed"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Our team is working around the clock to bring you the best experience possible.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center p-8 rounded-2xl bg-[var(--accent-green-light)] border border-[var(--accent-green-border)] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white flex items-center justify-center shadow-md">
              <svg 
                className="w-8 h-8 text-[var(--primary)]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                />
              </svg>
            </div>
            <h3 
              className="text-xl font-semibold text-[var(--text-primary)] mb-3"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Expert Team
            </h3>
            <p 
              className="text-[var(--text-muted)] text-sm leading-relaxed"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Backed by industry experts dedicated to providing innovative logistics solutions.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        {showContactButton && (
          <div className="text-center p-12 rounded-2xl bg-gradient-to-br from-[var(--bg-light-gray)] to-white border border-[var(--border-gray)]">
            <h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Need Logistics Solutions Now?
            </h2>
            <p 
              className="text-base sm:text-lg text-[var(--text-muted)] mb-8 max-w-2xl mx-auto"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              While we prepare this exciting new section, our team is ready to assist you with all your shipping needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/contact"
                className="px-8 py-4 rounded-full text-white text-base font-semibold transition-all duration-300 hover:shadow-xl transform hover:-translate-y-0.5 btn-gradient-green"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                Contact Us Today
              </Link>
              <Link 
                href="/quote"
                className="px-8 py-4 rounded-full border-2 border-[var(--primary)] text-[var(--primary)] text-base font-semibold transition-all duration-300 hover:bg-[var(--accent-green-light)] hover:shadow-lg transform hover:-translate-y-0.5"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                Get a Quote
              </Link>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-16 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors text-base font-medium"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

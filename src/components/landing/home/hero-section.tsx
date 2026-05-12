import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative h-[500px] sm:h-[600px] md:h-[700px] lg:h-[743px]  overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1920&h=1080&fit=crop"
          alt="Freight transportation"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Dark Gradient Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(130deg, rgb(0, 0, 0) 18.1%, rgba(0, 0, 0, 0) 101.2%)'
        }}
      />

      {/* Green Bottom Gradient */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[200px] sm:h-[280px] md:h-[369px]"
        style={{
          background: 'linear-gradient(to bottom, rgba(59, 171, 107, 0) 0%, rgba(59, 171, 107, 0.28) 100%)'
        }}
      />

      {/* Content */}
      <div className="relative h-full flex items-center px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[103px]">
        <div className="max-w-[1500px] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[751px] space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-7">
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            Ship Smarter. Not Harder.
          </h1>

          <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-7">
            <p 
              className="text-sm sm:text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-full sm:max-w-[450px] md:max-w-[517px]"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Get instant quotes, real-time tracking, and dedicated support that keeps your supply chain efficient. 
              <br className="hidden sm:inline" />
              <span className="inline sm:hidden"> </span>
              Without hidden costs or surprises.
            </p>

            <div className="flex flex-row sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2.5">
              <Link
                href="/quote"
                className="px-8 sm:px-10 md:px-12 py-3 sm:py-3.5 md:py-4 bg-white text-[rgba(0,0,0,0.8)] rounded-full font-medium hover:bg-white/90 transition-all text-center text-sm sm:text-base"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                Get a Quote
              </Link>
              <Link
                href="/contact"
                className="px-8 sm:px-10 md:px-12 py-3 sm:py-3.5 md:py-4 bg-white/23 backdrop-blur-sm border border-white/17 text-white rounded-full font-medium hover:bg-white/30 transition-all shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-center text-sm sm:text-base"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                Let&apos;s Connect
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

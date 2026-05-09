import Image from "next/image";

export function StayUpdatedSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-[1500px] mx-auto ">
        <div className="relative rounded-2xl sm:rounded-[20px] overflow-hidden min-h-[450px]  sm:min-h-[550px] md:min-h-[670px]">
          {/* Image Layer (behind text) - Mobile */}
          <div className="absolute inset-0 z-0 sm:hidden">
            <Image
              src="/images/stay-updated-mobile.png"
              alt="Stay Updated Background"
              width={400}
              height={450}
              className="w-full h-full object-cover rounded-2xl"
              priority
            />
            {/* Gradient Overlay for better text readability */}
            <div 
              className="absolute inset-0 rounded-2xl"
              style={{ background: "linear-gradient(180deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.00) 100%)" }}
            />
          </div>

          {/* Image Layer (behind text) - Tablet & Desktop */}
          <div className="absolute inset-0 z-0 hidden sm:block">
            <Image
              src="/images/stay-updated.png"
              alt="Stay Updated Background"
              width={1056}
              height={620}
              className="w-full h-full object-cover rounded-[20px]"
              priority
            />
            {/* Gradient Overlay for better text readability */}
            <div 
              className="absolute inset-0 rounded-[20px]"
              style={{ background: "linear-gradient(180deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.00) 100%)" }}
            />
          </div>

          {/* Content Layer (on top of image) */}
          <div className="relative z-10 h-full flex flex-col justify-start items-center px-4 sm:px-6 md:px-8 lg:px-12 pt-12 sm:pt-14 md:pt-16 lg:pt-20 pb-8 sm:pb-10 md:pb-12 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-2 sm:mb-3 md:mb-4 px-4" style={{ fontFamily: 'var(--font-poppins)' }}>
              Stay Updated
            </h2>
            <p className="text-white/90 text-xs sm:text-sm md:text-base mb-6 sm:mb-8 max-w-md mx-auto px-4" style={{ fontFamily: 'var(--font-inter)' }}>
              Subscribe to our newsletter for industry insights and updates.
            </p>
            <form className="w-full max-w-md mx-auto px-4">
              {/* Mobile: Inline Layout with button inside */}
              <div className="sm:hidden w-full max-w-[340px] mx-auto">
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-1 hover:bg-white/15 transition-all">
                  <input
                    type="email"
                    placeholder="Enter you email"
                    className="flex-1 min-w-0 px-3 py-2 bg-transparent text-white placeholder:text-white/60 focus:outline-none text-sm"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white text-[var(--dark-gray)] font-medium rounded-full hover:bg-white/95 hover:shadow-md transition-all whitespace-nowrap text-xs flex-shrink-0"
                    style={{ fontFamily: 'var(--font-poppins)' }}
                  >
                    Subscribe
                  </button>
                </div>
              </div>

              {/* Tablet & Desktop: Inline Layout */}
              <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-1.5 hover:bg-white/15 transition-all">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2.5 bg-transparent text-white placeholder:text-white/60 focus:outline-none text-sm md:text-base"
                  style={{ fontFamily: 'var(--font-inter)' }}
                />
                <button
                  type="submit"
                  className="px-6 md:px-8 py-2.5 bg-white text-[var(--dark-gray)] font-medium rounded-full hover:bg-white/95 hover:shadow-md transition-all whitespace-nowrap text-sm md:text-base"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

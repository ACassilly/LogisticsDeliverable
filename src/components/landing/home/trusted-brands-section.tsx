"use client";
export function TrustedBrandsSection() {
  const brands = [
    "Tesla Energy",
    "SunPower",
    "Schneider Electric",
    "Carrier HVAC",
    "Caterpillar",
    "John Deere",
    "Ferguson",
    "HD Supply",
    "Graybar",
    "WESCO",
    "Rexel",
    "Border States"
  ];

  return (
    <section className="w-full py-12 sm:py-16 md:py-20 bg-[#f9f9f9] overflow-hidden">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-sm sm:text-base md:text-lg text-gray-600 mb-8 sm:mb-10 md:mb-12 font-semibold">
          Trusted by Brand Leaders
        </h2>
        
        {/* Infinite Scrolling Marquee */}
        <div className="relative w-full">
          {/* Gradient Overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 bg-gradient-to-r from-[#f9f9f9] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 bg-gradient-to-l from-[#f9f9f9] to-transparent z-10" />
          
          <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
            {/* First set of brand names */}
            <div className="flex items-center shrink-0 animate-scroll gap-8 sm:gap-12 md:gap-16 lg:gap-20 pr-8 sm:pr-12 md:pr-16 lg:pr-20">
              {brands.map((brand, idx) => (
                <span
                  key={`first-${idx}`}
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-800 font-semibold opacity-60 hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
                >
                  {brand}
                </span>
              ))}
            </div>
            
            {/* Second set of brand names for seamless loop */}
            <div className="flex items-center shrink-0 animate-scroll gap-8 sm:gap-12 md:gap-16 lg:gap-20 pr-8 sm:pr-12 md:pr-16 lg:pr-20">
              {brands.map((brand, idx) => (
                <span
                  key={`second-${idx}`}
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-800 font-semibold opacity-60 hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

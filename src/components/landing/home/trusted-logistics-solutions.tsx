import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function TrustedLogisticsSolutions() {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-white">
      <div className="max-w-[1500px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Green Card with Content */}
          <div 
            className="rounded-[16px] sm:rounded-[20px] px-6 sm:px-8 md:px-12 lg:px-[73px] py-8 sm:py-12 lg:py-0 flex items-center relative overflow-hidden z-0 lg:mr-[-50px] min-h-[400px] sm:min-h-[450px] lg:h-[498px]"
            style={{
              background: 'radial-gradient(100.07% 68.48% at 17.14% 81.27%, #30AC68 0%, #246B43 100%)',
              gap: '54px'
            }}
          >
            {/* Top-left diagonal stripes */}
            <div 
              className="absolute top-0 left-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32"
              style={{
                background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 16px)',
                opacity: 0.5
              }}
            />
            
            {/* Bottom-right diagonal stripes */}
            <div 
              className="absolute bottom-0 right-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32"
              style={{
                background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 16px)',
                opacity: 0.5
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col w-full">
              <h2 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                Trusted Logistics Solutions for Every Shipment
              </h2>
              <p 
                className="text-white/90 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 max-w-xl"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                Every shipment you entrust to us deserves precision, transparency, and care. That&apos;s why we combine technology, a nationwide carrier network, and dedicated support to ensure your freight moves efficiently and reliably.
              </p>
              <div>
                <Button 
                  asChild
                  className="bg-white text-[var(--primary-dark)] hover:bg-white/95 rounded-full px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-medium h-auto shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  <Link href="/contact" className="flex items-center justify-center gap-2">
                    CONTACT US
                    
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side - Image Grid - Hidden on mobile, visible on lg screens */}
          <div className="hidden lg:grid grid-cols-2 gap-4 h-full relative z-10">
            {/* Top Left - Large Image */}
            <div className="col-span-1 row-span-2 relative rounded-[20px] overflow-hidden h-full min-h-[400px] lg:min-h-[500px] z-20">
              <Image
                src="/images/services/ltl-hero.png"
                alt="Logistics Truck on Highway"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>

            {/* Top Right - Container Image */}
            <div className="col-span-1 relative rounded-4xl overflow-hidden h-69.5 lg:h-69.5">
              <Image
                src="/images/services/ltl-hero.png"
                alt="Shipping Containers"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>

            {/* Bottom Right - Technology Image */}
            <div className="col-span-1 relative rounded-4xl overflow-hidden h-69.5 lg:h-69.5">
              <Image
                src="/images/trust-section/trust-sec-image3.jpg"
                alt="Logistics Technology"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

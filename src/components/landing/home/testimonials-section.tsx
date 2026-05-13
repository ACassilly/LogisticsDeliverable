'use client';

import { useState } from "react";
import Image from "next/image";
import { MoveRight, MoveLeft } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const testimonials = [
  {
    id: 1,
    quote: "We switched from our previous broker after they couldn't handle our JIT requirements. Portlandia's 2-hour response time and 99% fill rate means our production line never stops. Game changer.",
    author: "Sarah Chen",
    position: "VP of Operations, Acme Manufacturing",
    avatar: "/images/services/customer-support.jpg"
  },
  {
    id: 2,
    quote: "The transparency is refreshing. No hidden fees, real-time tracking, and they actually answer the phone. We've reduced our logistics costs by 18% while improving our delivery times.",
    author: "Marcus Johnson",
    position: "Supply Chain Director, TechCore Industries",
    avatar: "/images/services/customer-support.jpg"
  },
  {
    id: 3,
    quote: "During the peak season chaos, Portlandia secured capacity when others couldn't. Their carrier network and relationships saved our Q4. We're never going back to our old broker.",
    author: "Jennifer Martinez",
    position: "Logistics Manager, RetailPro",
    avatar: "/images/services/customer-support.jpg"
  },
  {
    id: 4,
    quote: "Best decision we made was partnering with Portlandia. Their specialized equipment expertise helped us transport oversized machinery without a hitch. Professional team from start to finish.",
    author: "David Thompson",
    position: "Operations Lead, BuildRight Construction",
    avatar: "/images/services/customer-support.jpg"
  },
  {
    id: 5,
    quote: "Best decision we made was partnering with Portlandia. Their specialized equipment expertise helped us transport oversized machinery without a hitch. Professional team from start to finish.",
    author: "David Thompson",
    position: "Operations Lead, BuildRight Construction",
    avatar: "/images/services/customer-support.jpg"
  },
  {
    id: 6,
    quote: "Best decision we made was partnering with Portlandia. Their specialized equipment expertise helped us transport oversized machinery without a hitch. Professional team from start to finish.",
    author: "David Thompson",
    position: "Operations Lead, BuildRight Construction",
    avatar: "/images/services/customer-support.jpg"
  }
];

export function TestimonialsSection() {
  const [api, setApi] = useState<CarouselApi>();

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-[#F8F8F8]">
      <div className="max-w-[1500px] mx-auto">
        {/* Section Header with Navigation */}
        <div className="flex flex-col md:flex-row items-start justify-between mb-8 sm:mb-10 md:mb-12 lg:mb-16 gap-6">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--text-primary)] mb-3 sm:mb-4">
              <span className="text-[var(--primary)]">Trusted by</span> Shippers Who<br />
              Rely on Consistency
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-xl">
              See how businesses use our freight solutions to ship with confidence, clarity, and control.
            </p>
          </div>
          
          {/* Navigation Arrows - Desktop */}
          <div className="hidden md:flex items-center self-end gap-2 sm:gap-3">
            <button
              onClick={() => api?.scrollPrev()}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F0F0F0] border border-gray-300 flex items-center justify-center hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all"
              aria-label="Previous testimonials"
            >
              <MoveLeft className="w-4 h-4 sm:w-[17px] sm:h-[13px]"/>
            </button>
            <button
              onClick={() => api?.scrollNext()}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#F0F0F0] border border-gray-300 flex items-center justify-center hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all"
              aria-label="Next testimonials"
            >
              <MoveRight className="w-4 h-4 sm:w-[17px] sm:h-[13px]"/>
            </button>
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className="overflow-hidden">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="bg-white flex flex-col gap-4 sm:gap-10 md:gap-[50px] px-5 sm:px-6 md:px-[23px] py-6 sm:py-8 md:py-[30px] rounded-2xl shadow-sm hover:shadow-md transition-shadow h-full">
                    {/* Avatar */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-[100px] md:h-[100px] rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Quote */}
                    <p className="text-[var(--text-primary)] leading-relaxed text-sm sm:text-base flex-grow text-justify">
                      &quot;{testimonial.quote}&quot;
                    </p>

                    {/* Author Info */}
                    <div>
                      <h4 className="font-semibold text-[var(--text-primary)] mb-1 text-sm sm:text-base">
                        {testimonial.author}
                      </h4>
                      <p className="text-xs sm:text-sm text-[var(--primary)]">
                        {testimonial.position}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
          <button
            onClick={() => api?.scrollPrev()}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all"
            aria-label="Previous testimonials"
          >
            <MoveLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => api?.scrollNext()}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all"
            aria-label="Next testimonials"
          >
            <MoveRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

'use client';

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
  type CarouselApi 
} from "@/components/ui/carousel"
import { useState, useEffect } from "react"

export function Team() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  const teams = [
    {
      title: "Operations Team",
      description: "15+ years combined experience in freight brokerage, carrier relations, and logistics operations.",
      image: "/images/services/customer-support.jpg",
    },
    {
      title: "Customer Success",
      description: "Dedicated account managers ensuring on-time delivery and proactive communication with clients.",
      image: "/images/services/built-for-ltl.png",
    },
    {
      title: "Technology",
      description: "Building modern technology for real-time tracking, instant quotes, and seamless operations.",
      image: "/images/services/specialized.jpg",
    },
  ]

  useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <section className="w-full bg-gray-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-bold text-[var(--brand-black)] md:text-4xl">
            Our <span className="bg-[linear-gradient(90deg,var(--brand-dark)_0%,var(--brand-primary)_100%)] bg-clip-text text-transparent">
  Team
</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-pretty text-base leading-relaxed text-gray-600 md:text-lg">
            Experienced logistics professionals dedicated to your success
          </p>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden mt-12">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent>
              {teams.map((team, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden border-none pt-0 mx-4">
                    <div className="relative h-[250px] w-full">
                      <Image
                        src={team.image || "/placeholder.svg"}
                        alt={team.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-[var(--brand-black)]">{team.title}</h3>
                      <p className="mt-3 text-pretty leading-relaxed text-gray-700">{team.description}</p>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {teams.map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all ${
                    current === index 
                      ? 'w-8 bg-[var(--brand-primary)]' 
                      : 'w-2 bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </Carousel>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid mt-12 gap-8 md:mt-16 md:grid-cols-3">
          {teams.map((team, index) => (
            <Card key={index} className="overflow-hidden border-none pt-0">
              <div className="relative h-[250px] w-full">
                <Image
                  src={team.image || "/placeholder.svg"}
                  alt={team.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[var(--brand-black)]">{team.title}</h3>
                <p className="mt-3 text-pretty leading-relaxed text-gray-700">{team.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

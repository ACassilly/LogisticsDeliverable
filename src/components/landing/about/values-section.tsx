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

export function Values() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  const values = [
    {
      title: "Execution First",
      description: "We don't just talk logistics  we execute it. Our track record proves our ability to turn strategy to track delivery.",
      image: "/images/about/value1.png",
    },
    {
      title: "Partnership",
      description: "We work hand-in-hand with clients, carriers, and drivers to build trust and create wins for everyone.",
      image: "/images/about/value2.png",
    },
    {
      title: "Quality",
      description: "Every shipment is handled with the highest standard. We prioritize attention to every detail.",
      image: "/images/about/value3.png",
    },
    {
      title: "Innovation",
      description: "Leveraging technology to provide better insights, faster service, and smarter logistics.",
      image: "/images/about/value4.png",
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
    <section className="w-full bg-[var(--brand-white)] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-bold text-[var(--brand-black)] md:text-4xl">
            Our <span className="bg-[linear-gradient(90deg,var(--brand-dark)_0%,var(--brand-primary)_100%)] bg-clip-text text-transparent">
  Values
</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-pretty text-base leading-relaxed text-gray-600 md:text-lg">
            Reliability. Transparency. Accountability. These principles guide everything we do and define our long-term partnerships. These principles guide how we operate, how we serve, and how we grow together with our customers.
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
              {values.map((value, index) => (
                <CarouselItem key={index}>
                  <Card className="border-none py-0 bg-[var(--card-background)] mx-4">
                    <div className="flex flex-col">
                      <div className="relative w-full h-[200px]">
                        <Image
                          src={value.image || "/placeholder.svg"}
                          alt={value.title}
                          fill
                          className="rounded-t-lg object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center p-6">
                        <h3 className="text-xl font-bold text-[var(--brand-black)]">{value.title}</h3>
                        <p className="mt-2 text-pretty leading-relaxed text-gray-700">{value.description}</p>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {values.map((_, index) => (
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
        <div className="hidden md:grid mt-12 gap-8 md:mt-16 md:grid-cols-2">
          {values.map((value, index) => (
            <Card key={index} className="border-none py-0 bg-[var(--card-background)]">
              <div className="grid gap-6 py-0 md:grid-cols-5">
                <div className="relative md:col-span-2 w-full h-full md:h-full">
                  <Image
                    src={value.image || "/placeholder.svg"}
                    alt={value.title}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 md:col-span-3">
                  <h3 className="text-xl font-bold text-[var(--brand-black)]">{value.title}</h3>
                  <p className="mt-2 text-pretty leading-relaxed text-gray-700">{value.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

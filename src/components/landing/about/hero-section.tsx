import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative h-[400px] w-full md:h-[500px] lg:h-[600px]">
      <Image
        src="/images/hero/hero-background.jpg"
        alt="Modern office buildings"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <div className="max-w-xl">
            <h1 className="text-balance text-4xl font-bold leading-tight text-[var(--brand-white)] md:text-5xl lg:text-6xl">
              More Than Freight. A Logistics Partner You Can Trust.
            </h1>
            <p className="mt-4 text-pretty text-base leading-relaxed text-[var(--brand-paragraph)] md:text-lg">
              Our team works alongside you to design dependable, scalable logistics solutions that simplify your supply chain.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

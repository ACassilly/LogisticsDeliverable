import Image from "next/image"

export function WhoWeAre() {
  return (
    <section className="w-full bg-gray-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Image */}
          <div className="relative h-[300px] w-full overflow-hidden rounded-lg md:h-[400px]">
            <Image
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop"
              alt="Logistics technology visualization"
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div>
            <h2 className="text-balance text-3xl font-bold text-[var(--brand-black)] md:text-4xl">
              Who <span className="bg-[linear-gradient(90deg,var(--brand-dark)_0%,var(--brand-primary)_100%)] bg-clip-text text-transparent">
  We Are
</span>
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-gray-700">
              Portlandia Logistics is a full-service freight brokerage offering customized solutions for the right carriers for every shipment. With access to 75,000+ vetted carriers nationwide, we deliver competitive rates and reliable service.
            </p>
            <p className="mt-4 text-pretty leading-relaxed text-gray-700">
              Whether you&apos;re shipping construction materials, manufacturing goods, or e-commerce products, we handle the logistics so you can focus on your business. Our technology platform provides real-time tracking and seamless integration with your systems.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

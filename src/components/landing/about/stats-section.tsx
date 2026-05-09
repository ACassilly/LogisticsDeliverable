import { ShoppingCart, Truck, Headset, CheckCheck } from "lucide-react"

export function StatsSection() {
  const stats = [
    {
      icon: ShoppingCart,
      value: "99.8%",
      label: "On-Time Delivery",
    },
    {
      icon: Truck,
      value: "75k+",
      label: "Vetted Carriers",
    },
    {
      icon: Headset,
      value: "24/7",
      label: "Support Available",
    },
    {
      icon: CheckCheck,
      value: "15+",
      label: "Years Experience",
    },
  ]

  return (
    <section className="w-full bg-[var(--brand-white)] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-bold text-[var(--brand-black)] md:text-4xl">
            Smarter Logistics. <span className="bg-[linear-gradient(90deg,var(--brand-dark)_0%,var(--brand-primary)_100%)] bg-clip-text text-transparent">
  Real Results.
</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-pretty text-base leading-relaxed text-gray-600 md:text-lg">
            We help retailers, manufacturers, and distributors deliver freight to help businesses ship smarter, faster, and with confidence.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-8 md:mt-16 md:grid-cols-4 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full md:h-20 md:w-20 border-5 border-brand-primary/34]"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                <stat.icon className="h-8 w-8 text-[var(--brand-white)] md:h-10 md:w-10" />
              </div>
              <div className="text-3xl font-bold text-[var(--brand-black)] md:text-4xl font-syne">{stat.value}</div>
              <div className="mt-2 text-sm text-gray-600 md:text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { Shield, CheckCircle, Package, Clock } from "lucide-react"

export function QuoteTrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "Licensed",
      subtitle: "Insured Carriers",
    },
    {
      icon: CheckCircle,
      title: "10,000+",
      subtitle: "Shipments Completed",
    },
    {
      icon: Package,
      title: "LTL & FTL",
      subtitle: "All Load Sizes",
    },
    {
      icon: Clock,
      title: "Same-Day",
      subtitle: "Pickup Available",
    },
  ]

  return (
    <section className="w-full py-8 sm:py-10 bg-[#F8F8F8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-2 justify-center sm:justify-start"
            >
              {/* Icon Circle */}
              <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[rgba(59,171,107,0.17)] shrink-0">
                <badge.icon className="w-6 h-6 text-[#3BAB6B]" strokeWidth={2} />
              </div>

              {/* Text Content */}
              <div className="flex flex-col">
                <h3 className="font-syne text-lg sm:text-xl font-bold text-[--text-primary]">
                  {badge.title}
                </h3>
                <p className="text-sm text-[#666666]">
                  {badge.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

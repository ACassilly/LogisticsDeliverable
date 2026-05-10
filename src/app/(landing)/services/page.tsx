import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services | Portlandia Logistics",
  description:
    "Explore our full range of freight and logistics services including LTL, FTL, intermodal, and drayage shipping solutions.",
};

const services = [
  {
    slug: "ltl",
    title: "Less-Than-Truckload (LTL)",
    description:
      "Cost-effective shipping for smaller freight that doesn't require a full trailer. Ideal for palletized shipments.",
  },
  {
    slug: "ftl",
    title: "Full Truckload (FTL)",
    description:
      "Dedicated truck capacity for larger shipments. Direct routes with faster transit times and fewer handling points.",
  },
  {
    slug: "intermodal",
    title: "Intermodal",
    description:
      "Combine rail and truck transport for long-haul efficiency. Lower costs and reduced environmental impact.",
  },
  {
    slug: "drayage",
    title: "Drayage",
    description:
      "Short-distance transport between ports, rail terminals, and warehouses. Keep your supply chain moving.",
  },
];

export default function ServicesPage() {
  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-sm font-semibold tracking-widest text-emerald-600 uppercase mb-3">
          Services
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Logistics Solutions{" "}
          <span className="text-emerald-600">Built for You</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          From partial loads to full truckloads, port drayage to intermodal
          shipping, Portlandia Logistics delivers reliable freight solutions
          tailored to your business.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {services.map((svc) => (
          <Link
            key={svc.slug}
            href={`/services/${svc.slug}`}
            className="group block rounded-2xl border border-gray-200 p-8 hover:shadow-lg hover:border-emerald-500 transition-all"
          >
            <h2 className="text-2xl font-semibold mb-3 group-hover:text-emerald-600 transition-colors">
              {svc.title}
            </h2>
            <p className="text-gray-600 mb-4">{svc.description}</p>
            <span className="text-emerald-600 font-medium text-sm">
              Learn more &rarr;
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link
          href="/quote"
          className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-full font-medium hover:bg-emerald-700 transition-colors"
        >
          Get an Instant Quote
        </Link>
      </div>
    </section>
  );
}

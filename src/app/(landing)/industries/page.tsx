import { ServiceHero } from '@/components/landing/services/service-hero';
import { ServiceBuiltFor } from '@/components/landing/services/service-built-for';
import { ContactForm } from '@/components/landing/contact/contact-form';

const industriesHero = {
  title: 'Industries We Serve',
  description:
    'Portlandia Logistics supports retail, manufacturing, healthcare, construction, and more with tailored freight solutions that keep your supply chain moving.',
  imageUrl: '/images/services/what-is-ltl.png',
  highlights: [
    'Retail & eCommerce logistics',
    'Manufacturing & industrial freight',
    'Healthcare and temperature-sensitive shipping',
  ],
  buttons: [
    { text: 'Explore Services', link: '/services/ltl', variant: 'primary' },
    { text: 'Request Industry Support', link: '/contact', variant: 'secondary' },
  ],
};

const industriesBuiltFor = {
  title: 'Built for Every Industry',
  imageUrl: '/images/services/what-is-ltl.png',
  items: [
    {
      title: 'Retail & eCommerce',
      description:
        'Fast turn times and reliable tracking for high-volume retail shipments and seasonal demand.',
    },
    {
      title: 'Manufacturing',
      description:
        'Dependable freight capacity for inbound materials, part loads, and finished goods distribution.',
    },
    {
      title: 'Construction',
      description:
        'Heavy haul, oversized freight, and time-critical deliveries for job sites and project timelines.',
    },
    {
      title: 'Healthcare',
      description:
        'Protected handling and expedited routing for medical supplies and temperature-controlled freight.',
    },
  ],
  buttonText: 'Talk to an Industry Expert',
  buttonLink: '/contact',
};

export default function IndustriesPage() {
  return (
    <>
      <ServiceHero {...industriesHero} />
      <ServiceBuiltFor {...industriesBuiltFor} />
      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-green-700">Industries</p>
            <h2 className="mt-4 text-3xl font-semibold text-gray-900 sm:text-4xl">
              Freight solutions for every vertical.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
              We combine carrier expertise and digital tools to create customized shipping programs for the industries that depend on precision and reliability.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}

import { ServiceHero } from '@/components/landing/services/service-hero';
import { ServiceBuiltFor } from '@/components/landing/services/service-built-for';
import { ContactForm } from '@/components/landing/contact/contact-form';

const carrierHero = {
  title: 'Carrier Partnership Program',
  description:
    'Join Portlandia Logistics and access high-quality freight lanes, reliable pay terms, and a streamlined partner experience built for professional carriers.',
  imageUrl: '/images/services/ltl-hero.png',
  highlights: [
    'Consistent freight lanes nationwide',
    'Fast pay and clear terms',
    'Dedicated carrier support team',
  ],
  buttons: [
    { text: 'Become a Partner', link: '/contact', variant: 'primary' },
    { text: 'View Carrier Services', link: '/services/ltl', variant: 'secondary' },
  ],
};

const carrierBuiltFor = {
  title: 'Built for Carrier Success',
  imageUrl: '/images/services/built-for-ltl.png',
  items: [
    {
      title: 'Transparent Load Flow',
      description:
        'See available lanes and rates clearly so you can plan your fleet and keep equipment moving with confidence.',
    },
    {
      title: 'Priority Dispatch Support',
      description:
        'Work with a team that helps match your equipment and experience to the right freight opportunities.',
    },
  ],
  buttonText: 'Contact our Carrier Team',
  buttonLink: '/contact',
};

export default function CarrierPage() {
  return (
    <>
      <ServiceHero {...carrierHero} />
      <ServiceBuiltFor {...carrierBuiltFor} />
      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-green-700">Carrier Support</p>
            <h2 className="mt-4 text-3xl font-semibold text-gray-900 sm:text-4xl">
              A better carrier experience starts here.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
              We build partnerships with trusted carriers who want a simpler, faster way to secure quality freight and move with greater predictability.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}

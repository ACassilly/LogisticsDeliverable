import { ContactForm } from '@/components/landing/contact/contact-form';

export default function ContactPage() {
  return (
    <div className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center mb-12">
        <p className="text-sm uppercase tracking-[0.24em] text-green-700">Contact</p>
        <h1 className="mt-4 text-4xl font-semibold text-gray-900 sm:text-5xl">
          Reach the Portlandia Logistics team
        </h1>
        <p className="mt-4 text-base text-gray-600 sm:text-lg">
          Get fast support, quote assistance, or partner information from our logistics specialists.
        </p>
      </div>
      <ContactForm />
    </div>
  );
}

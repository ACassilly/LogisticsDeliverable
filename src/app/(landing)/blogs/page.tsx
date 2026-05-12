import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | Portlandia Logistics',
  description: 'Insights and updates from Portlandia Logistics',
};

export default function BlogsPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-5xl mx-auto px-6 py-24">
        <p className="text-sm font-semibold text-emerald-600 tracking-wider uppercase">BLOG</p>
        <h1 className="mt-3 text-4xl font-bold text-gray-900 md:text-5xl">Insights &amp; Updates</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl">Stay informed with the latest logistics industry trends, company news, and shipping tips from the Portlandia Logistics team.</p>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <p className="text-gray-500 col-span-full text-center py-12">Blog posts coming soon.</p>
        </div>
      </section>
    </main>
  );
}

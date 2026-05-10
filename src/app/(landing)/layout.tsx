import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Header } from '@/components/landing/home/header';
import { Footer } from '@/components/landing/home/footer';

export const metadata: Metadata = {
  title: 'Portlandia Logistics',
  description: 'Freight, carrier, and logistics solutions for modern supply chains.',
};

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-88px)] pt-[88px]">{children}</main>
      <Footer />
    </>
  );
}

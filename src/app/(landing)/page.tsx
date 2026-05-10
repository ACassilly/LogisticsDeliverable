import { HeroSection } from '@/components/landing/home/hero-section';
import { TrustSection } from '@/components/landing/home/trust-section';
import { ServicesSection } from '@/components/landing/home/services-section';
import { TestimonialsSection } from '@/components/landing/home/testimonials-section';
import { BlogSection } from '@/components/landing/home/blog-section';
import { FAQSection } from '@/components/landing/home/faq-section';
import { StayUpdatedSection } from '@/components/landing/home/stay-updated-section';

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <TrustSection />
      <ServicesSection />
      <TestimonialsSection />
      <BlogSection />
      <FAQSection />
      <StayUpdatedSection />
    </>
  );
}

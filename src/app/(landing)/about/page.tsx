import { HeroSection } from '@/components/landing/about/hero-section';
import { WhoWeAre } from '@/components/landing/about/who-we-are';
import { StatsSection } from '@/components/landing/about/stats-section';
import { Team } from '@/components/landing/about/team-section';
import { Values } from '@/components/landing/about/values-section';

export default function AboutPage() {
  return (
    <>
      <HeroSection />
      <WhoWeAre />
      <StatsSection />
      <Team />
      <Values />
    </>
  );
}

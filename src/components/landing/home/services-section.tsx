'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const services = {
  ftl: {
    id: "ftl",
    title: "Full Truckload (FTL)",
    heading: "Dedicated Capacity When You Need It",
    description: "Direct shipping for your full loads with competitive rates and reliable capacity across all 48 states.",
    features: [
      "Direct point-to-point delivery (no transfers)",
      "14,000+ vetted carriers in our network",
      "Average transit time 20% faster than LTL"
    ],
    cta: "Request FTL Quote",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=700&h=458&fit=crop"
  },
  intermodal: {
    id: "intermodal",
    title: "Intermodal Solutions",
    heading: "Cost-Effective Rail & Truck Combination",
    description: "Reduce costs by up to 25% with our rail-truck hybrid solutions for long-haul freight.",
    features: [
      "Eco-friendly shipping option",
      "Predictable pricing and transit times",
      "Ideal for 750+ mile shipments"
    ],
    cta: "Learn More",
    image: "/images/services/intermodal.jpg"
  },
  ltl: {
    id: "ltl",
    title: "Less Than Truckload (LTL)",
    heading: "Flexible Solutions for Smaller Shipments",
    description: "Share truck space and pay only for what you use with our extensive LTL carrier network.",
    features: [
      "Shipments from 150 lbs to 10,000 lbs",
      "Freight class optimization",
      "Real-time tracking and POD"
    ],
    cta: "Get LTL Quote",
    image: "/images/services/built-for-ltl.png"
  },
  specialized: {
    id: "specialized",
    title: "Specialized Equipment",
    heading: "Custom Solutions for Unique Freight",
    description: "Flatbeds, reefers, step decks, and more for your specialized shipping needs.",
    features: [
      "Temperature-controlled transport",
      "Oversized & heavy haul capabilities",
      "White glove delivery services"
    ],
    cta: "Discuss Requirements",
    image: "/images/services/specialized.jpg"
  },
  support: {
    id: "support",
    title: "24/7 Dispatch & Support",
    heading: "Always Available When You Need Us",
    description: "Round-the-clock support ensures your shipments stay on track, no matter the time.",
    features: [
      "Dedicated account manager",
      "2-hour average response time",
      "Proactive issue resolution"
    ],
    cta: "Contact Support",
    image: "/images/services/customer-support.jpg"
  }
};

const servicesArray = Object.values(services);

export function ServicesSection() {
  const [api, setApi] = useState<CarouselApi>();
  const [activeTab, setActiveTab] = useState("ftl");

  // Sync carousel with tabs
  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      const index = api.selectedScrollSnap();
      setActiveTab(servicesArray[index].id);
    });
  }, [api]);

  // Handle tab change - scroll carousel to matching index
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (api) {
      const index = servicesArray.findIndex(s => s.id === value);
      api.scrollTo(index);
    }
  };

  const renderServiceContent = (service: typeof services.ftl) => (
    <div className="max-w-[1500px] grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
      {/* Image */}
      <div className="relative h-[250px] sm:h-[350px] md:h-[458px] rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-lg order-2 md:order-1">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover"
          priority={service.id === "ftl"}
        />
      </div>

      {/* Content */}
      <div className="space-y-4 sm:space-y-6 md:space-y-8 order-1 md:order-2">
        <div>
          <p className="text-[var(--primary)] font-semibold mb-2 text-sm sm:text-base">
            {service.title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-semibold text-[var(--primary-light)] mb-3 sm:mb-4">
            {service.heading}
          </h3>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            {service.description}
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-3 sm:space-y-4">
          {service.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 sm:gap-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary-light)] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href="/quote"
          className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-tab-active border-2 border-transparent text-white rounded-full font-medium hover:opacity-90 transition-all text-sm sm:text-base"
        >
          {service.cta}
        </Link>
      </div>
    </div>
  );
  return (
    <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1500px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--text-primary)] mb-4 sm:mb-6">
            Comprehensive <span className="text-gradient-impact">Freight Solutions</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            From full truckloads to specialized equipment, we provide flexible shipping solutions tailored to your business needs.
          </p>
        </div>

        {/* Mobile Carousel View */}
        <div className="md:hidden">
          {/* Tab Bar - Wrapped on Mobile */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-2 bg-gray-100 rounded-2xl p-1">
              {servicesArray.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleTabChange(service.id)}
                  className={`px-3 py-2 text-xs font-medium transition-all rounded-2xl ${
                    activeTab === service.id
                      ? 'bg-gradient-tab-active text-white shadow-sm'
                      : 'bg-transparent text-gray-700'
                  }`}
                >
                  {service.title}
                </button>
              ))}
            </div>
          </div>

          {/* Carousel */}
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent>
              {servicesArray.map((service) => (
                <CarouselItem key={service.id}>
                  {renderServiceContent(service)}
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Carousel Navigation Dots - Mobile Only */}
          <div className="flex justify-center gap-2 mt-6">
            {servicesArray.map((service) => (
              <button
                key={service.id}
                onClick={() => handleTabChange(service.id)}
                className={`h-1.5 rounded-full transition-all ${
                  activeTab === service.id
                    ? 'w-8 bg-[var(--primary-light)]'
                    : 'w-1.5 bg-gray-300'
                }`}
                aria-label={`Go to ${service.title}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Tabs View */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full hidden md:block">
          {/* Tabs List */}
          <TabsList className="w-full h-auto flex flex-wrap items-center justify-center bg-transparent p-0 mb-8 sm:mb-10 md:mb-12">
            <div className="flex flex-wrap justify-center gap-2 bg-gray-100 rounded-2xl p-1">
              <TabsTrigger 
                value="ftl"
                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-medium transition-all rounded-2xl ${
                  activeTab === "ftl"
                    ? "bg-gradient-tab-active text-white shadow-sm"
                    : "bg-transparent text-gray-700 hover:text-gray-900"
                }`}
              >
                Full Truckload (FTL)
              </TabsTrigger>
              <TabsTrigger 
                value="intermodal"
                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-medium transition-all rounded-2xl ${
                  activeTab === "intermodal"
                    ? "bg-gradient-tab-active text-white shadow-sm"
                    : "bg-transparent text-gray-700 hover:text-gray-900"
                }`}
              >
                Intermodal Solutions
              </TabsTrigger>
              <TabsTrigger 
                value="ltl"
                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-medium transition-all rounded-2xl ${
                  activeTab === "ltl"
                    ? "bg-gradient-tab-active text-white shadow-sm"
                    : "bg-transparent text-gray-700 hover:text-gray-900"
                }`}
              >
                Less Than Truckload (LTL)
              </TabsTrigger>
              <TabsTrigger 
                value="specialized"
                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-medium transition-all rounded-2xl ${
                  activeTab === "specialized"
                    ? "bg-gradient-tab-active text-white shadow-sm"
                    : "bg-transparent text-gray-700 hover:text-gray-900"
                }`}
              >
                Specialized Equipment
              </TabsTrigger>
              <TabsTrigger 
                value="support"
                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-medium transition-all rounded-2xl ${
                  activeTab === "support"
                    ? "bg-gradient-tab-active text-white shadow-sm"
                    : "bg-transparent text-gray-700 hover:text-gray-900"
                }`}
              >
                24/7 Dispatch & Support
              </TabsTrigger>
            </div>
          </TabsList>

          {/* Tab Content */}
          {servicesArray.map((service) => (
            <TabsContent key={service.id} value={service.id} className="mt-0">
              {renderServiceContent(service)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

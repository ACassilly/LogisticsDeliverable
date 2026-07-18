import { notFound } from 'next/navigation';
import { getServiceData } from '@/constants/services';
import { SERVICE_SLUGS } from '@/constants/services';
import { ServiceHero } from '@/components/landing/services/service-hero';
import { ServiceWhyChoose } from '@/components/landing/services/service-why-choose';
import { ServiceWhatIs } from '@/components/landing/services/service-what-is';
import { ServiceBook } from '@/components/landing/services/service-book';
import { ServiceBuiltFor } from '@/components/landing/services/service-built-for';

export function generateStaticParams() {
  return SERVICE_SLUGS.map((service) => ({ service }));
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const serviceData = getServiceData(service);

  if (!serviceData) {
    notFound();
  }

  return (
    <>
      <ServiceHero
        title={serviceData.hero.title}
        description={serviceData.hero.description}
        imageUrl={serviceData.hero.imageUrl}
        highlights={serviceData.hero.highlights}
        buttons={serviceData.hero.buttons}
      />
      <ServiceWhyChoose
        title={serviceData.whyChoose.title}
        subtitle={serviceData.whyChoose.subtitle}
        items={serviceData.whyChoose.items}
      />
      <ServiceWhatIs
        title={serviceData.whatIs.title}
        description={serviceData.whatIs.description}
        imageUrl={serviceData.whatIs.imageUrl}
        buttonText={serviceData.whatIs.buttonText}
        buttonLink={serviceData.whatIs.buttonLink}
      />
      <ServiceBook
        title={serviceData.book.title}
        description={serviceData.book.description}
        buttonText={serviceData.book.buttonText}
        buttonLink={serviceData.book.buttonLink}
        youtubeUrl={serviceData.book.youtubeUrl}
      />
      <ServiceBuiltFor
        title={serviceData.builtFor.title}
        imageUrl={serviceData.builtFor.imageUrl}
        items={serviceData.builtFor.items}
        buttonText={serviceData.builtFor.buttonText}
        buttonLink={serviceData.builtFor.buttonLink}
      />
    </>
  );
}

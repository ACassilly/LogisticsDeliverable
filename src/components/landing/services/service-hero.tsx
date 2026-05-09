import Image from 'next/image';
import { CircleCheckBig } from 'lucide-react';
interface Button {
  text: string;
  link: string;
  variant: 'primary' | 'secondary';
}

interface ServiceHeroProps {
  title: string;
  description: string;
  imageUrl: string;
  highlights: string[];
  buttons: Button[];
}

export function ServiceHero({ title, description, imageUrl, highlights, buttons }: ServiceHeroProps) {
  return (
    <section className="relative w-full py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="max-w-425 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 xl:gap-16 items-center">
          {/* Content */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <h1 className="service-heading">
              {title}
            </h1>
            <p className="service-description">
              {description}
            </p>
            
            {/* Highlights with checkmarks */}
            <div className="space-y-2 sm:space-y-3">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3">
                  <CircleCheckBig className="w-4 h-4 sm:w-5 sm:h-5 text-[#008C2F] shrink-0" />
                  <span className="text-sm sm:text-base text-black">{highlight}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-row xs:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              {buttons.map((button, index) => (
                <a 
                  key={index}
                  href={button.link}
                  className={`inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-300 hover:shadow-lg ${
                    button.variant === 'primary'
                      ? 'service-btn-primary text-white hover:opacity-90'
                      : 'service-btn-secondary text-black hover:bg-black/5'
                  }`}
                >
                  {button.text}
                </a>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[450px] xl:h-[500px] rounded-lg overflow-hidden">
            <Image 
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 588px"
            />
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

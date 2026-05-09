import Image from 'next/image';
import Link from 'next/link';

interface ServiceWhatIsProps {
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
}

export function ServiceWhatIs({ title, description, imageUrl, buttonText, buttonLink }: ServiceWhatIsProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center max-w-425 mx-auto">
          {/* Image */}
          <div className="relative h-56 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden order-2 md:order-1">
            <Image 
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          
          {/* Content */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6 order-1 md:order-2">
            <h2 className="service-heading">
              {title}
            </h2>
            <p className="service-description">
              {description}
            </p>
            <div className="pt-2">
              <Link 
                href={buttonLink}
                className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-white font-medium rounded-lg service-btn-primary transition-all duration-300 hover:shadow-lg"
              >
                {buttonText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

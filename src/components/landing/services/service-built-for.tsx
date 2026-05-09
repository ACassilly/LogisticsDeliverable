import Image from 'next/image';
import Link from 'next/link';

interface BuiltForItem {
  title: string;
  description: string;
}

interface ServiceBuiltForProps {
  title: string;
  imageUrl: string;
  items: BuiltForItem[];
  buttonText: string;
  buttonLink: string;
}

export function ServiceBuiltFor({ title, imageUrl, items, buttonText, buttonLink }: ServiceBuiltForProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center max-w-425 mx-auto">
          {/* Image - Left Side */}
          <div className="relative h-56 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden order-2 md:order-1">
            <Image 
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          
          {/* Content - Right Side */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6 order-1 md:order-2">
            <h2 className="service-heading">
              {title}
            </h2>
            
            {/* Items */}
            <div className="space-y-4 sm:space-y-5">
              {items.map((item, index) => (
                <div key={index}>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-justify">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
            
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

import * as Icons from 'lucide-react';

interface WhyChooseItem {
  title: string;
  description: string;
  icon: string;
}

interface ServiceWhyChooseProps {
  title: string;
  subtitle: string;
  items: WhyChooseItem[];
}

export function ServiceWhyChoose({ title, subtitle, items }: ServiceWhyChooseProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="max-w-425 mx-auto">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="service-heading">
            {title}
          </h2>
          <p className="service-description">
            {subtitle}
          </p>
        </div>
        
        {/* Grid of 6 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-425 mx-auto">
          {items.map((item, index) => {
            const IconComponent = Icons[item.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
            
            return (
              <div 
                key={index}
                className="bg-gray-50 p-5 sm:p-6 md:p-7 rounded-lg hover:shadow-lg transition-all duration-300"
              >
                {/* Icon */}
                <div className="mb-3 sm:mb-4">
                  {IconComponent && <IconComponent className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-green-600" />}
                </div>
              
              {/* Title */}
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                {item.title}
              </h3>
              
              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed text-justify">
                {item.description}
              </p>
            </div>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
}

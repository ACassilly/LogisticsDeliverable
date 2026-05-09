interface ServiceBookProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  youtubeUrl: string;
}

// Convert YouTube watch URL to embed URL
function getYoutubeEmbedUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Handle youtube.com/watch?v=VIDEO_ID format
    if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
      const videoId = urlObj.searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Handle youtu.be/VIDEO_ID format
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1);
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // If already an embed URL, return as is
    if (url.includes('/embed/')) {
      return url;
    }
    return url;
  } catch {
    return url;
  }
}

export function ServiceBook({ title, description, buttonText, buttonLink, youtubeUrl }: ServiceBookProps) {
  const embedUrl = getYoutubeEmbedUrl(youtubeUrl);
  
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center max-w-425 mx-auto">
          {/* Content - Left Side */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6 order-1">
            <h2 className="service-heading">
              {title}
            </h2>
            <p className="service-description">
              {description}
            </p>
            <div className="pt-2">
              <a 
                href={buttonLink}
                className="inline-flex items-center justify-center service-btn-primary px-6 sm:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base text-white font-semibold transition-all duration-300 hover:shadow-lg hover:opacity-90"
              >
                {buttonText}
              </a>
            </div>
          </div>

          {/* YouTube Video - Right Side */}
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden order-2 shadow-md">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}

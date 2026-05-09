'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { ChevronDown, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const services = [
  { name: 'LTL Freight', slug: 'ltl', description: 'Less-than-truckload shipping' },
  { name: 'FTL Freight', slug: 'ftl', description: 'Full truckload services' },
  { name: 'Intermodal', slug: 'intermodal', description: 'Rail and truck transport' },
  { name: 'Drayage', slug: 'drayage', description: 'Port and terminal services' },
];

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const closeSheet = () => setIsOpen(false);

  const handleMouseEnter = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setIsServicesOpen(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsServicesOpen(false);
    }, 200);
    setCloseTimeout(timeout);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-full mx-auto px-4 sm:px-14 lg:px-20">
        <div className="flex items-center justify-between h-16 sm:h-20 lg:h-[88px]">
          {/* Left Section - Logo & Navigation */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>
            
            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-6 ml-8">
              {/* Services Dropdown */}
              <div 
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button 
                  className={`flex items-center gap-2 text-sm capitalize transition-colors ${
                    isActive('/services') 
                      ? `text-[var(--primary-light)] font-semibold`
                      : `text-[var(--text-primary)] hover:text-[var(--primary-light)]`
                  }`}
                >
                  Services
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {isServicesOpen && (
                  <div className="absolute top-full left-0 pt-1 z-50">
                    <div className="w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2 overflow-hidden">
                      {services.map((service) => (
                        <Link
                          key={service.slug}
                          href={`/services/${service.slug}`}
                          className={`block px-4 py-3 transition-all duration-200 ${
                            pathname === `/services/${service.slug}` 
                              ? 'bg-green-50 border-l-4 border-[var(--primary-light)]' 
                              : 'hover:bg-gray-50 hover:pl-5 border-l-4 border-transparent'
                          }`}
                        >
                          <div className={`font-medium text-sm ${
                            pathname === `/services/${service.slug}`
                              ? 'text-[var(--primary-light)]'
                              : 'text-gray-900'
                          }`}>
                            {service.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{service.description}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* <Link 
                href="/industries" 
                className={`flex items-center gap-2 text-sm capitalize transition-colors ${
                  isActive('/industries') 
                    ? `text-[var(--primary-light)] font-semibold` 
                    : `text-[var(--text-primary)] hover:text-[var(--primary-light)]`
                }`}
              >
                Industries
                <ChevronDown className="h-4 w-4 " />
              </Link> */}
              
              <Link 
                href="/blog" 
                className={`text-sm capitalize transition-colors ${
                  isActive('/blog') 
                    ? `text-[var(--primary-light)] font-semibold` 
                    : `text-[var(--text-primary)] hover:text-[var(--primary-light)]`
                }`}
              >
                Blogs
              </Link>
              
              <Link 
                href="/about" 
                className={`flex items-center gap-2 text-sm capitalize transition-colors ${
                  isActive('/about') 
                    ? `text-[var(--primary-light)] font-semibold` 
                    : `text-[var(--text-primary)] hover:text-[var(--primary-light)]`
                }`}
              >
                About Us
              </Link>
              
              <Link 
                href="/carrier" 
                className={`flex items-center gap-2 text-sm capitalize transition-colors ${
                  isActive('/carrier') 
                    ? `text-[var(--primary-light)] font-semibold` 
                    : `text-[var(--text-primary)] hover:text-[var(--primary-light)]`
                }`}
              >
                Carriers
              </Link>
            </nav>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2 sm:gap-4 p-4">
            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                  <Menu className="h-6 w-6 text-[var(--text-primary)]" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <Link href="/" onClick={closeSheet} className="flex items-center">
                      <Logo />
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-6 mt-4 px-4">
                  {/* Mobile Services Dropdown */}
                  <div>
                    <button
                      onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                      className={`flex w-full items-center justify-between text-base transition-colors py-2 ${
                        isActive('/services') 
                          ? 'text-[var(--primary-light)] font-semibold' 
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      Services
                      <ChevronDown className={`h-5 w-5 transition-transform ${isMobileServicesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Mobile Services Submenu */}
                    {isMobileServicesOpen && (
                      <div className="ml-4 mt-2 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
                        {services.map((service) => (
                          <Link
                            key={service.slug}
                            href={`/services/${service.slug}`}
                            onClick={closeSheet}
                            className={`block py-3 px-4 rounded-md transition-all duration-200 ${
                              pathname === `/services/${service.slug}`
                                ? 'bg-green-100 text-[var(--primary-light)] font-medium border-l-4 border-[var(--primary-light)]'
                                : 'text-[var(--text-muted)] hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent'
                            }`}
                          >
                            <div className="text-sm font-medium">{service.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{service.description}</div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* <Link 
                    href="/industries" 
                    onClick={closeSheet}
                    className={`flex items-center justify-between text-base transition-colors py-2 ${
                      isActive('/industries') 
                        ? 'text-[var(--primary-light)] font-semibold' 
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    Industries
                    <ChevronDown className="h-5 w-5" />
                  </Link> */}
                  
                  <Link 
                    href="/blog" 
                    onClick={closeSheet}
                    className={`text-base transition-colors py-2 ${
                      isActive('/blog') 
                        ? 'text-[var(--primary-light)] font-semibold' 
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    Blogs
                  </Link>
                  
                  <Link 
                    href="/about" 
                    onClick={closeSheet}
                    className={`text-base transition-colors py-2 ${
                      isActive('/about') 
                        ? 'text-[var(--primary-light)] font-semibold' 
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    About Us
                  </Link>
                  
                  <Link 
                    href="/carrier" 
                    onClick={closeSheet}
                    className={`text-base transition-colors py-2 ${
                      isActive('/carrier') 
                        ? 'text-[var(--primary-light)] font-semibold' 
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    Carriers
                  </Link>
                  
                  <div className="border-t border-gray-200 pt-6 mt-2 flex flex-col gap-4 text-center">
                    <Link 
                      href="/contact"
                      onClick={closeSheet}
                      className={`text-base transition-colors py-2 ${
                        isActive('/contact')
                          ? 'text-[var(--text-primary)] font-semibold'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      Contact Us
                    </Link>
                    
                    <Link 
                      href="/quote"
                      onClick={closeSheet}
                      className="flex w-full h-12 px-6 justify-center items-center rounded-[25px] border border-[var(--border-light)] bg-[var(--accent-green-light)] text-base font-semibold text-[#2FAC68] hover:shadow-md transition-all"
                      style={{
                        fontFamily: 'var(--font-syne)',
                      }}
                    >
                      Get Instant Quote
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            
            {/* Desktop Actions */}
            <Image 
              src="/images/icons/search.svg" 
              alt="Search" 
              width={16} 
              height={16}
              className="hidden sm:block cursor-pointer hover:opacity-70 transition-opacity" 
            />
            
            <Link 
              href="/contact"
              className={`hidden lg:block text-sm transition-colors ${
                isActive('/contact')
                  ? 'text-[var(--text-primary)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Contact Us
            </Link>
            
            <Link 
              href="/quote"
              className="hidden lg:flex w-[171px] h-10 px-4 py-2 justify-center items-center shrink-0 rounded-[25px] border border-[var(--border-light)] bg-[var(--accent-green-light)] text-sm font-semibold text-[#2FAC68] hover:shadow-md transition-all"
              style={{
                fontFamily: 'var(--font-syne)',
              }}
            >
              Get Instant Quote
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

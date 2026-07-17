'use client';

import Image from "next/image";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCompanyContact } from "@/hooks/use-company-contact";

export function Footer() {
  const { contact, loading } = useCompanyContact(3);

  return (
    <footer className="bg-[var(--dark-gray)] text-[var(--text-footer)] rounded-t-[20px] sm:rounded-t-[30px]">
      <div className="max-w-full mx-auto px-4 sm:px-14 lg:px-20">
        {/* Main Footer Content */}
        <div className="pt-8 sm:pt-12 lg:pt-16 pb-8 sm:pb-12">
          {/* Desktop Grid Layout - Hidden on Mobile */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Company Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm leading-relaxed mb-4 text-[var(--text-footer)]">
                  Full-service freight brokerage. 75,000+ carriers.<br />
                  FTL, LTL, intermodal, specialized.
                </p>
                <p className="text-xs text-[var(--text-footer-muted)] leading-relaxed mb-1">
                  Operating under Pearce Worldwide Logistics Inc
                </p>
                <p className="text-xs text-[var(--text-footer-muted)]">
                  MC-308990 | USDOT-2222648
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-base font-semibold text-white mb-6">
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/services/ltl" className="text-sm text-[var(--text-footer)] hover:text-white transition-colors">
                    Our Services
                  </Link>
                </li>
                <li>
                  <Link href="/quote" className="text-sm text-[var(--text-footer)] hover:text-white transition-colors">
                    Get a Quote
                  </Link>
                </li>
                {/* <li>
                  <Link href="#" className="text-sm text-[var(--text-footer)] hover:text-white transition-colors">
                    Track Shipment
                  </Link>
                </li> */}
                <li>
                  <Link href="/carrier" className="text-sm text-[var(--text-footer)] hover:text-white transition-colors">
                    Carrier Portal
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sm text-[var(--text-footer)] hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                {/* <li>
                  <Link href="#" className="text-sm text-[var(--text-footer)] hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li> */}
                <li>
                  <Link href="/blog" className="text-sm text-[var(--text-footer)] hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-base font-semibold text-white mb-6">
                Contact Us
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Image src="/images/icons/phone.png" alt="Phone" width={16} height={16} />
                  <div>
                    <p className="text-sm text-[var(--text-footer)]">{contact.phone}</p>
                    <p className="text-xs text-[var(--text-footer-muted)] mt-0.5">24/7 Support</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Image src="/images/icons/email.png" alt="Email" width={16} height={16} />
                  <p className="text-sm text-[var(--text-footer)]">{contact.email}</p>
                </li>
                <li className="flex items-start gap-3">
                  <Image src="/images/icons/location.png" alt="Location" width={16} height={16} />
                  <p className="text-sm text-[var(--text-footer)]">
                    {contact.city}, {contact.state} {contact.zip}
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <Image src="/images/icons/clock.png" alt="Time" width={16} height={16} />
                  <div>
                    <p className="text-sm text-[var(--text-footer)]">{contact.business_hours}</p>
                    <p className="text-sm text-[var(--text-footer)]">24/7 Emergency Support</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile Accordion Layout */}
          <div className="md:hidden">
            {/* Company Info - Always Visible on Mobile */}
            <div className="space-y-4 mb-6">
              <p className="text-sm leading-relaxed text-[var(--text-footer)]">
                Full-service freight brokerage. 75,000+ carriers. FTL, LTL, intermodal, specialized.
              </p>
              <p className="text-xs text-[var(--text-footer-muted)]">
                Operating under Pearce Worldwide Logistics Inc | MC-308990 | USDOT-2222648
              </p>
            </div>

            {/* Collapsible Sections */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="quick-links" className="border-[var(--medium-gray)]">
                <AccordionTrigger className="text-base font-semibold text-white hover:text-[var(--primary-light)] transition-colors">
                  Quick Links
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3 pt-2">
                    <li>
                      <Link href="/services/ltl" className="text-sm text-[var(--text-footer)] hover:text-white transition-colors">
                        Our Services
                      </Link>
                    </li>
                    <li>
                      <Link href="/quote" className="text-sm text-[var(--text-footer)] hover:text-white transition-colors">
                        Get a Quote
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-[var(--text-footer)] hover:text-white transition-colors">
                        Track Shipment
                      </Link>
                    </li>
                    <li>
                      <Link href="/carrier" className="text-sm text-[var(--text-footer)] hover:text-white transition-colors">
                        Carrier Portal
                      </Link>
                    </li>
                    <li>
                      <Link href="/about" className="text-sm text-[var(--text-footer)] hover:text-white transition-colors">
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-sm text-[var(--text-footer)] hover:text-white transition-colors">
                        FAQ
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog" className="text-sm text-[var(--text-footer)] hover:text-white transition-colors">
                        Blog
                      </Link>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="contact" className="border-[var(--medium-gray)]">
                <AccordionTrigger className="text-base font-semibold text-white hover:text-[var(--primary-light)] transition-colors">
                  Contact Us
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-4 pt-2">
                    <li className="flex items-start gap-3">
                      <Image src="/images/icons/phone.png" alt="Phone" width={16} height={16} />
                      <div>
                        <p className="text-sm text-[var(--text-footer)]">{contact.phone}</p>
                        <p className="text-xs text-[var(--text-footer-muted)] mt-0.5">24/7 Support</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Image src="/images/icons/email.png" alt="Email" width={16} height={16} />
                      <p className="text-sm text-[var(--text-footer)]">{contact.email}</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <Image src="/images/icons/location.png" alt="Location" width={16} height={16} />
                      <p className="text-sm text-[var(--text-footer)]">
                        {contact.city}, {contact.state} {contact.zip}
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <Image src="/images/icons/clock.png" alt="Time" width={16} height={16} />
                      <div>
                        <p className="text-sm text-[var(--text-footer)]">{contact.business_hours}</p>
                        <p className="text-sm text-[var(--text-footer)]">24/7 Emergency Support</p>
                      </div>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Logo and CTA Section */}
        <div className="flex flex-col md:flex-row items-center justify-between py-8 sm:py-10 lg:py-12 border-y border-[var(--medium-gray)] gap-6">
          <div className="text-center md:text-left w-full md:w-auto">
            <div className="mb-3 flex justify-center md:justify-start">
              <Image 
                src="/images/logo/logo.png" 
                alt="Portlandia Logistics" 
                width={180}
                height={80}
                className="sm:w-[200px] sm:h-[89px]"
              />
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-footer-muted)]">
              Ship Smarter with Portlandia Logistics
            </p>
          </div>
          <div className="w-full md:w-auto">
            <p className="text-sm sm:text-base font-medium text-white mb-4 text-center md:text-right">
              Ready to ship with us?
            </p>
            <div className="flex items-center justify-center md:justify-end gap-3">
              <Link
                href="/contact"
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-[var(--btn-gradient-start)] to-[var(--btn-gradient-end)] text-white rounded-full text-sm sm:text-base font-medium hover:shadow-lg transition-all"
              >
                Contact us
              </Link>
              
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-4 sm:py-6 text-center">
          <p className="text-xs sm:text-sm text-[var(--text-footer-muted)] mb-4">
            Operating under Pearce Worldwide Logistics Inc | MC-308990 | USDOT-2222648
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 sm:py-4 border-t border-[var(--medium-gray)] gap-4">
          <p className="text-xs text-[var(--text-footer-muted)] text-center sm:text-left">
            © 2026 Portlandia Logistics. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/privacy-policy" className="text-xs text-[var(--text-footer-muted)] hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-[var(--text-footer-muted)] hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

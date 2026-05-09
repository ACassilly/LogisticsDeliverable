'use client';

import Image from "next/image";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Footer() {
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
               <div className="flex items-center gap-4">
                <Link href="#" className="cursor-pointer hover:opacity-70 transition-opacity">
                 <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 134 138" fill="none">
  <path d="M133.846 68.7201C133.846 103.426 108.79 132.118 76.2413 136.775C73.1969 137.211 70.0832 137.436 66.9231 137.436C63.2737 137.436 59.6936 137.135 56.2022 136.558C24.3399 131.291 0 102.92 0 68.7161C0 30.7652 29.9625 0 66.9231 0C103.884 0 133.846 30.7652 133.846 68.7161V68.7201Z" fill="#2FAC68"/>
  <path d="M87.8794 27.469H45.9629C34.3826 27.469 24.9642 37.1398 24.9642 49.0303V88.4058C24.9642 100.296 34.3826 109.967 45.9629 109.967H87.8794C99.4597 109.967 108.878 100.296 108.878 88.4058V49.0303C108.878 37.1398 99.4597 27.469 87.8794 27.469ZM32.3709 49.0303C32.3709 41.3341 38.4675 35.0742 45.9629 35.0742H87.8794C95.3748 35.0742 101.471 41.3341 101.471 49.0303V88.4058C101.471 96.102 95.3748 102.362 87.8794 102.362H45.9629C38.4675 102.362 32.3709 96.102 32.3709 88.4058V49.0303Z" fill="white"/>
  <path d="M66.9193 88.7777C77.6904 88.7777 86.4536 79.7797 86.4536 68.72C86.4536 57.6604 77.6904 48.6624 66.9193 48.6624C56.1483 48.6624 47.3849 57.6604 47.3849 68.72C47.3849 79.7797 56.1483 88.7777 66.9193 88.7777ZM66.9193 56.2715C73.6055 56.2715 79.043 61.8548 79.043 68.72C79.043 75.5853 73.6055 81.1686 66.9193 81.1686C60.2332 81.1686 54.7956 75.5853 54.7956 68.72C54.7956 61.8548 60.2332 56.2715 66.9193 56.2715Z" fill="white"/>
  <path d="M88.2649 51.8991C91.1667 51.8991 93.529 49.4735 93.529 46.4939C93.529 43.5144 91.1667 41.0888 88.2649 41.0888C85.363 41.0888 83.0008 43.5144 83.0008 46.4939C83.0008 49.4735 85.363 51.8991 88.2649 51.8991Z" fill="white"/>
</svg>
                </Link>
                <Link href="#" className="cursor-pointer hover:opacity-70 transition-opacity">
                 <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 134 138" fill="none">
  <path d="M133.846 68.7201C133.846 103.426 108.79 132.118 76.2413 136.775C73.1969 137.211 70.0832 137.436 66.9231 137.436C63.2737 137.436 59.6936 137.135 56.2022 136.558C24.3399 131.291 0 102.92 0 68.7161C0 30.7652 29.9625 0 66.9231 0C103.884 0 133.846 30.7652 133.846 68.7161V68.7201Z" fill="#2FAC68"/>
  <path d="M76.2413 55.1755V70.1446H94.2766L91.421 90.313H76.2413V136.775C73.1969 137.211 70.0832 137.436 66.9231 137.436C63.2737 137.436 59.6936 137.135 56.2022 136.558V90.313H39.5697V70.1446H56.2022V51.8319C56.2022 40.4676 65.1735 31.2519 76.2452 31.2519V31.2637C76.276 31.2637 76.3068 31.2519 76.3377 31.2519H94.2804V48.6901H82.5576C79.07 48.6901 76.2452 51.5905 76.2452 55.1715L76.2413 55.1755Z" fill="white"/>
</svg>
                </Link>
                <Link href="#" className="cursor-pointer hover:opacity-70 transition-opacity">
                 <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 134 138" fill="none">
  <path d="M133.846 68.7201C133.846 103.426 108.789 132.118 76.2412 136.775C73.1968 137.211 70.0832 137.436 66.9231 137.436C63.2737 137.436 59.6935 137.135 56.2021 136.558C24.3398 131.291 0 102.92 0 68.7161C0 30.7652 29.9625 0 66.9231 0C103.884 0 133.846 30.7652 133.846 68.7161V68.7201Z" fill="#2FAC68"/>
  <path d="M32.5638 45.5126C30.7795 43.8111 29.8893 41.7061 29.8893 39.2013C29.8893 36.6966 30.7795 34.4965 32.5638 32.795C34.348 31.0936 36.6448 30.2428 39.4618 30.2428C42.2789 30.2428 44.4832 31.0936 46.2636 32.795C48.0479 34.4965 48.9381 36.6333 48.9381 39.2013C48.9381 41.7694 48.0479 43.8111 46.2636 45.5126C44.4794 47.2141 42.2134 48.0648 39.4618 48.0648C36.7103 48.0648 34.348 47.2141 32.5638 45.5126ZM47.4351 55.2704V107.411H31.3922V55.2704H47.4351Z" fill="#FEFFFC"/>
  <path d="M100.855 60.4184C104.35 64.316 106.1 69.6697 106.1 76.4836V106.493H90.8584V78.6005C90.8584 75.1659 89.9913 72.495 88.2571 70.5917C86.523 68.6884 84.1915 67.7387 81.2627 67.7387C78.3339 67.7387 76.0023 68.6924 74.2681 70.5917C72.534 72.495 71.6669 75.1659 71.6669 78.6005V106.493H56.337V55.128H71.6669V61.9418C73.2199 59.6706 75.3125 57.8781 77.9446 56.5565C80.5728 55.2388 83.5325 54.578 86.8197 54.578C92.6773 54.578 97.3556 56.5287 100.851 60.4223L100.855 60.4184Z" fill="#FEFFFC"/>
</svg>
                </Link>
                <Link href="#" className="cursor-pointer hover:opacity-70 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 134 138" fill="none">
  <path d="M133.846 68.72C133.846 103.426 108.79 132.118 76.2413 136.775C73.1969 137.211 70.0831 137.436 66.923 137.436C63.2736 137.436 59.6936 137.135 56.2022 136.558C24.3399 131.291 0 102.92 0 68.7161C0 30.7651 29.9624 0 66.923 0C103.884 0 133.846 30.7651 133.846 68.7161V68.72Z" fill="#2FAC68"/>
  <path fillRule="evenodd" clipRule="evenodd" d="M60.738 86.8467C60.6571 87.1356 60.58 87.377 60.5183 87.6183C56.9344 102.033 56.5374 105.235 52.8533 111.93C51.096 115.111 49.1191 118.126 46.9302 121.011C46.6836 121.335 46.4524 121.759 45.9591 121.656C45.4196 121.537 45.3772 121.039 45.3194 120.595C44.7298 116.215 44.4061 111.823 44.5448 107.399C44.7298 101.638 45.4234 99.6593 52.6567 68.4312C52.7608 67.9564 52.6452 67.5606 52.4872 67.1293C50.7569 62.3335 50.4139 57.4665 51.9246 52.5362C55.2002 41.8841 66.9578 41.069 69.0157 49.8573C70.2836 55.2942 66.9308 62.4048 64.3566 72.9223C62.2255 81.5998 72.1719 87.7648 80.6731 81.4337C88.5115 75.5972 91.5559 61.5976 90.9778 51.6775C89.8372 31.8968 68.7151 27.6233 55.312 33.994C39.9473 41.2866 36.4559 60.8418 43.3926 69.7765C44.2712 70.9122 45.9282 71.6086 45.6392 72.7601C45.1922 74.5486 44.7991 76.353 44.3174 78.1336C43.959 79.4591 41.9012 79.9379 40.5986 79.3958C38.0398 78.3354 35.9125 76.6616 34.1822 74.4615C28.2899 66.9711 26.6059 52.1563 34.3942 39.6128C43.0226 25.7161 59.0732 20.0973 73.7288 21.8027C91.2322 23.8484 102.296 36.1268 104.366 50.0552C105.31 56.4021 104.631 72.0518 95.9529 83.1074C85.9719 95.8171 69.7941 96.6599 62.3295 88.8569C61.7553 88.2594 61.2929 87.559 60.7303 86.8428L60.738 86.8467Z" fill="white"/>
</svg>
                </Link>
                
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
                    <p className="text-sm text-[var(--text-footer)]">(502) 385-3399</p>
                    <p className="text-xs text-[var(--text-footer-muted)] mt-0.5">24/7 Support</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Image src="/images/icons/email.png" alt="Email" width={16} height={16} />
                  <p className="text-sm text-[var(--text-footer)]">connect@portlandialogistics.com</p>
                </li>
                <li className="flex items-start gap-3">
                  <Image src="/images/icons/location.png" alt="Location" width={16} height={16} />
                  <p className="text-sm text-[var(--text-footer)]">Louisville, KY 40203</p>
                </li>
                <li className="flex items-start gap-3">
                  <Image src="/images/icons/clock.png" alt="Time" width={16} height={16} />
                  <div>
                    <p className="text-sm text-[var(--text-footer)]">Mon-Fri: 8AM-6PM EST</p>
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
              <div className="flex items-center gap-4">
                 <Link href="#" className="cursor-pointer hover:opacity-70 transition-opacity">
                 <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 134 138" fill="none">
  <path d="M133.846 68.7201C133.846 103.426 108.79 132.118 76.2413 136.775C73.1969 137.211 70.0832 137.436 66.9231 137.436C63.2737 137.436 59.6936 137.135 56.2022 136.558C24.3399 131.291 0 102.92 0 68.7161C0 30.7652 29.9625 0 66.9231 0C103.884 0 133.846 30.7652 133.846 68.7161V68.7201Z" fill="#2FAC68"/>
  <path d="M87.8794 27.469H45.9629C34.3826 27.469 24.9642 37.1398 24.9642 49.0303V88.4058C24.9642 100.296 34.3826 109.967 45.9629 109.967H87.8794C99.4597 109.967 108.878 100.296 108.878 88.4058V49.0303C108.878 37.1398 99.4597 27.469 87.8794 27.469ZM32.3709 49.0303C32.3709 41.3341 38.4675 35.0742 45.9629 35.0742H87.8794C95.3748 35.0742 101.471 41.3341 101.471 49.0303V88.4058C101.471 96.102 95.3748 102.362 87.8794 102.362H45.9629C38.4675 102.362 32.3709 96.102 32.3709 88.4058V49.0303Z" fill="white"/>
  <path d="M66.9193 88.7777C77.6904 88.7777 86.4536 79.7797 86.4536 68.72C86.4536 57.6604 77.6904 48.6624 66.9193 48.6624C56.1483 48.6624 47.3849 57.6604 47.3849 68.72C47.3849 79.7797 56.1483 88.7777 66.9193 88.7777ZM66.9193 56.2715C73.6055 56.2715 79.043 61.8548 79.043 68.72C79.043 75.5853 73.6055 81.1686 66.9193 81.1686C60.2332 81.1686 54.7956 75.5853 54.7956 68.72C54.7956 61.8548 60.2332 56.2715 66.9193 56.2715Z" fill="white"/>
  <path d="M88.2649 51.8991C91.1667 51.8991 93.529 49.4735 93.529 46.4939C93.529 43.5144 91.1667 41.0888 88.2649 41.0888C85.363 41.0888 83.0008 43.5144 83.0008 46.4939C83.0008 49.4735 85.363 51.8991 88.2649 51.8991Z" fill="white"/>
</svg>
                </Link>
                <Link href="#" className="cursor-pointer hover:opacity-70 transition-opacity">
                 <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 134 138" fill="none">
  <path d="M133.846 68.7201C133.846 103.426 108.79 132.118 76.2413 136.775C73.1969 137.211 70.0832 137.436 66.9231 137.436C63.2737 137.436 59.6936 137.135 56.2022 136.558C24.3399 131.291 0 102.92 0 68.7161C0 30.7652 29.9625 0 66.9231 0C103.884 0 133.846 30.7652 133.846 68.7161V68.7201Z" fill="#2FAC68"/>
  <path d="M76.2413 55.1755V70.1446H94.2766L91.421 90.313H76.2413V136.775C73.1969 137.211 70.0832 137.436 66.9231 137.436C63.2737 137.436 59.6936 137.135 56.2022 136.558V90.313H39.5697V70.1446H56.2022V51.8319C56.2022 40.4676 65.1735 31.2519 76.2452 31.2519V31.2637C76.276 31.2637 76.3068 31.2519 76.3377 31.2519H94.2804V48.6901H82.5576C79.07 48.6901 76.2452 51.5905 76.2452 55.1715L76.2413 55.1755Z" fill="white"/>
</svg>
                </Link>
                <Link href="#" className="cursor-pointer hover:opacity-70 transition-opacity">
                 <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 134 138" fill="none">
  <path d="M133.846 68.7201C133.846 103.426 108.789 132.118 76.2412 136.775C73.1968 137.211 70.0832 137.436 66.9231 137.436C63.2737 137.436 59.6935 137.135 56.2021 136.558C24.3398 131.291 0 102.92 0 68.7161C0 30.7652 29.9625 0 66.9231 0C103.884 0 133.846 30.7652 133.846 68.7161V68.7201Z" fill="#2FAC68"/>
  <path d="M32.5638 45.5126C30.7795 43.8111 29.8893 41.7061 29.8893 39.2013C29.8893 36.6966 30.7795 34.4965 32.5638 32.795C34.348 31.0936 36.6448 30.2428 39.4618 30.2428C42.2789 30.2428 44.4832 31.0936 46.2636 32.795C48.0479 34.4965 48.9381 36.6333 48.9381 39.2013C48.9381 41.7694 48.0479 43.8111 46.2636 45.5126C44.4794 47.2141 42.2134 48.0648 39.4618 48.0648C36.7103 48.0648 34.348 47.2141 32.5638 45.5126ZM47.4351 55.2704V107.411H31.3922V55.2704H47.4351Z" fill="#FEFFFC"/>
  <path d="M100.855 60.4184C104.35 64.316 106.1 69.6697 106.1 76.4836V106.493H90.8584V78.6005C90.8584 75.1659 89.9913 72.495 88.2571 70.5917C86.523 68.6884 84.1915 67.7387 81.2627 67.7387C78.3339 67.7387 76.0023 68.6924 74.2681 70.5917C72.534 72.495 71.6669 75.1659 71.6669 78.6005V106.493H56.337V55.128H71.6669V61.9418C73.2199 59.6706 75.3125 57.8781 77.9446 56.5565C80.5728 55.2388 83.5325 54.578 86.8197 54.578C92.6773 54.578 97.3556 56.5287 100.851 60.4223L100.855 60.4184Z" fill="#FEFFFC"/>
</svg>
                </Link>
                <Link href="#" className="cursor-pointer hover:opacity-70 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 134 138" fill="none">
  <path d="M133.846 68.72C133.846 103.426 108.79 132.118 76.2413 136.775C73.1969 137.211 70.0831 137.436 66.923 137.436C63.2736 137.436 59.6936 137.135 56.2022 136.558C24.3399 131.291 0 102.92 0 68.7161C0 30.7651 29.9624 0 66.923 0C103.884 0 133.846 30.7651 133.846 68.7161V68.72Z" fill="#2FAC68"/>
  <path fillRule="evenodd" clipRule="evenodd" d="M60.738 86.8467C60.6571 87.1356 60.58 87.377 60.5183 87.6183C56.9344 102.033 56.5374 105.235 52.8533 111.93C51.096 115.111 49.1191 118.126 46.9302 121.011C46.6836 121.335 46.4524 121.759 45.9591 121.656C45.4196 121.537 45.3772 121.039 45.3194 120.595C44.7298 116.215 44.4061 111.823 44.5448 107.399C44.7298 101.638 45.4234 99.6593 52.6567 68.4312C52.7608 67.9564 52.6452 67.5606 52.4872 67.1293C50.7569 62.3335 50.4139 57.4665 51.9246 52.5362C55.2002 41.8841 66.9578 41.069 69.0157 49.8573C70.2836 55.2942 66.9308 62.4048 64.3566 72.9223C62.2255 81.5998 72.1719 87.7648 80.6731 81.4337C88.5115 75.5972 91.5559 61.5976 90.9778 51.6775C89.8372 31.8968 68.7151 27.6233 55.312 33.994C39.9473 41.2866 36.4559 60.8418 43.3926 69.7765C44.2712 70.9122 45.9282 71.6086 45.6392 72.7601C45.1922 74.5486 44.7991 76.353 44.3174 78.1336C43.959 79.4591 41.9012 79.9379 40.5986 79.3958C38.0398 78.3354 35.9125 76.6616 34.1822 74.4615C28.2899 66.9711 26.6059 52.1563 34.3942 39.6128C43.0226 25.7161 59.0732 20.0973 73.7288 21.8027C91.2322 23.8484 102.296 36.1268 104.366 50.0552C105.31 56.4021 104.631 72.0518 95.9529 83.1074C85.9719 95.8171 69.7941 96.6599 62.3295 88.8569C61.7553 88.2594 61.2929 87.559 60.7303 86.8428L60.738 86.8467Z" fill="white"/>
</svg>
                </Link>
                
                
              </div>
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
                        <p className="text-sm text-[var(--text-footer)]">(502) 385-3399</p>
                        <p className="text-xs text-[var(--text-footer-muted)] mt-0.5">24/7 Support</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Image src="/images/icons/email.png" alt="Email" width={16} height={16} />
                      <p className="text-sm text-[var(--text-footer)]">connect@portlandialogistics.com</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <Image src="/images/icons/location.png" alt="Location" width={16} height={16} />
                      <p className="text-sm text-[var(--text-footer)]">Louisville, KY 40203</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <Image src="/images/icons/clock.png" alt="Time" width={16} height={16} />
                      <div>
                        <p className="text-sm text-[var(--text-footer)]">Mon-Fri: 8AM-6PM EST</p>
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
                src="/images/logo/logo-white.png" 
                alt="Portlandia Logistics" 
                width={200} 
                height={32}
                className="sm:w-[250px] sm:h-[40px]"
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

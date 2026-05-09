// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';

// export function TechnologySection() {
//   const [isPlaying, setIsPlaying] = useState(false);

//   const features = [
//     'One-click booking with immediate confirmation',
//     'Live GPS tracking on every shipment',
//     'Automated milestone alerts for every shipment',
//     'Never guess. Mark on time, full transparency'
//   ];

//   return (
//     <section className="w-full py-12 bg-(--background-black) sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
//       <div className=" mx-auto ">
//         {/* Header Section - Centered */}
//         <div className="text-center mb-12 sm:mb-16 md:mb-20">
//           <h2 className="text-2xl mx-auto  w-[520px] text-center sm:text-3xl md:text-4xl font-semibold text-white mb-4 sm:mb-6">
//             Technology That Empowers 
//             <span className="text-[var(--primary-light)] text-center ">Your Business</span>
//           </h2>
//           <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto px-4">
//             One platform to manage every step of your transportation process. Eliminate inefficiencies and ship smarter.
//           </p>
//         </div>

//         {/* Content Section - Mobile: Stacked, Desktop: Two Columns with Overlap */}
//         <div className="relative">
//           {/* Mobile Layout - Stacked Vertically */}
//           <div className="lg:hidden space-y-6">
//             {/* Video - Top on Mobile */}
//             <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#6b8cce] to-[#8ba6db] p-4 shadow-2xl h-[450px]">
//               <div className="relative aspect-video bg-white rounded-lg overflow-hidden shadow-lg ">
//                 {!isPlaying ? (
//                   <div className="relative w-full h-full">
//                     <Image
//                       src="https://img.youtube.com/vi/sTC6XadKLdc/maxresdefault.jpg"
//                       alt="Technology demo video"
//                       fill
//                       className="object-cover"
//                     />
//                     <button
//                       onClick={() => setIsPlaying(true)}
//                       className="absolute inset-0 flex items-center justify-center group"
//                       aria-label="Play video"
//                     >
//                       <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:bg-white group-hover:scale-110 transition-all">
//                         <svg
//                           className="w-8 h-8 text-[var(--primary)] ml-1"
//                           fill="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path d="M8 5v14l11-7z" />
//                         </svg>
//                       </div>
//                     </button>
//                   </div>
//                 ) : (
//                   <iframe
//                     src="https://www.youtube.com/embed/sTC6XadKLdc?autoplay=1&rel=0"
//                     title="Technology demo video"
//                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                     allowFullScreen
//                     className="w-full h-full"
//                   />
//                 )}
//               </div>
//               <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
//               <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full blur-lg" />
//             </div>

//             {/* Content - Bottom on Mobile */}
//             <div className="rounded-[20px] bg-white/[0.07] p-6 h-[400px]">
//               <div className="space-y-6">
//                 <h3 className="text-xl font-medium text-white leading-7">
//                   See How Easy Shipping Can Be
//                 </h3>

//                 <ul className="space-y-4">
//                   {features.map((feature, index) => (
//                     <li key={index} className="flex items-start gap-3">
//                       <svg 
//                         className="w-5 h-5 text-[var(--primary)] mt-0.5 shrink-0" 
//                         fill="currentColor" 
//                         viewBox="0 0 20 20"
//                       >
//                         <path 
//                           fillRule="evenodd" 
//                           d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
//                           clipRule="evenodd" 
//                         />
//                       </svg>
//                       <span className="text-white text-[15px] font-normal leading-[1.96]">{feature}</span>
//                     </li>
//                   ))}
//                 </ul>

//                 <Link
//                   href="/technology"
//                   className="btn-gradient-green inline-flex justify-center items-center w-full sm:w-[170px] h-[57px] gap-2.5 rounded-[35px] text-white font-medium hover:opacity-90 transition-all"
//                 >
//                   Learn More
//                 </Link>
//               </div>
//             </div>
//           </div>

//           {/* Desktop Layout - Two Columns with Overlap */}
//           <div className="hidden lg:grid grid-cols-2 gap-0 items-center">
//             {/* Left Side - Content */}
//             <div className="inline-flex items-center rounded-[20px] bg-white/[0.07] pt-[53px] pr-[125px] pb-[52px] pl-[42px] relative z-0 mr-[-130px]">
//               <div className="space-y-8">
//                 <h3 className="text-2xl font-medium text-white leading-7">
//                   See How Easy Shipping Can Be
//                 </h3>

//                 <ul className="space-y-4">
//                   {features.map((feature, index) => (
//                     <li key={index} className="flex items-start gap-3">
//                       <svg 
//                         className="w-6 h-6 text-[var(--primary)] mt-0.5 shrink-0" 
//                         fill="currentColor" 
//                         viewBox="0 0 20 20"
//                       >
//                         <path 
//                           fillRule="evenodd" 
//                           d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
//                           clipRule="evenodd" 
//                         />
//                       </svg>
//                       <span className="text-white text-[15px] font-normal leading-[1.96]">{feature}</span>
//                     </li>
//                   ))}
//                 </ul>

//                 <Link
//                   href="/technology"
//                   className="btn-gradient-green inline-flex justify-center items-center w-[170px] h-[57px] gap-2.5 rounded-[35px] text-white font-medium hover:opacity-90 transition-all"
//                 >
//                   Learn More
//                 </Link>
//               </div>
//             </div>

//             {/* Right Side - Video (Larger and Centered) */}
//             <div className="relative z-10 flex items-center justify-center pl-20">
//               <div className="relative w-full max-w-[650px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#6b8cce] to-[#8ba6db] p-8 shadow-2xl">
//                 <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
//                   <div className="absolute inset-0 bg-white rounded-lg overflow-hidden shadow-lg">
//                     {!isPlaying ? (
//                       <div className="relative w-full h-full">
//                         <Image
//                           src="https://img.youtube.com/vi/sTC6XadKLdc/maxresdefault.jpg"
//                           alt="Technology demo video"
//                           fill
//                           className="object-cover"
//                         />
//                         <button
//                           onClick={() => setIsPlaying(true)}
//                           className="absolute inset-0 flex items-center justify-center group"
//                           aria-label="Play video"
//                         >
//                           <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:bg-white group-hover:scale-110 transition-all">
//                             <svg
//                               className="w-10 h-10 text-[var(--primary)] ml-1"
//                               fill="currentColor"
//                               viewBox="0 0 24 24"
//                             >
//                               <path d="M8 5v14l11-7z" />
//                             </svg>
//                           </div>
//                         </button>
//                       </div>
//                     ) : (
//                       <iframe
//                         src="https://www.youtube.com/embed/sTC6XadKLdc?autoplay=1&rel=0"
//                         title="Technology demo video"
//                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                         allowFullScreen
//                         className="absolute inset-0 w-full h-full"
//                       />
//                     )}
//                   </div>
//                 </div>

//                 {/* Decorative Elements */}
//                 <div className="absolute top-4 right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
//                 <div className="absolute bottom-4 left-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Carousel Navigation Dots */}
//         <div className="flex justify-center gap-2 mt-8 sm:mt-12">
//           <div className="w-8 h-1.5 bg-[var(--primary)] rounded-full" />
//           <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
//           <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
//         </div>
//       </div>
//     </section>
//   );
// }

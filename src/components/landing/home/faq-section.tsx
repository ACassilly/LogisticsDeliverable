'use client';

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How long does it take to receive a quote?",
    answer: "Most quotes are delivered within 60 seconds through our automated system. For specialized or complex shipments, our team will respond within 2 hours during business hours."
  },
  {
    question: "What information do I need to request a quote?",
    answer: "You'll need pickup and delivery locations, dimensions and weight of your freight, commodity type, and preferred pickup date. Any special requirements like liftgate, inside delivery, or time-sensitive delivery should also be mentioned."
  },
  {
    question: "Is requesting a quote free?",
    answer: "Yes, absolutely! Requesting a quote is always free with no obligation. We believe in transparent pricing and only charge when you book a shipment with us."
  },
  {
    question: "Will the quoted price change later?",
    answer: "Quoted prices are locked in for 3 days as long as the shipment details remain the same. If your freight characteristics change (weight, dimensions, special services), we'll provide an updated quote before booking."
  },
  {
    question: "What happens after I submit a quote request?",
    answer: "You'll receive an instant quote for standard shipments, or a dedicated logistics specialist will review your requirements and provide a customized quote within 2 hours. Once you approve, we'll immediately begin securing capacity with our carrier network."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-6 lg:px-12">
      <div className="max-w-[1500px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-4xl font-semibold text-(--text-primary) mb-4"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            FAQs
          </h2>
        </div>

        {/* FAQ Items */}
        <div className="space-y-0 border-t border-gray-200">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 ">
              <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between py-6 text-left hover:bg-gray-50 hover:cursor-pointer transition-colors px-6 rounded-lg"
              >
            <span className="text-lg font-medium text-(--text-primary) pr-8">
              {faq.question}
            </span>
            {openIndex === index ? (
              <Minus className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4 " />
            )}
              </button>
              {openIndex === index && (
            <div className="px-6 pb-6">
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 h-12 w-44.5 service-btn-primary hover:cursor-pointer text-white rounded-full font-medium hover:bg-opacity-90 transition-all">
            Contact us
          </button>
        </div>
      </div>
    </section>
  );
}

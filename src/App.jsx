import React, { useState } from 'react';

const faqData = [
  {
    question: "How does Web3Nova automate WhatsApp customer support?",
    answer: "Web3Nova uses an advanced AI assistant to instantly understand your customers' queries and trigger automated, human-like responses directly on WhatsApp. It handles everything from product FAQs to complex order inquiries without human intervention."
  },
  {
    question: "Can I manage my store's orders directly through WhatsApp?",
    answer: "Yes! Web3Nova seamlessly integrates order management. When a customer places or requests an order via WhatsApp, it updates on your centralized dashboard in real-time, complete with seamless status tracking and zero hidden messaging fees."
  },
  {
    question: "Do I need a special WhatsApp Business account?",
    answer: "Web3Nova works seamlessly with standard WhatsApp Business configurations. Our onboarding team will help you connect your number to our Visual Automation Builder smoothly so you can launch your first campaign in minutes."
  },
  {
    question: "Are there any hidden messaging fees or extra charges?",
    answer: "No. Unlike other platforms that add extra costs per message, Web3Nova provides transparent flat-rate pricing based on your chosen plan, ensuring complete control over your operational costs."
  }
];

export default function FAQAndFooter() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full mt-24 md:mt-32">

      {/* ================= 🟦 FAQ SECTION ================= */}
      <section className="w-full bg-[#4166F5] selection:bg-white/20">
        <div className="max-w-[1200px] mx-auto px-6 py-20 md:py-28">

          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-['Manrope'] font-bold text-[28px] md:text-[36px] text-white leading-[1.2] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="font-['Inter'] font-normal text-[16px] text-white/80 leading-[1.6] mt-4 max-w-xl mx-auto">
              Got questions about Web3Nova? We've got answers. Explore how our platform transforms your business operations.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqData.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-xl overflow-hidden transition-all duration-300 border ${isOpen
                      ? 'bg-white border-transparent shadow-xl'
                      : 'bg-transparent border-white/20 hover:border-white/40'
                    }`}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none"
                  >
                    <span className={`font-['Manrope'] font-semibold text-[16px] md:text-[18px] leading-[1.4] transition-colors duration-200 ${isOpen ? 'text-[#1E293B]' : 'text-white'
                      }`}>
                      {faq.question}
                    </span>

                    <span className={`ml-4 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 ${isOpen
                        ? 'rotate-180 bg-[#4166F5] text-white border-transparent'
                        : 'border-white/30 text-white bg-transparent'
                      }`}>
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 1L6 6L11 1" />
                      </svg>
                    </span>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-60 border-t border-[#F1F5F9]' : 'max-h-0'
                      }`}
                  >
                    <p className="font-['Inter'] font-normal text-[14px] md:text-[15px] text-[#4166F5] leading-[1.6] p-5 md:p-6 bg-white">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= ⬜ HIGH-END ENTERPRISE FOOTER SECTION ================= */}
      <footer className="w-full bg-white text-[#1E293B] font-['Inter'] border-t border-[#E2E8F0] selection:bg-[#4166F5]/10">

        {/* PREMIUM ACTION CTA ROW */}
        <div className="border-b border-[#E2E8F0]">
          <div className="max-w-[1200px] mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-2xl">
              <h3 className="font-['Manrope'] font-bold text-[22px] md:text-[26px] text-[#0F172A] tracking-tight">
                Ready to automate your operations?
              </h3>
              <p className="text-[14px] md:text-[15px] text-[#64748B] mt-1.5 leading-relaxed">
                Join scaling businesses accelerating client relationships with Web3Nova.
              </p>
            </div>
            <div className="w-full md:w-auto">
              <a
                href="#"
                className="group inline-flex w-full md:w-auto items-center justify-center px-6 py-3.5 bg-[#4166F5] hover:bg-[#3454D1] text-white font-['Manrope'] font-semibold text-[15px] rounded-lg transition-all duration-150 active:scale-[0.98] shadow-lg shadow-[#4166F5]/15 text-center"
              >
                Try for Free
                <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* COMPREHENSIVE DIRECTORY LINK TILES */}
        <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-8">
          {/* Changed grid columns structure to display properly across screen widths */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-6 lg:gap-12 mb-16">

            {/* Main Brand Description Area */}
            <div className="col-span-2 flex flex-col justify-start">
              <span className="font-['Manrope'] font-bold text-[24px] text-[#1E293B] tracking-tight">
                Web3Nova
              </span>
              <p className="text-[14px] text-[#64748B] leading-[1.6] mt-4 pr-4">
                The enterprise-grade Automation agent platform. Elevate your support arrays and order processing systems right through standard WhatsApp channels.
              </p>
            </div>

            {/* Column Header Blocks - Fixed text widths to prevent squishing */}
            <div>
              <h4 className="font-['Manrope'] font-bold text-[14px] text-[#0F172A] uppercase tracking-wider mb-5">
                Product
              </h4>
              <ul className="space-y-3">
                {['Features', 'Integrations', 'Pricing', 'Automations'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[14px] text-[#64748B] hover:text-[#4166F5] font-medium transition-colors duration-150 block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-['Manrope'] font-bold text-[14px] text-[#0F172A] uppercase tracking-wider mb-5">
                Solutions
              </h4>
              <ul className="space-y-3">
                {['E-Commerce', 'Customer Care', 'Enterprise API'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[14px] text-[#64748B] hover:text-[#4166F5] font-medium transition-colors duration-150 block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-['Manrope'] font-bold text-[14px] text-[#0F172A] uppercase tracking-wider mb-5">
                Resources
              </h4>
              <ul className="space-y-3">
                {['Documentation', 'Guides', 'API Status'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[14px] text-[#64748B] hover:text-[#4166F5] font-medium transition-colors duration-150 block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-['Manrope'] font-bold text-[14px] text-[#0F172A] uppercase tracking-wider mb-5">
                Company
              </h4>
              <ul className="space-y-3">
                {['About Us', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[14px] text-[#64748B] hover:text-[#4166F5] font-medium transition-colors duration-150 block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* LOWER STRIP META GRID */}
          <div className="border-t border-[#F1F5F9] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[14px] text-[#94A3B8]">
            <p className="text-center md:text-left">
              &copy; {new Date().getFullYear()} Web3Nova Platform Inc. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-[#4166F5] font-medium transition-colors duration-150">Privacy Policy</a>
              <a href="#" className="hover:text-[#4166F5] transition-colors duration-150">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
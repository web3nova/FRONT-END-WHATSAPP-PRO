import React, { useState } from 'react';

// FAQ Data tailored to Web3Nova's WhatsApp Automation & Ordering platform
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
        <div className="w-full">

            {/* ================= 🟦 FAQ SECTION (ULTRAMARINE BLUE BACKGROUND) ================= */}
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
                                            ? 'bg-white border-transparent shadow-xl scale-[1.01]'
                                            : 'bg-transparent border-white/20 hover:border-white/40'
                                        }`}
                                >
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none"
                                    >
                                        <span className={`font-['Manrope'] font-semibold text-[18px] md:text-[20px] leading-[1.4] transition-colors duration-200 ${isOpen ? 'text-[#1E293B]' : 'text-white'
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
                                        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-48 border-t border-[#F1F5F9]' : 'max-h-0'
                                            }`}
                                    >
                                        <p className="font-['Inter'] font-normal text-[15px] md:text-[16px] text-[#4166F5] leading-[1.6] p-5 md:p-6 bg-white">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ================= ⬜ PROFESSIONAL UPGRADED FOOTER ================= */}
            <footer className="w-full bg-white text-[#1E293B] font-['Inter'] selection:bg-[#4166F5]/10">

                {/* 🚀 PREMIUM CONVERSION BANNER GRID */}
                <div className="border-b border-[#E2E8F0]">
                    <div className="max-w-[1200px] mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h3 className="font-['Manrope'] font-bold text-[22px] md:text-[26px] text-[#1E293B] tracking-tight">
                                Ready to automate your operations?
                            </h3>
                            <p className="text-[14px] md:text-[16px] text-[#64748B] mt-1">
                                Join scaling businesses accelerating client relationships using Web3Nova.
                            </p>
                        </div>
                        <div>
                            <a
                                href="#try-free"
                                className="inline-flex items-center justify-center px-6 py-3.5 bg-[#4166F5] hover:bg-[#2F51D8] text-white font-['Manrope'] font-semibold text-[15px] rounded-lg shadow-lg shadow-[#4166F5]/20 transition-all duration-150 active:scale-[0.98]"
                            >
                                Try for Free
                                <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* MAIN NAVIGATION DIRECTORY */}
                <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-8">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-12 mb-16">

                        {/* Branding Block */}
                        <div className="col-span-2">
                            <span className="font-['Manrope'] font-bold text-[24px] text-[#1E293B] tracking-tight">
                                Web3Nova
                            </span>
                            <p className="text-[14px] text-[#64748B] leading-[1.6] mt-4 max-w-xs">
                                The enterprise-grade Automation agent platform. Elevate your support arrays and order processing systems right through standard WhatsApp communication channels.
                            </p>

                            {/* Added Premium Social Indicator Badges */}
                            <div className="flex space-x-4 mt-6">
                                {['twitter', 'linkedin', 'github'].map((platform) => (
                                    <a key={platform} href={`#${platform}`} className="w-8 h-8 rounded-md border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#4166F5] hover:border-[#4166F5] transition-all duration-150">
                                        <span className="capitalize text-[12px] font-semibold">{platform[0]}</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Links Column 1 */}
                        <div>
                            <h4 className="font-['Manrope'] font-bold text-[14px] text-[#0F172A] uppercase tracking-wider mb-5">
                                Product
                            </h4>
                            <ul className="space-y-3.5">
                                {['Features', 'Integrations', 'Pricing', 'Automations', 'Releases'].map((item) => (
                                    <li key={item}>
                                        <a href={`#${item.toLowerCase()}`} className="text-[14px] text-[#64748B] hover:text-[#4166F5] font-medium transition-colors duration-150">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Links Column 2 */}
                        <div>
                            <h4 className="font-['Manrope'] font-bold text-[14px] text-[#0F172A] uppercase tracking-wider mb-5">
                                Solutions
                            </h4>
                            <ul className="space-y-3.5">
                                {['E-Commerce', 'Customer Care', 'Enterprise API', 'SaaS Delivery'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-[14px] text-[#64748B] hover:text-[#4166F5] font-medium transition-colors duration-150">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Links Column 3 */}
                        <div>
                            <h4 className="font-['Manrope'] font-bold text-[14px] text-[#0F172A] uppercase tracking-wider mb-5">
                                Resources
                            </h4>
                            <ul className="space-y-3.5">
                                {['Documentation', 'Guides', 'API Status', 'Open Source'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-[14px] text-[#64748B] hover:text-[#4166F5] font-medium transition-colors duration-150">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Links Column 4 */}
                        <div>
                            <h4 className="font-['Manrope'] font-bold text-[14px] text-[#0F172A] uppercase tracking-wider mb-5">
                                Company
                            </h4>
                            <ul className="space-y-3.5">
                                {['About Us', 'Careers', 'Press Kit', 'Contact Support'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-[14px] text-[#64748B] hover:text-[#4166F5] font-medium transition-colors duration-150">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>

                    {/* LOWER META BASE */}
                    <div className="border-t border-[#F1F5F9] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[14px] text-[#94A3B8]">
                        <p>
                            &copy; {new Date().getFullYear()} Web3Nova Platform Inc. All rights reserved.
                        </p>
                        <div className="flex space-x-6">
                            <a href="#privacy" className="hover:text-[#4166F5] font-medium transition-colors">Privacy Policy</a>
                            <a href="#terms" className="hover:text-[#4166F5] font-medium transition-colors">Terms of Service</a>
                            <a href="#cookies" className="hover:text-[#4166F5] font-medium transition-colors">Security Context</a>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
}
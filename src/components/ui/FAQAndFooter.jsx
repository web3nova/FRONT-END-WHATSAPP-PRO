import Accordion_02 from "./ruixen-accordian02";

export default function FAQAndFooter() {
    return (
        <div className="w-full">

            {/* ================= ⬜ FAQ SECTION (LIGHT THEME ACCORDION) ================= */}
            <Accordion_02 />

            {/* ================= ⬜ PROFESSIONAL UPGRADED FOOTER ================= */}
            <footer className="w-full bg-white text-[#1E293B] font-['Inter'] selection:bg-[#4166F5]/10">

                {/* 🚀 PREMIUM CONVERSION BANNER GRID */}
                <div className="border-b border-[#E2E8F0]">
                    <div className="max-w-[1200px] mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h3 className="font-['Manrope'] font-semibold text-[20px] md:text-[22px] text-[#1E293B] tracking-tight leading-[1.4]">
                                Ready to automate your operations?
                            </h3>
                            <p className="text-[14px] text-[#64748B] mt-1 leading-[1.5] font-['Inter'] font-normal">
                                Join scaling businesses accelerating client relationships using Biz AI.
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
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#F8F4E8] text-[#4166F5] font-bold text-lg leading-none">B</div>
                                <span className="font-['Manrope'] font-bold text-[24px] text-[#1E293B] tracking-tight">
                                    BizAI
                                </span>
                            </div>
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
                            &copy; {new Date().getFullYear()} Biz AI Platform Inc. All rights reserved.
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

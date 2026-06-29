import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

export default function Accordion_02() {
  return (
    <section className="w-full bg-white text-slate-900 selection:bg-blue-600/20">
      <div className="w-full max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Left Column */}
          <div className="md:w-1/2">
            <h2 className="text-[24px] md:text-[28px] font-bold mb-4 font-['Manrope'] tracking-tight text-[#4166F5] leading-[1.3]">Have questions?</h2>
            <p className="text-slate-500 text-[16px] font-['Inter'] font-normal leading-[1.6]">
              We're here to help you understand how Biz AI can transform your business. If you still have
              doubts, feel free to{" "}
              <a href="#contact" className="underline hover:text-blue-600 transition-colors">
                reach out to our team
              </a>
              .
            </p>
          </div>

          {/* Right Column */}
          <div className="md:w-1/2 space-y-10 font-['Inter']">
            {/* General Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-500 mb-2">
                General
              </h3>
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="gen-1">
                  <AccordionTrigger className="text-[17px]">
                    How does Biz AI automate WhatsApp support?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 text-base leading-relaxed">
                    Biz AI uses an advanced AI assistant to instantly understand your customers' queries and trigger automated, human-like responses directly on WhatsApp. It handles everything from product FAQs to complex order inquiries without human intervention.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="gen-2">
                  <AccordionTrigger className="text-[17px]">
                    Can I manage orders directly through WhatsApp?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 text-base leading-relaxed">
                    Yes! Biz AI seamlessly integrates order management. When a customer places or requests an order via WhatsApp, it updates on your centralized dashboard in real-time, complete with seamless status tracking.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Billing Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-500 mb-2">
                Billing
              </h3>
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="bill-1">
                  <AccordionTrigger className="text-[17px]">
                    Are there any hidden messaging fees?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 text-base leading-relaxed">
                    No. Unlike other platforms that add extra costs per message, Biz AI provides transparent flat-rate pricing based on your chosen plan, ensuring complete control over your operational costs.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="bill-2">
                  <AccordionTrigger className="text-[17px]">
                    Can I upgrade my plan later?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 text-base leading-relaxed">
                    Absolutely! As your business and order volume grow, you can seamlessly upgrade your plan from your dashboard without any service interruption.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Technical Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-500 mb-2">
                Technical
              </h3>
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="tech-1">
                  <AccordionTrigger className="text-[17px]">
                    Do I need a special WhatsApp Business account?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 text-base leading-relaxed">
                    Biz AI works seamlessly with standard WhatsApp Business configurations. Our onboarding team will help you connect your number to our Visual Automation Builder smoothly.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tech-2">
                  <AccordionTrigger className="text-[17px]">
                    Does it integrate with other tools?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 text-base leading-relaxed">
                    Yes! Biz AI supports robust integrations via API, allowing you to seamlessly connect your WhatsApp operations with tools like Shopify, Salesforce, Zapier, and more.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

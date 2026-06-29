import React from 'react';
import CustomersTableCard from './CustomersTableCard';
import { Card } from './card';
import campaignImg from '../../assets/whatsapp_campaigns_ui.png';
import flowImg from '../../assets/whatsapp_automation_flow_ui.png';

export default function ManagementSection() {
  return (
    <section className="bg-transparent">
      <div className="bg-transparent py-24">
        <div className="mx-auto w-full max-w-5xl px-6">
          <div>
            <h2 className="text-[#4166F5] text-[24px] md:text-[28px] font-bold leading-[1.3] font-['Manrope']">Seamless Order & Customer Management</h2>
            <p className="text-gray-600 mb-12 mt-4 text-balance text-[16px] leading-[1.6] font-['Inter'] font-normal">
              Track and fulfill orders directly from your dashboard. Our WhatsApp integration ensures you never miss a sale, keeps your customers updated automatically, and organizes your workflow.
            </p>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#4166F5] shadow-[#4166F5]/20">
              <CustomersTableCard 
                title="Recent Orders" 
                subtitle="Latest transactions originating from your WhatsApp catalog"
              />
            </div>
          </div>

          <div className="border-gray-200 relative mt-16 grid gap-12 border-b pb-12 [--radius:1rem] md:grid-cols-2">
            <div>
              <h3 className="text-[#4166F5] text-[20px] md:text-[22px] font-semibold font-['Manrope'] leading-[1.4]">Broadcast Campaigns</h3>
              <p className="text-gray-600 my-4 text-[16px] leading-[1.6] font-['Inter'] font-normal">
                Send targeted promotions, newsletters, and special offers to your customers with a single click.
              </p>
              <Card className="aspect-[4/3] overflow-hidden border-[#4166F5] shadow-sm shadow-[#4166F5]/20 bg-white">
                <img 
                  src={campaignImg} 
                  alt="WhatsApp Broadcast Campaign UI" 
                  className="w-full h-full object-cover object-top border-t border-border/50 shadow-sm rounded-t-lg mt-6"
                />
              </Card>
            </div>
            <div>
              <h3 className="text-[#4166F5] text-[20px] md:text-[22px] font-semibold font-['Manrope'] leading-[1.4]">Visual Automation Builder</h3>
              <p className="text-gray-600 my-4 text-[16px] leading-[1.6] font-['Inter'] font-normal">
                Design custom chatbot flows effortlessly. Handle FAQs, gather order details, and seamlessly handoff to human agents.
              </p>
              <Card className="aspect-[4/3] overflow-hidden border-[#4166F5] shadow-sm shadow-[#4166F5]/20 bg-white">
                <img 
                  src={flowImg} 
                  alt="WhatsApp Visual Automation Builder UI" 
                  className="w-full h-full object-cover object-top border-t border-border/50 shadow-sm rounded-t-lg mt-6"
                />
              </Card>
            </div>
          </div>

          <blockquote className="before:bg-[#4166F5] relative mt-12 max-w-xl pl-6 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-full">
            <p className="text-gray-900 text-[16px] leading-[1.6] font-['Inter'] font-normal">
              "Biz AI transformed how we handle WhatsApp. The auto-generated order pages and instant broadcast features are exactly what we didn't know we needed. It's like an AI-native CRM for WhatsApp."
            </p>
            <footer className="mt-4 flex items-center gap-2">
              <cite className="font-semibold text-gray-900 font-inter not-italic">Chinedu Okafor</cite>
              <span aria-hidden className="bg-gray-300 w-1 h-1 rounded-full"></span>
              <span className="text-gray-500 font-['Inter'] text-[14px] leading-[1.5]">Store Owner</span>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

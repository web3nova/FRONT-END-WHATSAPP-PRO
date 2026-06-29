import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const plans = [
  {
    name: "STARTER",
    price: "15,000",
    yearlyPrice: "12,500",
    period: "per month",
    description: "Perfect for small businesses just getting started.",
    features: [
      "Up to 100 orders/month",
      "1 WhatsApp number",
      "Basic analytics",
      "Email support",
    ],
    buttonText: "Get started",
    isPopular: false,
  },
  {
    name: "GROWTH",
    price: "35,000",
    yearlyPrice: "29,000",
    period: "per month",
    description: "For growing teams managing higher order volumes.",
    features: [
      "Up to 1,000 orders/month",
      "3 WhatsApp numbers",
      "Advanced analytics",
      "Priority support",
      "Team members (up to 5)",
    ],
    buttonText: "Choose Growth",
    isPopular: true,
  },
  {
    name: "SCALE",
    price: "Custom",
    yearlyPrice: "Custom",
    period: "",
    description: "Enterprise-grade for high-volume operations.",
    features: [
      "Unlimited orders",
      "Unlimited WhatsApp numbers",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    buttonText: "Contact sales",
    isPopular: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="bg-transparent py-24 px-6 font-inter">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-left max-w-6xl mx-auto mb-16 pt-8 pl-8 md:pl-0"
        >
          <h2 className="text-[#4166F5] text-[24px] md:text-[28px] font-bold leading-[1.3] mb-4 font-['Manrope']">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 text-[16px] leading-[1.6] font-['Inter'] font-normal">
            Choose the plan that works for you.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto pb-16"
        >
          {plans.map((plan, i) => (
            <motion.div 
              key={i}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={cn(
                "relative rounded-3xl p-8 flex flex-col transition-shadow duration-300",
                plan.isPopular 
                  ? "bg-[#4166F5] text-white shadow-2xl shadow-blue-500/30 border-none scale-105 z-10" 
                  : "bg-white text-gray-900 border border-gray-200 shadow-sm hover:shadow-xl"
              )}
            >
              {plan.isPopular && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-4 left-0 right-0 mx-auto w-fit bg-gradient-to-r from-blue-300 to-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md"
                >
                  Most Popular
                </motion.div>
              )}
              
              <div className="mb-6">
                <h3 className={cn("text-sm font-bold tracking-widest uppercase mb-2", plan.isPopular ? "text-blue-200" : "text-gray-500")}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mt-4 h-16">
                  {plan.price !== "Custom" && <span className="text-2xl font-bold">₦</span>}
                  <AnimatePresence mode="wait">
                    <motion.span 
                      key={isYearly ? "yearly" : "monthly"}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="text-5xl font-extrabold tracking-tight font-manrope"
                    >
                      {isYearly && plan.price !== "Custom" ? plan.yearlyPrice : plan.price}
                    </motion.span>
                  </AnimatePresence>
                  {plan.period && (
                    <span className={cn("text-sm font-medium", plan.isPopular ? "text-blue-100" : "text-gray-500")}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={cn("mt-4 text-sm leading-relaxed", plan.isPopular ? "text-blue-100" : "text-gray-600")}>
                  {plan.description}
                </p>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <Check className={cn("size-5 shrink-0", plan.isPopular ? "text-blue-200" : "text-[#4166F5]")} />
                    <span className={cn("text-sm", plan.isPopular ? "text-blue-50" : "text-gray-700")}>
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

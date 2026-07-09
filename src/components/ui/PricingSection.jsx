import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchPlans } from '../../api/billingApi';

const FEATURE_PRESETS = {
  weekly: [
    'AI auto-replies to customer messages 24/7',
    '1 WhatsApp number',
    'Product catalog & order management',
    'Knowledge base (up to 5 documents)',
    'Basic sales analytics',
  ],
  monthly: [
    'AI auto-replies to customer messages 24/7',
    '1 WhatsApp number',
    'Custom AI persona, tone & language',
    'Knowledge base (up to 20 documents)',
    'Custom website & storefront builder',
    'Payment gateway integration',
    'Priority email support',
  ],
  quarterly: [
    'Everything in Monthly — save 20%',
    'AI auto-replies to customer messages 24/7',
    'Team members (up to 3)',
    'Advanced sales & conversation analytics',
    'Bulk order & quote management',
    'Payment gateway integration',
    'Priority support',
  ],
  yearly: [
    'Everything in Quarterly — save 33%',
    'AI auto-replies to customer messages 24/7',
    'Unlimited knowledge base documents',
    'Team members (up to 10)',
    'Dedicated onboarding & setup',
    'Priority support with fast response SLA',
  ],
};

const BILLING_LABELS = { 7: 'Billed weekly.', 30: 'Billed monthly.', 90: 'Billed every 3 months.', 365: 'Billed annually.' };
const PERIOD_LABELS = { 7: '/week', 30: '/month', 90: '/quarter', 365: '/year' };
const POPULAR_KEY = 'monthly';

function formatPrice(priceMinor, currency) {
  if (priceMinor === undefined || priceMinor === null) return null;
  const amount = priceMinor / 100;
  return `${currency === 'NGN' ? '₦' : currency + ' '}${amount.toLocaleString('en-NG')}`;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
};

export default function PricingSection() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetchPlans().then(setPlans).catch(() => {});
  }, []);

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

        {plans.length === 0 ? (
          <div className="text-center text-gray-400 py-12">Loading plans…</div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto pb-16"
          >
            {plans.map((plan, i) => {
              const key = (plan.name || '').toLowerCase();
              const isPopular = key === POPULAR_KEY;
              const features = FEATURE_PRESETS[key] || ['Includes core platform features'];
              const price = formatPrice(plan.price, plan.currency);
              const period = PERIOD_LABELS[plan.intervalDays] || '';
              const billing = BILLING_LABELS[plan.intervalDays] || '';

              return (
                <motion.div
                  key={plan.id || i}
                  variants={itemVariants}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className={cn(
                    'relative rounded-3xl p-7 flex flex-col transition-shadow duration-300',
                    isPopular
                      ? 'bg-[#4166F5] text-white shadow-2xl shadow-blue-500/30 border-none'
                      : 'bg-white text-gray-900 border border-gray-200 shadow-sm hover:shadow-xl'
                  )}
                >
                  {isPopular && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -top-4 left-0 right-0 mx-auto w-fit bg-gradient-to-r from-blue-300 to-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md"
                    >
                      Most Popular
                    </motion.div>
                  )}

                  <div className="mb-5">
                    <h3 className={cn('text-sm font-bold tracking-widest uppercase mb-3', isPopular ? 'text-blue-200' : 'text-gray-500')}>
                      {plan.name} Plan
                    </h3>
                    <div className="flex items-baseline gap-0.5 mt-2">
                      <span className="text-4xl font-extrabold tracking-tight font-manrope">{price ?? 'Custom'}</span>
                      {period && (
                        <span className={cn('text-sm font-medium ml-0.5', isPopular ? 'text-blue-100' : 'text-gray-500')}>
                          {period}
                        </span>
                      )}
                    </div>
                    {billing && (
                      <p className={cn('mt-2 text-xs leading-relaxed', isPopular ? 'text-blue-200' : 'text-gray-500')}>
                        {billing} Cancel anytime.
                      </p>
                    )}
                  </div>

                  <div className="flex-1 space-y-3 mb-7">
                    {features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <Check className={cn('size-4 shrink-0 mt-0.5', isPopular ? 'text-blue-200' : 'text-[#4166F5]')} />
                        <span className={cn('text-xs leading-snug', isPopular ? 'text-blue-50' : 'text-gray-700')}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/signup"
                    className={cn(
                      'mt-auto block text-center text-sm font-semibold py-3 px-4 rounded-xl transition-all duration-200',
                      isPopular
                        ? 'bg-white text-[#4166F5] hover:bg-blue-50'
                        : 'bg-[#4166F5] text-white hover:bg-blue-700'
                    )}
                  >
                    Choose {plan.name} Plan
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Check, Zap } from 'lucide-react'
import './Auth.css'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₦15,000',
    period: '/month',
    description: 'Perfect for small businesses just getting started.',
    features: [
      'Up to 100 orders/month',
      '1 WhatsApp number',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Get started',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '₦35,000',
    period: '/month',
    description: 'For growing teams managing higher order volumes.',
    features: [
      'Up to 1,000 orders/month',
      '3 WhatsApp numbers',
      'Advanced analytics',
      'Priority support',
      'Team members (up to 5)',
    ],
    cta: 'Choose Growth',
    highlighted: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 'Custom',
    period: '',
    description: 'Enterprise-grade for high-volume operations.',
    features: [
      'Unlimited orders',
      'Unlimited WhatsApp numbers',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    cta: 'Contact sales',
  },
]

export default function SubscribePage() {
  const { selectPlan } = useAuth()
  const navigate = useNavigate()

  const handleSelect = (planId) => {
    selectPlan(planId)
    navigate('/onboarding')
  }

  return (
    <div className="subscribe-page">

      <nav className="subscribe-nav">
        <div className="subscribe-logo">
          <div className="subscribe-logo-mark">
            <Zap size={16} />
          </div>
          <span>BizAI</span>
        </div>
      </nav>

      <header className="subscribe-header">
        <div className="subscribe-badge">
          Simple Pricing
        </div>

        <h1 className="auth-heading">
          Choose your plan
        </h1>

        <p className="auth-subheading">
          Start free for 14 days. No card required.
          Upgrade or cancel anytime.
        </p>
      </header>

      <section className="plan-grid">

        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={`plan-card ${
              plan.highlighted
                ? 'plan-card--featured'
                : ''
            }`}
          >

            {plan.highlighted && (
              <div className="plan-badge">
                Most Popular
              </div>
            )}

            <div className="plan-header">

              <h3 className="plan-name">
                {plan.name}
              </h3>

              <div className="plan-price">

                <span className="plan-amount">
                  {plan.price}
                </span>

                {plan.period && (
                  <span className="plan-period">
                    {plan.period}
                  </span>
                )}

              </div>

              <p className="plan-description">
                {plan.description}
              </p>

            </div>

            <ul className="plan-features">

              {plan.features.map((feature) => (
                <li key={feature}>

                  <Check
                    size={16}
                    className="plan-check"
                  />

                  <span>
                    {feature}
                  </span>

                </li>
              ))}

            </ul>

            <button
              type="button"
              onClick={() => handleSelect(plan.id)}
              className={
                plan.highlighted
                  ? 'auth-btn-primary'
                  : 'auth-btn-secondary'
              }
            >
              {plan.cta}
            </button>

          </article>
        ))}

      </section>

    </div>
  )
}
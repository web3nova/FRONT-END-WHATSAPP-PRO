import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
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
    cta: 'Start with Starter',
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
    // TODO: integrate with Paystack / Flutterwave before navigating
    selectPlan(planId)
    navigate('/onboarding')
  }

  return (
    <div className="auth-page subscribe-page">
      {/* Progress breadcrumb */}
      <div className="subscribe-breadcrumb">
        <span className="subscribe-breadcrumb__step subscribe-breadcrumb__step--done">✓ Account created</span>
        <span className="subscribe-breadcrumb__line" />
        <span className="subscribe-breadcrumb__step subscribe-breadcrumb__step--done">✓ Signed in</span>
        <span className="subscribe-breadcrumb__line" />
        <span className="subscribe-breadcrumb__step subscribe-breadcrumb__step--active">3. Choose plan</span>
      </div>

      <div className="subscribe-header">
        <h1 className="auth-heading">Choose your plan</h1>
        <p className="auth-subheading">
          Start free for 14 days, no card required. Upgrade or cancel anytime.
        </p>
      </div>

      <div className="plan-grid">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.highlighted ? 'plan-card--featured' : ''}`}
          >
            {plan.highlighted && (
              <span className="plan-badge">Most popular</span>
            )}
            <h2 className="plan-name">{plan.name}</h2>
            <div className="plan-price">
              <span className="plan-amount">{plan.price}</span>
              <span className="plan-period">{plan.period}</span>
            </div>
            <p className="plan-description">{plan.description}</p>
            <ul className="plan-features">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button
              className={plan.highlighted ? 'auth-btn-primary' : 'auth-btn-secondary'}
              onClick={() => handleSelect(plan.id)}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
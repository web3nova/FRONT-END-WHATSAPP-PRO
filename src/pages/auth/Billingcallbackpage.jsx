import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

export default function SubscribePage() {
  const navigate = useNavigate()
  const { selectPlan } = useAuth()

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '₦5,000',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        '5 Projects',
        'Basic analytics',
        'Email support'
      ]
    },

    {
      id: 'pro',
      name: 'Pro',
      price: '₦15,000',
      period: '/month',
      description: 'Best for active users',
      features: [
        'Unlimited projects',
        'Priority support',
        'Advanced analytics'
      ],
      featured: true
    },

    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '₦30,000',
      period: '/month',
      description: 'Built for teams and companies',
      features: [
        'Dedicated support',
        'API access',
        'Custom integrations'
      ]
    },

    {
      id: 'custom',
      name: 'Custom',
      price: 'Custom',
      period: '',
      description: 'Create a plan tailored to your needs',
      features: [
        'Choose your own features',
        'Flexible pricing',
        'Custom integrations',
        'Dedicated support'
      ]
    }
  ]

  const handlePlanSelect = (plan) => {
    if (plan.id === 'custom') {
      navigate('/custom-plan')
      return
    }

    sessionStorage.setItem(
      'pendingPlanId',
      plan.id
    )

    selectPlan(plan.id)
  }

  return (
    <div className="subscribe-page">

      <nav className="subscribe-nav">
        <div className="subscribe-logo">

          <div className="subscribe-logo-mark">
            S
          </div>

          SkillSync

        </div>
      </nav>

      <header className="subscribe-header">

        <div className="subscribe-badge">
          Pricing Plans
        </div>

        <h1 className="auth-heading">
          Choose your subscription
        </h1>

        <p className="auth-subheading">
          Select the plan that works best for you.
        </p>

      </header>

      <div className="plan-grid">

        {plans.map((plan) => (

          <div
            key={plan.id}
            className={`plan-card ${
              plan.featured
                ? 'plan-card--featured'
                : ''
            }`}
          >

            {plan.featured && (
              <div className="plan-badge">
                MOST POPULAR
              </div>
            )}

            <h2 className="plan-name">
              {plan.name}
            </h2>

            <div className="plan-price">

              <span className="plan-amount">
                {plan.price}
              </span>

              <span className="plan-period">
                {plan.period}
              </span>

            </div>

            <p className="plan-description">
              {plan.description}
            </p>

            <ul className="plan-features">

              {plan.features.map((feature,index)=>(
                <li key={index}>

                  <Check
                    size={18}
                    className="plan-check"
                  />

                  {feature}

                </li>
              ))}

            </ul>

            <button
              className="auth-btn-primary"
              onClick={() =>
                handlePlanSelect(plan)
              }
            >
              {plan.id === 'custom'
                ? 'Customize Plan'
                : 'Choose Plan'}
            </button>

          </div>

        ))}

      </div>

    </div>
  )
}
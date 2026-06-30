import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Check, Zap, Loader2 } from 'lucide-react'
import { fetchPlans, initializePayment } from '../../api/billingApi'
import './Auth.css'

// Best-effort feature copy per plan name. If the backend gains a
// `features` field on each plan, this preset map can be removed.
const FEATURE_PRESETS = {
  weekly: [
    'Up to 100 orders/week',
    '1 WhatsApp number',
    'Basic analytics',
    'Email support',
  ],
  monthly: [
    'Up to 1,000 orders/month',
    '3 WhatsApp numbers',
    'Advanced analytics',
    'Priority support',
    'Team members (up to 5)',
  ],
  quarterly: [
    'Up to 3,500 orders/quarter',
    '3 WhatsApp numbers',
    'Advanced analytics',
    'Priority support',
    'Team members (up to 5)',
  ],
  yearly: [
    'Unlimited orders',
    'Unlimited WhatsApp numbers',
    'Custom integrations',
    'Dedicated account manager',
    'SLA guarantee',
  ],
}

const formatPrice = (priceMinor, currency) => {
  if (priceMinor === undefined || priceMinor === null) return 'Custom'
  const amount = priceMinor / 100
  const symbol = currency === 'NGN' ? '₦' : `${currency} `
  return `${symbol}${amount.toLocaleString('en-NG')}`
}

const formatPeriod = (intervalDays) => {
  switch (intervalDays) {
    case 7:
      return '/week'
    case 30:
      return '/month'
    case 90:
      return '/quarter'
    case 365:
      return '/year'
    default:
      return intervalDays ? `/${intervalDays} days` : ''
  }
}

const FREE_TRIAL_DAYS = 14

export default function SubscribePage() {
  const { startFreeTrial } = useAuth()
  const navigate = useNavigate()

  const [plans, setPlans] = useState([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectingId, setSelectingId] = useState(null)
  const [selectError, setSelectError] = useState('')
  const [startingTrial, setStartingTrial] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadPlans = async () => {
      setLoadingPlans(true)
      setLoadError('')
      try {
        const data = await fetchPlans()
        if (!cancelled) {
          setPlans(data.filter((p) => p.isActive !== false))
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message || 'Could not load plans. Please refresh.')
        }
      } finally {
        if (!cancelled) setLoadingPlans(false)
      }
    }

    loadPlans()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSelectPlan = async (plan) => {
    setSelectError('')
    setSelectingId(plan.id)

    try {
      // Stash which plan this checkout was for, so the callback page
      // (which has no way to ask the backend "what did they pay for"
      // without a status endpoint) knows what to mark active once the
      // user lands back from Monnify. Set BEFORE the redirect, not after
      // — we never get a chance to run code "after" window.location.href.
      sessionStorage.setItem('pendingPlanId', plan.id)

      const { checkoutUrl } = await initializePayment(plan.id)

      if (checkoutUrl) {
        window.location.href = checkoutUrl
        return
      }

      sessionStorage.removeItem('pendingPlanId')
      setSelectError('Checkout could not be started. Please try again.')
    } catch (err) {
      sessionStorage.removeItem('pendingPlanId')
      setSelectError(err.message || 'Could not start checkout. Please try again.')
    } finally {
      setSelectingId(null)
    }
  }

  const handleFreeTrial = async () => {
    setSelectError('')
    setStartingTrial(true)

    try {
      // startFreeTrial should be implemented in AuthContext to mark the
      // tenant as on a trial (locally and/or via a backend call), entirely
      // separate from the billing/initialize (paid) flow.
      if (typeof startFreeTrial === 'function') {
        await startFreeTrial()
      }
      navigate('/onboarding')
    } catch (err) {
      setSelectError(err.message || 'Could not start your free trial. Please try again.')
    } finally {
      setStartingTrial(false)
    }
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
          Try free for {FREE_TRIAL_DAYS} days, or subscribe now.
          Upgrade or cancel anytime.
        </p>
      </header>

      <div className="trial-banner">
        <div className="trial-banner__copy">
          <strong>Not ready to commit?</strong>
          <span>Start a {FREE_TRIAL_DAYS}-day free trial — no card required.</span>
        </div>
        <button
          type="button"
          onClick={handleFreeTrial}
          disabled={startingTrial}
          className="auth-btn-secondary"
        >
          {startingTrial ? 'Starting trial…' : 'Start free trial'}
        </button>
      </div>

      {selectError && (
        <div className="auth-error" role="alert" style={{ maxWidth: 480, margin: '0 auto 24px' }}>
          {selectError}
        </div>
      )}

      {loadingPlans && (
        <div className="subscribe-loading">
          <Loader2 className="auth-spinner" size={24} />
          <span>Loading plans…</span>
        </div>
      )}

      {!loadingPlans && loadError && (
        <div className="auth-error" role="alert" style={{ maxWidth: 480, margin: '0 auto' }}>
          {loadError}
        </div>
      )}

      {!loadingPlans && !loadError && (
        <section className="plan-grid">

          {plans.map((plan) => {
            const key = (plan.name || '').toLowerCase()
            const features = FEATURE_PRESETS[key] || [
              'Includes core platform features',
              'WhatsApp business integration',
              'Standard support',
            ]
            // Highlight the monthly plan — the most common default choice
            const highlighted = key === 'monthly'

            return (
              <article
                key={plan.id}
                className={`plan-card ${highlighted ? 'plan-card--featured' : ''}`}
              >

                {highlighted && (
                  <div className="plan-badge">
                    Most Popular
                  </div>
                )}

                <div className="plan-header">

                  <h3 className="plan-name">
                    {plan.label || plan.name}
                  </h3>

                  <div className="plan-price">

                    <span className="plan-amount">
                      {formatPrice(plan.priceMinor, plan.currency)}
                    </span>

                    {formatPeriod(plan.intervalDays) && (
                      <span className="plan-period">
                        {formatPeriod(plan.intervalDays)}
                      </span>
                    )}

                  </div>

                  <p className="plan-description">
                    Billed every {plan.intervalDays} days.
                  </p>

                </div>

                <ul className="plan-features">

                  {features.map((feature) => (
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
                  onClick={() => handleSelectPlan(plan)}
                  disabled={selectingId === plan.id}
                  className={highlighted ? 'auth-btn-primary' : 'auth-btn-secondary'}
                >
                  {selectingId === plan.id ? 'Redirecting…' : `Choose ${plan.label || plan.name}`}
                </button>

              </article>
            )
          })}

        </section>
      )}

    </div>
  )
}
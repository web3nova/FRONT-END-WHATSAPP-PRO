import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Check, Loader2 } from 'lucide-react'
import { fetchPlans, initializePayment } from '../../api/billingApi'
import { ttTrack } from '../../lib/tiktok'
import BizBackground from '../../components/BizBackground'
import './Auth.css'

// Best-effort feature copy per plan name. If the backend gains a
// `features` field on each plan, this preset map can be removed.
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

function clearPendingPlan() {
  sessionStorage.removeItem('pendingPlanId')
  sessionStorage.removeItem('pendingPlanPriceMinor')
  sessionStorage.removeItem('pendingPlanCurrency')
  sessionStorage.removeItem('pendingPlanName')
}

export default function SubscribePage() {
  const { startFreeTrial, subscription } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const upgradeMode = searchParams.get('upgrade') === '1'
  const trialAlreadyUsed = subscription?.hasUsedTrial === true

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
      // Stash price details too, so the callback page can attach
      // value/currency to the TikTok CompletePayment event.
      sessionStorage.setItem('pendingPlanPriceMinor', String(plan.priceMinor ?? ''))
      sessionStorage.setItem('pendingPlanCurrency', plan.currency || 'NGN')
      sessionStorage.setItem('pendingPlanName', plan.label || plan.name || '')

      const { checkoutUrl } = await initializePayment(plan.id)

      if (checkoutUrl) {
        ttTrack('PlaceAnOrder', {
          content_type: 'product',
          contents: [{ content_id: plan.id, content_name: plan.label || plan.name || 'plan' }],
          value: (plan.priceMinor ?? 0) / 100,
          currency: plan.currency || 'NGN',
        })
        // Give the pixel a beat to flush the event before leaving the page —
        // an instant redirect can drop the request.
        setTimeout(() => { window.location.href = checkoutUrl }, 400)
        return
      }

      clearPendingPlan()
      setSelectError('Checkout could not be started. Please try again.')
    } catch (err) {
      clearPendingPlan()
      setSelectError(err.message || 'Could not start checkout. Please try again.')
    } finally {
      setSelectingId(null)
    }
  }

  const handleFreeTrial = async () => {
    setSelectError('')
    setStartingTrial(true)

    try {
      const sub = typeof startFreeTrial === 'function' ? await startFreeTrial() : null
      if (sub?.isActive) {
        ttTrack('StartTrial')
        navigate('/dashboard')
      } else {
        setSelectError('Your trial could not be confirmed. Please refresh and try again.')
      }
    } catch (err) {
      setSelectError(err.message || 'Could not start your free trial. Please try again.')
    } finally {
      setStartingTrial(false)
    }
  }

  return (
    <div className="app-bg">
      <BizBackground variant="light" />
      <div className="content-layer">
        <div className="subscribe-page-wrapper">
          <div className="subscribe-page">

            <nav className="subscribe-nav">
              <div className="subscribe-logo">
                <img src="/BizIq8.png" alt="BizIQ" className="subscribe-logo-img" />
              </div>
            </nav>

            <header className="subscribe-header">
              <div className="subscribe-badge">
                {upgradeMode ? 'Upgrade Your Plan' : 'Simple Pricing'}
              </div>

              <h1 className="auth-heading">
                {upgradeMode ? 'Upgrade to a paid plan' : 'Choose your plan'}
              </h1>

              <p className="auth-subheading">
                {upgradeMode
                  ? 'Unlock unlimited AI messages, multiple WhatsApp numbers, and priority support.'
                  : trialAlreadyUsed
                  ? 'Subscribe to a plan to continue using BizIQ.'
                  : `Try free for ${FREE_TRIAL_DAYS} days, or subscribe now. Upgrade or cancel anytime.`}
              </p>
            </header>

            {!upgradeMode && !trialAlreadyUsed && (
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
            )}

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
                          {plan.intervalDays === 7 ? 'Billed weekly. Cancel anytime.' :
                           plan.intervalDays === 30 ? 'Billed monthly. Cancel anytime.' :
                           plan.intervalDays === 90 ? 'Billed every 3 months. Save vs monthly.' :
                           plan.intervalDays === 365 ? 'Billed annually. Best value.' :
                           `Billed every ${plan.intervalDays} days.`}
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
        </div>
      </div>
    </div>
  )
}
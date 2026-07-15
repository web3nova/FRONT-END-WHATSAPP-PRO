import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react'
import { fetchSubscription } from '../../api/billingApi'
import { ttTrack } from '../../lib/tiktok'
import BizBackground from '../../components/BizBackground'
import './Auth.css'

// Monnify redirects the browser here after checkout (see redirectUrl in
// billing.service.js initializePayment). Subscription activation itself is
// driven server-side by Monnify's webhook (reliable, async) — this page's
// only job is to poll until that webhook has landed and show the result.
// Some payments confirm in under a second; a slow one can take longer, so we
// poll for up to ~20s before telling the user to check back shortly.

const POLL_INTERVAL_MS = 2000
const MAX_POLLS = 10

export default function BillingCallbackPage() {
  const navigate = useNavigate()
  const [state, setState] = useState('checking') // 'checking' | 'success' | 'pending' | 'error'
  const attemptsRef = useRef(0)

  useEffect(() => {
    let cancelled = false

    async function poll() {
      attemptsRef.current += 1
      try {
        const sub = await fetchSubscription()
        if (cancelled) return

        if (sub?.isActive && sub?.status === 'ACTIVE') {
          setState('success')

          // Fire TikTok CompletePayment exactly once per checkout: the
          // pending* keys are set on the subscribe page and cleared here,
          // so a refresh of this page can't double-count the conversion.
          if (sessionStorage.getItem('pendingPaymentReference')) {
            const priceMinor = Number(sessionStorage.getItem('pendingPlanPriceMinor'))
            ttTrack('CompletePayment', {
              content_type: 'product',
              contents: [{
                content_id: sessionStorage.getItem('pendingPlanId') || 'subscription',
                content_name: sessionStorage.getItem('pendingPlanName') || 'BizIQ subscription',
              }],
              ...(Number.isFinite(priceMinor) && priceMinor > 0
                ? { value: priceMinor / 100, currency: sessionStorage.getItem('pendingPlanCurrency') || 'NGN' }
                : {}),
            })
          }

          sessionStorage.removeItem('pendingPaymentReference')
          sessionStorage.removeItem('pendingPlanId')
          sessionStorage.removeItem('pendingPlanPriceMinor')
          sessionStorage.removeItem('pendingPlanCurrency')
          sessionStorage.removeItem('pendingPlanName')
          return
        }

        if (attemptsRef.current >= MAX_POLLS) {
          setState('pending')
          return
        }

        setTimeout(poll, POLL_INTERVAL_MS)
      } catch {
        if (!cancelled) setState('error')
      }
    }

    poll()
    return () => { cancelled = true }
  }, [])

  const copy = {
    checking: {
      icon: <Loader2 className="auth-spinner" size={40} style={{ color: '#4166F5', margin: '0 auto 16px' }} />,
      title: 'Confirming your payment…',
      body: "This usually takes a few seconds. Please don't close this page.",
      showButton: false,
    },
    success: {
      icon: <CheckCircle2 size={44} style={{ color: '#16a34a', margin: '0 auto 16px' }} />,
      title: 'Payment successful!',
      body: 'Your subscription is now active. Welcome aboard.',
      showButton: true,
    },
    pending: {
      icon: <Loader2 size={40} style={{ color: '#d97706', margin: '0 auto 16px' }} />,
      title: 'Still processing',
      body: 'Your payment is being confirmed — this can occasionally take a few minutes. Check your dashboard shortly, or contact support if this persists.',
      showButton: true,
    },
    error: {
      icon: <AlertTriangle size={40} style={{ color: '#dc2626', margin: '0 auto 16px' }} />,
      title: "Couldn't confirm payment status",
      body: "We couldn't check your subscription status right now. If you completed payment, it will be applied shortly — check your dashboard or contact support.",
      showButton: true,
    },
  }[state]

  return (
    <div className="app-bg">
      <BizBackground variant="light" />
      <div className="content-layer">
        <div className="subscribe-page-wrapper">
          <div className="subscribe-page" style={{ textAlign: 'center', maxWidth: 440, margin: '80px auto' }}>
            {copy.icon}
            <h1 className="auth-heading">{copy.title}</h1>
            <p className="auth-subheading" style={{ marginBottom: 24 }}>{copy.body}</p>
            {copy.showButton && (
              <button type="button" onClick={() => navigate('/dashboard')} className="auth-btn-secondary">
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

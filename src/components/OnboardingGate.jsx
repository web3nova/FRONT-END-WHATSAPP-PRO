// src/components/OnboardingGate.jsx
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import onboardingApi from '../services/onboardingService'

// Fields that only get populated once the user has actually completed the
// *business profile* wizard (as opposed to the onboarding wizard, whose
// completion is tracked separately via `allPanelsDone`).
//
// cacNumber / tin are deliberately left out — in the sample response they
// were empty ("") while everything else here was filled in, which suggests
// they're optional and shouldn't block someone from being considered "done".
//
// If the backend ever exposes an explicit `profileCompleted` boolean, swap
// this heuristic out for that — it'll be far more reliable than field-sniffing.
const REQUIRED_PROFILE_FIELDS = [
  'deliveryStructure',
  'staffCount',
  'monthlyRevenue',
  'openingTime',
  'closingTime',
]

function isProfileComplete(business) {
  if (!business) return false

  const fieldsFilled = REQUIRED_PROFILE_FIELDS.every((key) => {
    const value = business[key]
    return value !== null && value !== undefined && value !== ''
  })

  const hasAvailableDays =
    Array.isArray(business.availableDays) && business.availableDays.length > 0

  return fieldsFilled && hasAvailableDays
}

export default function OnboardingGate({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const onboarding = await onboardingApi.checkStatus() // GET /api/v1/onboarding

        let business = null
        try {
          business = await onboardingApi.getProfile() // GET /api/v1/business
        } catch {
          business = null // no business profile saved yet
        }

        if (cancelled) return

        const onboardingDone = onboarding?.completed === true
        const profileDone = isProfileComplete(business)

        let target
        if (onboardingDone && profileDone) {
          // Both done - never let them land back on either setup page.
          target = '/dashboard'
        } else if (onboardingDone && !profileDone) {
          target = '/business-profile'
        } else if (!onboardingDone && profileDone) {
          target = '/onboarding'
        } else {
          // Neither done - start of the flow.
          target = '/onboarding'
        }

        if (target !== location.pathname) {
          navigate(target, { replace: true })
        } else {
          setChecking(false)
        }
      } catch {
        if (!cancelled) setChecking(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (checking) {
    return (
      <div className="app-bg">
        <div className="content-layer">
          <div className="ob-loading-screen">
            <div className="ob-loading-card">
              <p className="ob-loading-heading">Setting things up</p>
              <p className="ob-loading-sub">Checking your account status…</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return children
}
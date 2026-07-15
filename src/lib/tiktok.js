// TikTok Pixel helpers. The base pixel (ttq) is loaded in index.html;
// these wrappers no-op safely when the script is blocked (ad blockers)
// or hasn't loaded yet, so tracking can never break app flows.

/**
 * Fire a TikTok Pixel event.
 * Standard events used in this app:
 *   CompleteRegistration — successful signup
 *   PlaceAnOrder         — plan checkout initiated
 *   CompletePayment      — subscription payment confirmed
 *   Contact              — WhatsApp "Contact Us" click
 */
export function ttTrack(event, params = {}) {
  try {
    window.ttq?.track(event, params)
  } catch {
    /* never let analytics break the app */
  }
}

/**
 * Advanced matching — pass plaintext email/phone; the TikTok SDK
 * hashes (SHA-256) PII before sending. Improves attribution and
 * enables the email/phone postback.
 */
export function ttIdentify({ email, phone, externalId } = {}) {
  try {
    const payload = {}
    if (email) payload.email = email
    if (phone) payload.phone_number = phone
    if (externalId) payload.external_id = String(externalId)
    if (Object.keys(payload).length > 0) window.ttq?.identify(payload)
  } catch {
    /* never let analytics break the app */
  }
}

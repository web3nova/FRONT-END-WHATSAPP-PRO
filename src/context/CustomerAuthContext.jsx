import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { API_BASE } from '../lib/apiConfig'

const CustomerAuthContext = createContext(null)

// Per-store storage keys. Storefronts served on the shared platform origin
// (/b/:slug, /storefront/:tenantId) would otherwise all read one global
// localStorage slot, so a login on one store bled into every other store in the
// same browser. Namespacing the session by the store in the URL gives each
// store its own independent session; a customer can be signed into several of
// our stores at once with none bleeding into another. Custom domains are
// already origin-isolated by the browser, so they fall back to a single slot.
function tokenKey(storeKey) { return `customer_token:${storeKey}` }
function dataKey(storeKey) { return `customer_data:${storeKey}` }

function writeToken(storeKey, token) {
  if (token) localStorage.setItem(tokenKey(storeKey), token)
  else localStorage.removeItem(tokenKey(storeKey))
}

function readToken(storeKey) {
  return localStorage.getItem(tokenKey(storeKey))
}

function writeCustomer(storeKey, c) {
  if (c) localStorage.setItem(dataKey(storeKey), JSON.stringify(c))
  else localStorage.removeItem(dataKey(storeKey))
}

function readCustomer(storeKey) {
  try {
    const raw = localStorage.getItem(dataKey(storeKey))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

// One-time cleanup of the legacy un-scoped keys that caused the cross-store
// bleed. Removing them logs a customer out once; they re-authenticate into the
// now correctly-scoped slot.
function purgeLegacyKeys() {
  localStorage.removeItem('customer_token')
  localStorage.removeItem('customer_data')
}

export function CustomerAuthProvider({ children }) {
  const params = useParams()
  // The store the current storefront URL points at. On a custom domain neither
  // param is present, but localStorage is already origin-isolated there, so a
  // single 'default' slot per domain is correct.
  const storeKey = params.tenantId || params.slug || 'default'

  const [customer, setCustomer] = useState(() => readCustomer(storeKey))
  const [token, setToken] = useState(() => readToken(storeKey))

  const logout = useCallback(() => {
    setCustomer(null)
    setToken(null)
    writeToken(storeKey, null)
    writeCustomer(storeKey, null)
  }, [storeKey])

  // Persist an authenticated session into THIS store's slot and update state.
  // Shared by the password flows here and the Google/passkey flows in AuthModal.
  const saveSession = useCallback((newToken, newCustomer) => {
    writeToken(storeKey, newToken)
    writeCustomer(storeKey, newCustomer)
    setToken(newToken)
    setCustomer(newCustomer)
  }, [storeKey])

  const login = useCallback(async (tenantId, phone, email, password) => {
    const res = await fetch(`${API_BASE}/customer-auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, phone, email: email || null, password }),
    })
    const body = await res.json()
    if (!res.ok) throw new Error(body?.message || 'Login failed')
    const data = body?.data ?? body
    saveSession(data.token, data.customer)
    return data
  }, [saveSession])

  const signup = useCallback(async (tenantId, name, phone, email, password) => {
    const res = await fetch(`${API_BASE}/customer-auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, name, phone, email: email || null, password }),
    })
    const body = await res.json()
    if (!res.ok) throw new Error(body?.message || 'Signup failed')
    const data = body?.data ?? body
    saveSession(data.token, data.customer)
    return data
  }, [saveSession])

  const fetchProfile = useCallback(async (tk) => {
    const authToken = tk || token
    if (!authToken) return null
    const res = await fetch(`${API_BASE}/customer-auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    if (!res.ok) { logout(); return null }
    const body = await res.json()
    const data = body?.data ?? body
    writeCustomer(storeKey, data)
    setCustomer(data)
    return data
  }, [token, logout, storeKey])

  const googleLogin = useCallback(async () => {
    const popup = window.open(
      `${API_BASE}/customer-auth/google`,
      'googleLogin',
      'width=500,height=600,left=200,top=200'
    )
    return new Promise((resolve, reject) => {
      const handleMessage = async (event) => {
        if (event.origin !== window.location.origin) return
        try {
          if (event.data.type === 'GOOGLE_LOGIN_SUCCESS') {
            const data = event.data
            saveSession(data.token, data.customer)
            resolve(data)
          } else if (event.data.type === 'GOOGLE_LOGIN_ERROR') {
            reject(new Error(event.data.error || 'Google login failed'))
          }
        } catch (err) {
          reject(err)
        } finally {
          window.removeEventListener('message', handleMessage)
          popup?.close()
        }
      }
      window.addEventListener('message', handleMessage)
    })
  }, [saveSession])

  // Re-sync the session to the current store. Runs on mount and whenever the URL
  // switches to a different store (the provider is reused across /b/:slug param
  // changes without remounting, so useState initializers alone wouldn't update).
  useEffect(() => {
    purgeLegacyKeys()
    const t = readToken(storeKey)
    setToken(t)
    setCustomer(readCustomer(storeKey))
    if (t) fetchProfile(t)
  }, [storeKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CustomerAuthContext.Provider value={{ customer, token, storeKey, login, signup, googleLogin, saveSession, logout, fetchProfile }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) return { customer: null, token: null, storeKey: 'default', login: async () => { throw new Error('Auth not available') }, signup: async () => { throw new Error('Auth not available') }, googleLogin: async () => { throw new Error('Auth not available') }, saveSession: () => {}, logout: () => {}, fetchProfile: async () => null }
  return ctx
}

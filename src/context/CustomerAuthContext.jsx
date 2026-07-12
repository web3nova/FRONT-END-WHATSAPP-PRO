import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { API_BASE } from '../lib/apiConfig'

const CustomerAuthContext = createContext(null)

function storeToken(token) {
  if (token) localStorage.setItem('customer_token', token)
  else localStorage.removeItem('customer_token')
}

function getToken() {
  return localStorage.getItem('customer_token')
}

function storeCustomer(c) {
  if (c) localStorage.setItem('customer_data', JSON.stringify(c))
  else localStorage.removeItem('customer_data')
}

function loadCustomer() {
  try {
    const raw = localStorage.getItem('customer_data')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(loadCustomer)
  const [token, setToken] = useState(getToken)

  const logout = useCallback(() => {
    setCustomer(null)
    setToken(null)
    storeToken(null)
    storeCustomer(null)
  }, [])

  const login = useCallback(async (tenantId, phone, password) => {
    const res = await fetch(`${API_BASE}/customer-auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, phone, password }),
    })
    const body = await res.json()
    if (!res.ok) throw new Error(body?.message || 'Login failed')
    const data = body?.data ?? body
    storeToken(data.token)
    storeCustomer(data.customer)
    setToken(data.token)
    setCustomer(data.customer)
    return data
  }, [])

  const signup = useCallback(async (tenantId, name, phone, password) => {
    const res = await fetch(`${API_BASE}/customer-auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, name, phone, password }),
    })
    const body = await res.json()
    if (!res.ok) throw new Error(body?.message || 'Signup failed')
    const data = body?.data ?? body
    storeToken(data.token)
    storeCustomer(data.customer)
    setToken(data.token)
    setCustomer(data.customer)
    return data
  }, [])

  const fetchProfile = useCallback(async () => {
    if (!token) return null
    const res = await fetch(`${API_BASE}/customer-auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) { logout(); return null }
    const body = await res.json()
    const data = body?.data ?? body
    storeCustomer(data)
    setCustomer(data)
    return data
  }, [token, logout])

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
            storeToken(data.token)
            storeCustomer(data.customer)
            setToken(data.token)
            setCustomer(data.customer)
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
  }, [])

  useEffect(() => {
    if (token) fetchProfile()
  }, [])

  return (
    <CustomerAuthContext.Provider value={{ customer, token, login, signup, googleLogin, logout, fetchProfile }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) return { customer: null, token: null, login: async () => { throw new Error('Auth not available') }, signup: async () => { throw new Error('Auth not available') }, logout: () => {}, fetchProfile: async () => null }
  return ctx
}

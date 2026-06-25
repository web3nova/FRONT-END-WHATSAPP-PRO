import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import { RequireAuth, RequireSubscription } from './components/ProtectedRoute'

import AdminLayout from './layouts/AdminLayout'
import BusinessLayout from './layouts/BusinessLayout'
import BusinessWebsiteBuilder from './layouts/BusinessWebsite'
import AdminOverview from './pages/admin/Overview'
import AdminTenants from './pages/admin/Tenants'
import BusinessOverview from './pages/dashboard/Overview'
import BusinessOrders from './pages/dashboard/Orders'
import WhatsAppPage from './pages/dashboard/WhatsApp'
import Products from './pages/dashboard/Products'
import Customers from './pages/dashboard/Customers'
import Website from './layouts/BusinessWebsite'
import Analytics from './pages/dashboard/Analytics'
import Knowledge from './pages/dashboard/Knowledge'
import Settings from './pages/dashboard/Settings'

import LandingPage from './pages/LandingPage'
import SignUpPage from './pages/auth/SignUpPage'
import LoginPage from './pages/auth/LoginPage'
import SubscribePage from './pages/auth/SubscribePage'
import OnboardingPage from './pages/auth/OnboardingPage'
import BusinessProfilePage from './pages/auth/BusinessProfilePage'

function ForgotPasswordPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Reset your password</h2>
        <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
          Enter your email and we'll send you a reset link.
        </p>
        <input
          type="email"
          placeholder="ada@yourbusiness.com"
          style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E2DDD0', fontSize: 15, marginBottom: '1rem', boxSizing: 'border-box' }}
        />
        <button
          style={{ width: '100%', padding: '14px', background: '#4166F5', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
        >
          Send reset link
        </button>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="app-bg">
      <div className="abstract-blob blob1" />
      <div className="abstract-blob blob2" />
      <div className="abstract-blob blob3" />

      <div className="content-layer">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* -- Root: landing page -- */}
              <Route path="/" element={<LandingPage />} />

              {/* -- Auth pages (public) -- */}
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* -- Website builder (requires login + subscription) -- */}
              <Route
                path="/dashboard/builder"
                element={
                  <RequireSubscription>
                    <BusinessWebsiteBuilder />
                  </RequireSubscription>
                }
              />

              {/* -- Subscription (requires login) -- */}
              <Route
                path="/subscribe"
                element={
                  <RequireAuth>
                    <SubscribePage />
                  </RequireAuth>
                }
              />

              {/* -- Onboarding (requires login + subscription) -- */}
              <Route
                path="/onboarding"
                element={
                  <RequireSubscription>
                    <OnboardingPage />
                  </RequireSubscription>
                }
              />

              {/* -- Business profile (requires login + subscription) -- */}
              <Route
                path="/business-profile"
                element={
                  <RequireSubscription>
                    <BusinessProfilePage />
                  </RequireSubscription>
                }
              />

              {/* -- Business dashboard (requires login + subscription) -- */}
              <Route
                path="/dashboard"
                element={
                  <RequireSubscription>
                    <BusinessLayout />
                  </RequireSubscription>
                }
              >
                <Route index element={<BusinessOverview />} />
                <Route path="orders" element={<BusinessOrders />} />
                <Route path="products" element={<Products />} />
                <Route path="customers" element={<Customers />} />
                <Route path="whatsapp" element={<WhatsAppPage />} />
                <Route path="website" element={<Website />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="knowledge" element={<Knowledge />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* -- Admin panel (requires login) -- */}
              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <AdminLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<AdminOverview />} />
                <Route path="tenants" element={<AdminTenants />} />
              </Route>

              {/* -- Catch-all -- */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </div>
    </div>
  )
}
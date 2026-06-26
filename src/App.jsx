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
import Website from './pages/dashboard/Website'
import Analytics from './pages/dashboard/Analytics'
import Knowledge from './pages/dashboard/Knowledge'
import Settings from './pages/dashboard/Settings'

import LandingPage from './pages/LandingPage'
import DocsPage from './pages/DocsPage'
import SignUpPage from './pages/auth/SignUpPage'
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPassword'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import SubscribePage from './pages/auth/SubscribePage'
import OnboardingPage from './pages/auth/OnboardingPage'
import BusinessProfilePage from './pages/auth/BusinessProfilePage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/docs" element={<DocsPage />} />

          {/* Auth pages (public) */}
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Subscription flow */}
          <Route
            path="/subscribe"
            element={
              <RequireAuth>
                <SubscribePage />
              </RequireAuth>
            }
          />
          <Route
            path="/onboarding"
            element={
              <RequireSubscription>
                <OnboardingPage />
              </RequireSubscription>
            }
          />
          <Route
            path="/business-profile"
            element={
              <RequireSubscription>
                <BusinessProfilePage />
              </RequireSubscription>
            }
          />
          <Route
            path="/dashboard/builder"
            element={
              <RequireSubscription>
                <BusinessWebsiteBuilder />
              </RequireSubscription>
            }
          />

          {/* Business dashboard (requires login + subscription) */}
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

          {/* Admin panel (requires login) */}
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

          {/* Website builder — standalone, no dashboard chrome */}
          <Route
            path="/website-builder"
            element={
              <RequireSubscription>
                <BusinessWebsiteBuilder />
              </RequireSubscription>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

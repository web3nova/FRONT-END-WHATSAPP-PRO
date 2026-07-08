import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';

import {
  RequireAuth,
  RequireSubscription,
} from './components/ProtectedRoute';
import OnboardingGate from './components/OnboardingGate';

import AdminLayout from './layouts/AdminLayout';
import BusinessLayout from './layouts/BusinessLayout';
import BusinessWebsiteBuilder from './layouts/BusinessWebsite';

import AdminOverview from './pages/admin/Overview';
import AdminTenants from './pages/admin/Tenants';

import BusinessOverview from './pages/dashboard/Overview';
import BusinessOrders from './pages/dashboard/Orders';
import WhatsAppPage from './pages/dashboard/WhatsApp';
import Products from './pages/dashboard/Products';
import ProductNew from './pages/dashboard/ProductNew';
import ProductEdit from './pages/dashboard/ProductEdit';
import Customers from './pages/dashboard/Customers';
import WebsiteDashboard from './pages/dashboard/Website';
import WebsitePreview from './pages/dashboard/WebsitePreview';
import Analytics from './pages/dashboard/Analytics';
import Knowledge from './pages/dashboard/Knowledge';
import Settings from './pages/dashboard/Settings';
import PaymentSettings from './pages/dashboard/PaymentSettings';

import LandingPage from './pages/LandingPage';
import StorefrontPage from './pages/StorefrontPage';

import SignUpPage from './pages/auth/SignUpPage';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPassword';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import SubscribePage from './pages/auth/SubscribePage';
import OnboardingPage from './pages/auth/OnboardingPage';
import BusinessProfilePage from './pages/auth/BusinessProfilePage';
import AcceptInvitePage from './pages/auth/AcceptInvitePage';

// If the page is loaded on a custom domain (not biziq.online or localhost),
// serve the storefront for that domain directly — no router needed.
const BIZIQ_HOSTS = ['biziq.online', 'www.biziq.online']
const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
const isCustomDomain =
  hostname &&
  !BIZIQ_HOSTS.includes(hostname) &&
  hostname !== 'localhost' &&
  !hostname.endsWith('.vercel.app') &&
  !hostname.endsWith('.onrender.com')

export default function App() {
  if (isCustomDomain) {
    return <StorefrontPage domain={hostname} />
  }

  return (
    <div className="app-bg">

      {/* Background effects */}
      <div className="abstract-blob blob1" />
      <div className="abstract-blob blob2" />
      <div className="abstract-blob blob3" />

      <div className="content-layer">

        <AuthProvider>

          <BrowserRouter>

            <Routes>

              {/* Landing */}
              <Route
                path="/"
                element={<LandingPage />}
              />

              {/* Authentication */}

              <Route
                path="/signup"
                element={<SignUpPage />}
              />

              <Route
                path="/login"
                element={<LoginPage />}
              />

              <Route
                path="/forgot-password"
                element={<ForgotPasswordPage />}
              />

              <Route
                path="/accept-invite"
                element={<AcceptInvitePage />}
              />

              <Route
                path="/reset-password"
                element={<ResetPasswordPage />}
              />

              {/* Subscription */}

              <Route
                path="/subscribe"
                element={
                  <RequireAuth>
                    <SubscribePage />
                  </RequireAuth>
                }
              />

              {/* Onboarding */}

              <Route
                path="/onboarding"
                element={
                  <RequireAuth>
                    <OnboardingGate>
                      <OnboardingPage />
                    </OnboardingGate>
                  </RequireAuth>
                }
              />

              <Route
                path="/business-profile"
                element={
                  <RequireSubscription>
                    <OnboardingGate>
                      <BusinessProfilePage />
                    </OnboardingGate>
                  </RequireSubscription>
                }
              />

              {/* Public Storefront Preview */}

              <Route
                path="/storefront/:tenantId/:pageSlug?"
                element={<StorefrontPage />}
              />

              {/* Website Builder */}

              <Route
                path="/dashboard/builder"
                element={
                  <RequireSubscription>
                    <BusinessWebsiteBuilder />
                  </RequireSubscription>
                }
              />

              {/* Dashboard */}

              <Route
                path="/dashboard"
                element={
                  <RequireSubscription>
                    <BusinessLayout />
                  </RequireSubscription>
                }
              >
                <Route
                  index
                  element={<BusinessOverview />}
                />

                <Route
                  path="orders"
                  element={<BusinessOrders />}
                />

                <Route
                  path="products"
                  element={<Products />}
                />

                <Route
                  path="products/new"
                  element={<ProductNew />}
                />

                <Route
                  path="products/:id/edit"
                  element={<ProductEdit />}
                />

                <Route
                  path="customers"
                  element={<Customers />}
                />

                <Route
                  path="whatsapp"
                  element={<WhatsAppPage />}
                />

                <Route
                  path="website"
                  element={<WebsiteDashboard />}
                />

                <Route
                  path="website/preview"
                  element={<WebsitePreview />}
                />

                <Route
                  path="analytics"
                  element={<Analytics />}
                />

                <Route
                  path="knowledge"
                  element={<Knowledge />}
                />

                <Route
                  path="payments"
                  element={<PaymentSettings />}
                />

                <Route
                  path="settings"
                  element={<Settings />}
                />

              </Route>

              {/* Admin */}

              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <AdminLayout />
                  </RequireAuth>
                }
              >
                <Route
                  index
                  element={<AdminOverview />}
                />

                <Route
                  path="tenants"
                  element={<AdminTenants />}
                />

              </Route>

              {/* Fallback */}

              <Route
                path="*"
                element={
                  <Navigate
                    to="/"
                    replace
                  />
                }
              />

            </Routes>

          </BrowserRouter>

        </AuthProvider>

      </div>

    </div>
  );
}
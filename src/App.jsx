import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import {
  RequireAuth,
  RequireSubscription,
} from './components/ProtectedRoute';
import OnboardingGate from './components/OnboardingGate';

import BusinessLayout from './layouts/BusinessLayout';
import BusinessWebsiteBuilder from './layouts/BusinessWebsite';

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
import Coupons from './pages/dashboard/Coupons';
import Reviews from './pages/dashboard/Reviews';

import LandingPage from './pages/LandingPage';
import StorefrontPage from './pages/StorefrontPage';
import CustomerAccount from './pages/storefront/CustomerAccount';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

import { CustomerAuthProvider } from './context/CustomerAuthContext';
import SignUpPage from './pages/auth/SignUpPage';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPassword';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import SubscribePage from './pages/auth/SubscribePage';
import BillingCallbackPage from './pages/auth/Billingcallbackpage';
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
    // Custom-domain tenants have no /storefront/:tenantId prefix — the whole
    // origin IS their storefront — but still need path-based routing for
    // Home/Shop/custom-page URLs, so this gets its own minimal BrowserRouter
    // rather than the app-wide one below (which also mounts auth/dashboard
    // routes that make no sense on a tenant's custom domain).
    return (
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<StorefrontPage domain={hostname} />} />
            <Route path="/shop" element={<StorefrontPage domain={hostname} />} />
            <Route path="/:view" element={<StorefrontPage domain={hostname} />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    )
  }

  return (
    <div className="app-bg">

      {/* Background effects */}
      <div className="abstract-blob blob1" />
      <div className="abstract-blob blob2" />
      <div className="abstract-blob blob3" />

      <div className="content-layer">

        <NotificationProvider>
        <AuthProvider>

          <BrowserRouter>

            <Routes>

              {/* Landing */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

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

              <Route
                path="/billing/callback"
                element={
                  <RequireAuth>
                    <BillingCallbackPage />
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
                path="/storefront/:tenantId/:view?/:productId?"
                element={
                  <CustomerAuthProvider>
                    <StorefrontPage />
                  </CustomerAuthProvider>
                }
              />

              {/* Slug-based storefront URL */}
              <Route
                path="/b/:slug/:view?/:productId?"
                element={
                  <CustomerAuthProvider>
                    <StorefrontPage />
                  </CustomerAuthProvider>
                }
              />

              {/* Customer account pages */}
              <Route
                path="/b/:slug/account"
                element={
                  <CustomerAuthProvider>
                    <CustomerAccount />
                  </CustomerAuthProvider>
                }
              />
              <Route
                path="/storefront/:tenantId/account"
                element={
                  <CustomerAuthProvider>
                    <CustomerAccount />
                  </CustomerAuthProvider>
                }
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
                  path="coupons"
                  element={<Coupons />}
                />

                <Route
                  path="reviews"
                  element={<Reviews />}
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
        </NotificationProvider>

      </div>

    </div>
  );
}
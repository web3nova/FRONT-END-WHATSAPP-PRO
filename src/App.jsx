import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import BusinessLayout from './layouts/BusinessLayout'
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="tenants" element={<AdminTenants />} />
        </Route>
        <Route path="/dashboard" element={<BusinessLayout />}>
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
      </Routes>
    </BrowserRouter>
  )
}

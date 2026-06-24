import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import BusinessLayout from './layouts/BusinessLayout'
import AdminOverview from './pages/admin/Overview'
import AdminTenants from './pages/admin/Tenants'
import BusinessOverview from './pages/dashboard/Overview'
import BusinessOrders from './pages/dashboard/Orders'
import WhatsAppPage from './pages/dashboard/WhatsApp'

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
          <Route path="whatsapp" element={<WhatsAppPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

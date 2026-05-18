import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import { LoginPage, RegisterPage } from './pages/Auth'
import DashboardPage from './pages/Dashboard'
import ProductsPage from './pages/Products'
import OrdersPage from './pages/Orders'
import useAuthStore from './hooks/useAuthStore'
import './styles/global.css'

function PrivateRoute({ children }) {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { token } = useAuthStore()
  return !token ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  const { token, fetchMe } = useAuthStore()

  useEffect(() => {
    if (token) fetchMe()
  }, [])

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

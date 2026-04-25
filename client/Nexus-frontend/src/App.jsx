import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'

import MainLayout from './layouts/MainLayout'
import LandingPage from './Pages/LandingPage'
import LoginPage from './Pages/LoginPage'
import SignUpPage from './Pages/SignUpPage'
import ChatPage from './Pages/ChatPages'
import PatientDashboard from './Pages/PatientDashboard'
import AdminDashboard from './Pages/AdminDashboard'
import DoctorDashboard from './Pages/DoctorDashboard'

function ProtectedRoute({ children }) {
  const token = useAppStore(state => state.token)
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function RoleRoute({ allowedRoles, children }) {
  const roles = useAppStore(state => state.roles)
  // If the user has any of the allowed roles, permit access
  const hasRole = roles.some(role => allowedRoles.includes(role))
  if (!hasRole) {
    return <Navigate to="/" replace /> // Will be caught by PublicRoute logic
  }
  return children
}

function PublicRoute({ children }) {
  const token = useAppStore(state => state.token)
  const roles = useAppStore(state => state.roles)
  
  if (token) {
    if (roles.includes('ADMIN')) return <Navigate to="/admin" replace />
    if (roles.includes('DOCTOR')) return <Navigate to="/doctor-dashboard" replace />
    return <Navigate to="/dashboard" replace /> // Defaults to PATIENT
  }
  return children
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />

        {/* Protected Routes inside MainLayout */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          {/* Patient Routes */}
          <Route path="/dashboard" element={<RoleRoute allowedRoles={['PATIENT']}><PatientDashboard /></RoleRoute>} />
          <Route path="/chat" element={<RoleRoute allowedRoles={['PATIENT']}><ChatPage /></RoleRoute>} />
          
          {/* Doctor Routes */}
          <Route path="/doctor-dashboard" element={<RoleRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></RoleRoute>} />
          
          <Route path="/admin" element={<RoleRoute allowedRoles={['ADMIN']}><AdminDashboard /></RoleRoute>} />
          
          {/* Default fallback for authenticated users (will redirect based on roles in PublicRoute logic but handled differently here) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}
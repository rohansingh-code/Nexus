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
  const token = useAppStore(s => s.token)
  return token ? children : <Navigate to="/login" replace />
}

function RoleRoute({ allowedRoles, children }) {
  const roles = useAppStore(s => s.roles)
  return roles.some(r => allowedRoles.includes(r)) ? children : <Navigate to="/" replace />
}

function PublicRoute({ children }) {
  const token = useAppStore(s => s.token)
  const roles = useAppStore(s => s.roles)
  if (token) {
    if (roles.includes('ADMIN')) return <Navigate to="/admin" replace />
    if (roles.includes('DOCTOR')) return <Navigate to="/doctor-dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />

        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<RoleRoute allowedRoles={['PATIENT']}><PatientDashboard /></RoleRoute>} />
          <Route path="/chat" element={<RoleRoute allowedRoles={['PATIENT']}><ChatPage /></RoleRoute>} />
          <Route path="/doctor-dashboard" element={<RoleRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></RoleRoute>} />
          <Route path="/admin" element={<RoleRoute allowedRoles={['ADMIN']}><AdminDashboard /></RoleRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}
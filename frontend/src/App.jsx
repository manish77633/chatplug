import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { Toaster } from 'react-hot-toast'

import Landing      from './pages/Landing'
import Login        from './pages/Login'
import Register     from './pages/Register'
import Dashboard    from './pages/Dashboard'
import ChatbotDetail from './pages/ChatbotDetail'
import Playground   from './pages/Playground'
import Analytics    from './pages/Analytics'
import Docs         from './pages/Docs'
import AdminPanel   from './pages/AdminPanel'

const Protected = ({ children }) => {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const { user } = useAuthStore()
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/docs"     element={<Docs />} />

        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/chatbot/:id" element={<Protected><ChatbotDetail /></Protected>} />
        <Route path="/chatbot/:id/playground" element={<Protected><Playground /></Protected>} />
        <Route path="/chatbot/:id/analytics"  element={<Protected><Analytics /></Protected>} />

        <Route path="/admin" element={<Protected><AdminRoute><AdminPanel /></AdminRoute></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
          },
        }}
      />
    </>
  )
}

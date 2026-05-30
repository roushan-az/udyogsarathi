// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider, useApp } from './context/AppContext'
import { ProtectedRoute }  from './components/ProtectedRoute'

import { LoginPage }       from './pages/LoginPage'
import { RegisterPage }    from './pages/RegisterPage'
import { Dashboard }       from './pages/Dashboard'
import { UploadPage }      from './pages/UploadPage'
import { DocumentsPage }   from './pages/DocumentsPage'
import { AnalyticsPage }   from './pages/AnalyticsPage'
import { SettingsPage }    from './pages/SettingsPage'
import { AdminPage }       from './pages/AdminPage' // <-- Added AdminPage import
import { authService }     from './services/api'
import './App.css'
import { LoadingScreen } from './components/Loadingscreen'
import { useEffect, useRef } from 'react'


const toastBase = {
  background: '#1a2b4e', color: '#f0f4ff',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
  fontSize: '13px', fontFamily: 'Sora, sans-serif',
  padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', maxWidth: '380px',
}

// ── Inner wrapper: shows loading/error screen while API boots ─────────────────
function AppShell() {
  const { isLoading, statsLoading, error, refreshDocuments, refreshStats } = useApp()
  const isAuthenticated = authService.isAuthenticated()

  const hasBootstrapped = useRef(false)
  const stillBooting = isAuthenticated && (isLoading || statsLoading)
  
  useEffect(() => {
    if (!stillBooting && !hasBootstrapped.current) {
      hasBootstrapped.current = true   // ← flips permanently after first load
    }
  }, [stillBooting])


 if (!hasBootstrapped.current && stillBooting && error === null) {
    return <LoadingScreen />
  }

  if (!hasBootstrapped.current && isAuthenticated && !!error && !isLoading) {
    return (
      <LoadingScreen
        error={error}
        onRetry={() => {
          refreshDocuments()
          refreshStats()
        }}
      />
    )
  }
 
  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const userStr = localStorage.getItem('auth_user')
    const user = userStr ? JSON.parse(userStr) : null
    
    if (!user || (!user.isSuperuser && !user.is_superuser)) {
      return <Navigate to="/" replace /> // Kick non-admins back to dashboard
    }
    return <>{children}</>
  }

  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── Protected ── */}
      <Route path="/"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/upload"    element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/settings"  element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      {/* ── Admin Route Updated ── */}
      <Route path="/admin"     element={<AdminRoute><AdminPage /></AdminRoute>}/>

      {/* ── Catch-all ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppProvider>
        <Toaster
          position="top-right"
          gutter={10}
          toastOptions={{
            duration: 4000,
            style: toastBase,
            success: { iconTheme: { primary: '#22c55e', secondary: '#f0f4ff' }, style: { ...toastBase, background: '#112a1e', border: '1px solid rgba(34,197,94,0.2)' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#f0f4ff' }, style: { ...toastBase, background: '#2a1111', border: '1px solid rgba(239,68,68,0.2)' } },
          }}
        />
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  )
}
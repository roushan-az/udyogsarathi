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
import { authService }     from './services/api'
import './App.css'
import { LoadingScreen } from './components/Loadingscreen'

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

  // Show branded loading screen while FIRST data fetch is in flight
  // (only when user is authenticated — unauthenticated users go to /login)
  const firstLoad = isAuthenticated && (isLoading || statsLoading) && error === null

  // Show error screen if API is completely unreachable (CORS / DNS / down)
  // But only when authenticated — unauthenticated users see /login instead
  const apiUnreachable = isAuthenticated && !!error && !isLoading

  if (firstLoad) {
    return <LoadingScreen />
  }

  if (apiUnreachable) {
    return (
      <LoadingScreen
        error={error}
        onRetry={() => { refreshDocuments(); refreshStats() }}
      />
    )
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
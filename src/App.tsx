// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from './context/AppContext'

import { LoginPage }    from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { Dashboard }    from './pages/Dashboard'
import { UploadPage }   from './pages/UploadPage'
import { DocumentsPage }from './pages/DocumentsPage'

import { SettingsPage } from './pages/SettingsPage'
import './App.css'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AnalyticsPage } from './pages/Analyticspage'

const toastStyle = {
  background:   '#1a2b4e',
  color:        '#f0f4ff',
  border:       '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  fontSize:     '13px',
  fontFamily:   'Sora, sans-serif',
  padding:      '12px 16px',
  boxShadow:    '0 8px 32px rgba(0,0,0,0.5)',
  maxWidth:     '380px',
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        // Suppress React Router v6 → v7 deprecation warnings in console
        v7_startTransition:   true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppProvider>

        {/* ── Global toast notifications ── */}
        <Toaster
          position="top-right"
          gutter={10}
          toastOptions={{
            duration: 4000,
            style: toastStyle,
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#f0f4ff' },
              style: { ...toastStyle, background: '#112a1e', border: '1px solid rgba(34,197,94,0.2)' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f0f4ff' },
              style: { ...toastStyle, background: '#2a1111', border: '1px solid rgba(239,68,68,0.2)' },
            },
          }}
        />

        <Routes>
          {/* ── Public routes (no auth required) ── */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Protected routes (redirect to /login if no token) ── */}
          <Route path="/" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute><UploadPage /></ProtectedRoute>
          } />
          <Route path="/documents" element={
            <ProtectedRoute><DocumentsPage /></ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute><AnalyticsPage /></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><SettingsPage /></ProtectedRoute>
          } />

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

      </AppProvider>
    </BrowserRouter>
  )
}
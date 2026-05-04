// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from './context/AppContext'

import './App.css'
import { Dashboard } from './pages/Dashboard'
import { UploadPage } from './pages/UploadPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { AnalyticsPage } from './pages/Analyticspage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>

        {/* ── Global toast notifications ── */}
        <Toaster
          position="top-right"
          gutter={10}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a2b4e',
              color: '#f0f4ff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '13px',
              fontFamily: 'Sora, sans-serif',
              padding: '12px 16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              maxWidth: '380px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#f0f4ff' },
              style: {
                background: '#112a1e',
                border: '1px solid rgba(34,197,94,0.2)',
              },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f0f4ff' },
              style: {
                background: '#2a1111',
                border: '1px solid rgba(239,68,68,0.2)',
              },
            },
          }}
        />

        {/* ── App routes ── */}
        <Routes>
          <Route path="/"           element={<Dashboard />} />
          <Route path="/upload"     element={<UploadPage />} />
          <Route path="/documents"  element={<DocumentsPage />} />
          <Route path="/analytics"  element={<AnalyticsPage />} />
          <Route path="/settings"   element={<SettingsPage />} />

          {/* Catch-all → dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

      </AppProvider>
    </BrowserRouter>
  )
}
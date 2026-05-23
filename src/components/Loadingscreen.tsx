// src/components/LoadingScreen.tsx
// Shows a branded loading state while waiting for the API.
// Replaces the black screen when API calls fail.

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, Wifi, WifiOff, RefreshCw } from 'lucide-react'

interface Props {
  error?: string | null
  onRetry?: () => void
}

export const LoadingScreen: React.FC<Props> = ({ error, onRetry }) => {
  const [dots, setDots] = useState('.')

  useEffect(() => {
    if (error) return
    const t = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 500)
    return () => clearInterval(t)
  }, [error])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-void)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', maxWidth: 400, position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <motion.div
          animate={error ? {} : { boxShadow: ['0 0 16px rgba(249,115,22,0.3)', '0 0 32px rgba(249,115,22,0.6)', '0 0 16px rgba(249,115,22,0.3)'] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #f97316, #ea6906)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Building2 size={32} color="#fff" />
        </motion.div>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f0f4ff', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Udyog Sarathi
        </h1>

        {error ? (
          /* ── Error state ── */
          <>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px auto' }}>
              <WifiOff size={20} color="#f87171" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f87171', marginBottom: 10 }}>
              Cannot reach the API
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 20 }}>
              {error}
            </p>
            <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Checklist</div>
              {[
                'Azure App Service is running (not stopped/sleeping)',
                'CORS_ORIGINS env var includes this Static Web App URL',
                'VITE_API_URL GitHub secret points to the correct App Service',
                'App Service startup command: bash start.sh',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                  <span style={{ color: '#f97316', flexShrink: 0 }}>→</span> {item}
                </div>
              ))}
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #f97316, #ea6906)',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  boxShadow: '0 0 20px rgba(249,115,22,0.35)',
                }}
              >
                <RefreshCw size={15} /> Retry Connection
              </button>
            )}
          </>
        ) : (
          /* ── Loading state ── */
          <>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, margin: '20px 0' }}>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316' }}
                />
              ))}
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
              Connecting to API{dots}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
              Azure App Service · Supabase PostgreSQL · Cloudflare R2
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}
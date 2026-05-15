// src/pages/LoginPage.tsx

import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Mail, Lock, Eye, EyeOff, Loader2, AlertTriangle, Zap } from 'lucide-react'
import { authService } from '../services/api'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

export const LoginPage: React.FC = () => {
  const navigate   = useNavigate()
  const location   = useLocation()
  const { setCurrentUser, refreshDocuments, refreshStats } = useApp()

  const from = (location.state as { from?: string })?.from || '/'

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  // If already authenticated, redirect straight to app
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate(from, { replace: true })
    }
  }, [from, navigate])

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: typeof fieldErrors = {}
    if (!email.trim())              errs.email    = 'Email is required'
    else if (!email.includes('@'))  errs.email    = 'Enter a valid email address'
    if (!password)                  errs.password = 'Password is required'
    else if (password.length < 6)   errs.password = 'Password must be at least 6 characters'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!validate()) return

    setLoading(true)
    try {
      await authService.login({ email: email.trim().toLowerCase(), password })

      // Fetch the user profile to populate currentUser
      const user = await authService.me()
      setCurrentUser({ name: user.fullName, email: user.email })

      // Kick off data fetch now that we have a token
      refreshDocuments()
      refreshStats()

      toast.success(`Welcome back, ${user.fullName.split(' ')[0]}!`)
      navigate(from, { replace: true })

    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string }; detail?: string } } })
          ?.response?.data?.error?.message
        ?? (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? 'Invalid email or password'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Dev shortcut ──────────────────────────────────────────────────────────
  const handleDevLogin = async () => {
    // Sets a dev token that the FastAPI backend (DEBUG=True) accepts as 'dev-user'
    localStorage.setItem('auth_token', 'dev')
    setCurrentUser({ name: 'Dev Admin', email: 'dev@udyogsarathi.local' })
    refreshDocuments()
    refreshStats()
    toast.success('Dev mode — bypassing auth')
    navigate(from, { replace: true })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-void)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
            style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'linear-gradient(135deg, #f97316, #ea6906)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 32px rgba(249,115,22,0.35)',
            }}
          >
            <Building2 size={28} color="#fff" />
          </motion.div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', marginBottom: 6 }}>
            Udyog Sarathi
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            उद्योग सारथी — Enterprise Document Intelligence
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(17,30,53,0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '32px 32px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f0f4ff', marginBottom: 6 }}>
            Sign in to your account
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>
              Create one free
            </Link>
          </p>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden', marginBottom: 20 }}
              >
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '11px 14px', borderRadius: 10,
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                }}>
                  <AlertTriangle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 13, color: '#f87171', lineHeight: 1.5 }}>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color={fieldErrors.email ? '#f87171' : 'rgba(255,255,255,0.3)'} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: undefined })) }}
                  placeholder="admin@company.com"
                  autoComplete="email"
                  style={{
                    width: '100%', height: 44,
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${fieldErrors.email ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 10, padding: '0 14px 0 38px',
                    fontSize: 14, color: '#f0f4ff', outline: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={e => { if (!fieldErrors.email) e.target.style.borderColor = 'rgba(249,115,22,0.5)' }}
                  onBlur={e  => { if (!fieldErrors.email) e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                />
              </div>
              {fieldErrors.email && (
                <p style={{ fontSize: 12, color: '#f87171', marginTop: 5 }}>{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color={fieldErrors.password ? '#f87171' : 'rgba(255,255,255,0.3)'} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: undefined })) }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%', height: 44,
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${fieldErrors.password ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 10, padding: '0 42px 0 38px',
                    fontSize: 14, color: '#f0f4ff', outline: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={e => { if (!fieldErrors.password) e.target.style.borderColor = 'rgba(249,115,22,0.5)' }}
                  onBlur={e  => { if (!fieldErrors.password) e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 2 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p style={{ fontSize: 12, color: '#f87171', marginTop: 5 }}>{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              disabled={loading}
              style={{
                width: '100%', height: 46, borderRadius: 12, border: 'none',
                background: loading ? 'rgba(249,115,22,0.4)' : 'linear-gradient(135deg, #f97316, #ea6906)',
                color: '#fff', fontSize: 14.5, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                boxShadow: loading ? 'none' : '0 0 28px rgba(249,115,22,0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              {loading
                ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> Signing in…</>
                : 'Sign In'}
            </motion.button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' }}>or for development</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Dev bypass button */}
          <button
            onClick={handleDevLogin}
            style={{
              width: '100%', height: 42, borderRadius: 10, cursor: 'pointer',
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
              color: '#60a5fa', fontSize: 13.5, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.1)')}
          >
            <Zap size={14} /> Continue as Dev (DEBUG mode)
          </button>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 8 }}>
            Uses Bearer "dev" token — only works when FastAPI DEBUG=True
          </p>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 24 }}>
          Udyog Sarathi v1.0 · Azure Static Web Apps + FastAPI + PostgreSQL
        </p>
      </motion.div>
    </div>
  )
}
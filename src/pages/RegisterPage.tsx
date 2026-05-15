// src/pages/RegisterPage.tsx

import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Mail, Lock, User, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
import { authService } from '../services/api'
import toast from 'react-hot-toast'

interface FieldErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

// Password strength helper
const getPasswordStrength = (p: string): { score: number; label: string; color: string } => {
  if (!p) return { score: 0, label: '', color: 'transparent' }
  let score = 0
  if (p.length >= 8)              score++
  if (p.length >= 12)             score++
  if (/[A-Z]/.test(p))            score++
  if (/[0-9]/.test(p))            score++
  if (/[^A-Za-z0-9]/.test(p))    score++
  if (score <= 1) return { score, label: 'Weak',   color: '#ef4444' }
  if (score <= 3) return { score, label: 'Fair',   color: '#f59e0b' }
  if (score === 4) return { score, label: 'Good',   color: '#3b82f6' }
  return                { score, label: 'Strong', color: '#22c55e' }
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()

  const [fullName,        setFullName]        = useState('')
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass,        setShowPass]        = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState<string | null>(null)
  const [fieldErrors,     setFieldErrors]     = useState<FieldErrors>({})
  const [success,         setSuccess]         = useState(false)

  const strength = getPasswordStrength(password)

  // Redirect if already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) navigate('/', { replace: true })
  }, [navigate])

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: FieldErrors = {}
    if (!fullName.trim() || fullName.trim().length < 2)
      errs.fullName = 'Full name must be at least 2 characters'
    if (!email.trim() || !email.includes('@'))
      errs.email = 'Enter a valid email address'
    if (!password || password.length < 8)
      errs.password = 'Password must be at least 8 characters'
    if (password !== confirmPassword)
      errs.confirmPassword = 'Passwords do not match'
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
      await authService.register({
        email:     email.trim().toLowerCase(),
        password,
        full_name: fullName.trim(),
      })

      setSuccess(true)
      toast.success('Account created! Signing you in…')

      // Auto-login after register
      await authService.login({ email: email.trim().toLowerCase(), password })
      setTimeout(() => navigate('/', { replace: true }), 800)

    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string }; detail?: string } } })
          ?.response?.data?.error?.message
        ?? (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? 'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Input field factory ───────────────────────────────────────────────────
  const InputField = ({
    label, value, onChange, type = 'text', placeholder, icon, error: fieldError,
    rightIcon, id, autoComplete,
  }: {
    label: string; value: string; onChange: (v: string) => void
    type?: string; placeholder: string; icon: React.ReactNode
    error?: string; rightIcon?: React.ReactNode; id?: string; autoComplete?: string
  }) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: fieldError ? '#f87171' : 'rgba(255,255,255,0.3)' }}>
          {icon}
        </span>
        <input id={id} type={type} value={value} autoComplete={autoComplete}
          onChange={e => { onChange(e.target.value); setFieldErrors(p => ({ ...p })) }}
          placeholder={placeholder}
          style={{
            width: '100%', height: 44,
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${fieldError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 10, padding: `0 ${rightIcon ? '42px' : '14px'} 0 38px`,
            fontSize: 14, color: '#f0f4ff', outline: 'none', transition: 'border-color 0.15s ease',
          }}
          onFocus={e => { if (!fieldError) e.target.style.borderColor = 'rgba(249,115,22,0.5)' }}
          onBlur={e  => { if (!fieldError) e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
        />
        {rightIcon && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            {rightIcon}
          </span>
        )}
      </div>
      {fieldError && <p style={{ fontSize: 12, color: '#f87171', marginTop: 5 }}>{fieldError}</p>}
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-void)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', left: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 13, background: 'linear-gradient(135deg, #f97316, #ea6906)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 0 28px rgba(249,115,22,0.35)' }}>
            <Building2 size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', marginBottom: 5 }}>
            Create Account
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Join Udyog Sarathi — Enterprise Document Intelligence
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(17,30,53,0.85)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '32px 32px', backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 26 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>

          {/* Success state */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '20px 0', marginBottom: 20 }}
              >
                <CheckCircle size={40} color="#22c55e" style={{ margin: '0 auto 10px' }} />
                <p style={{ color: '#4ade80', fontWeight: 600, fontSize: 15 }}>Account created!</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>Signing you in…</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <AlertTriangle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 13, color: '#f87171', lineHeight: 1.5 }}>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!success && (
            <form onSubmit={handleSubmit} noValidate>
              <InputField label="Full Name" value={fullName} onChange={setFullName}
                placeholder="Rahul Sharma" icon={<User size={15} />}
                error={fieldErrors.fullName} autoComplete="name" />

              <InputField label="Email Address" value={email} onChange={setEmail}
                type="email" placeholder="admin@company.com" icon={<Mail size={15} />}
                error={fieldErrors.email} autoComplete="email" />

              {/* Password with strength meter */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color={fieldErrors.password ? '#f87171' : 'rgba(255,255,255,0.3)'} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters" autoComplete="new-password"
                    style={{ width: '100%', height: 44, background: 'rgba(255,255,255,0.05)', border: `1px solid ${fieldErrors.password ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, padding: '0 42px 0 38px', fontSize: 14, color: '#f0f4ff', outline: 'none', transition: 'border-color 0.15s ease' }}
                    onFocus={e => { if (!fieldErrors.password) e.target.style.borderColor = 'rgba(249,115,22,0.5)' }}
                    onBlur={e  => { if (!fieldErrors.password) e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Strength bar */}
                {password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.1)', transition: 'background 0.2s ease' }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.label} password</p>
                  </div>
                )}
                {fieldErrors.password && <p style={{ fontSize: 12, color: '#f87171', marginTop: 5 }}>{fieldErrors.password}</p>}
              </div>

              {/* Confirm password */}
              <div style={{ marginBottom: 26 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color={fieldErrors.confirmPassword ? '#f87171' : 'rgba(255,255,255,0.3)'} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password" autoComplete="new-password"
                    style={{ width: '100%', height: 44, background: 'rgba(255,255,255,0.05)', border: `1px solid ${fieldErrors.confirmPassword ? 'rgba(239,68,68,0.5)' : confirmPassword && confirmPassword === password ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, padding: '0 42px 0 38px', fontSize: 14, color: '#f0f4ff', outline: 'none', transition: 'border-color 0.15s ease' }}
                    onFocus={e => { if (!fieldErrors.confirmPassword) e.target.style.borderColor = 'rgba(249,115,22,0.5)' }}
                    onBlur={e  => { if (!fieldErrors.confirmPassword && !(confirmPassword && confirmPassword === password)) e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  {confirmPassword && confirmPassword === password && (
                    <CheckCircle size={15} color="#22c55e" style={{ position: 'absolute', right: 36, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  )}
                </div>
                {fieldErrors.confirmPassword && <p style={{ fontSize: 12, color: '#f87171', marginTop: 5 }}>{fieldErrors.confirmPassword}</p>}
              </div>

              <motion.button type="submit" whileHover={!loading ? { scale: 1.01 } : {}} whileTap={!loading ? { scale: 0.98 } : {}} disabled={loading}
                style={{
                  width: '100%', height: 46, borderRadius: 12, border: 'none',
                  background: loading ? 'rgba(249,115,22,0.4)' : 'linear-gradient(135deg, #f97316, #ea6906)',
                  color: '#fff', fontSize: 14.5, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                  boxShadow: loading ? 'none' : '0 0 28px rgba(249,115,22,0.35)', transition: 'all 0.2s ease',
                }}>
                {loading
                  ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> Creating account…</>
                  : 'Create Account'}
              </motion.button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 24 }}>
          Udyog Sarathi v1.0 · Your data is encrypted at rest on Azure
        </p>
      </motion.div>
    </div>
  )
}
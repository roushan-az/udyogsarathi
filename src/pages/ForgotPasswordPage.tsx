// src/pages/ForgotPasswordPage.tsx

import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyRound, Mail, Lock, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { authService } from '../services/api'

interface FieldErrors {
  email?: string
  otp?: string
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
  if (/[^A-Za-z0-9]/.test(p))     score++
  if (score <= 1) return { score, label: 'Weak',   color: '#ef4444' }
  if (score <= 3) return { score, label: 'Fair',   color: '#f59e0b' }
  if (score === 4) return { score, label: 'Good',  color: '#3b82f6' }
  return { score, label: 'Strong', color: '#22c55e' }
}

// ── Input field factory ───────────────────────────────────────────────────
const InputField = ({
  label, value, onChange, type = 'text', placeholder, icon, error: fieldError,
  rightIcon, id, autoComplete, setFieldErrors, maxLength
}: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder: string; icon: React.ReactNode
  error?: string; rightIcon?: React.ReactNode; id?: string; autoComplete?: string;
  setFieldErrors: React.Dispatch<React.SetStateAction<FieldErrors>>;
  maxLength?: number;
}) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: fieldError ? '#f87171' : 'rgba(255,255,255,0.3)' }}>
        {icon}
      </span>
      <input id={id} type={type} value={value} autoComplete={autoComplete} maxLength={maxLength}
        onChange={e => { onChange(e.target.value); setFieldErrors(p => ({ ...p })) }}
        placeholder={placeholder}
        style={{
          width: '100%', height: 44,
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${fieldError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 10, padding: `0 ${rightIcon ? '42px' : '14px'} 0 38px`,
          fontSize: 14, color: '#f0f4ff', outline: 'none', transition: 'border-color 0.15s ease',
          letterSpacing: maxLength === 6 ? '0.2em' : 'normal',
          fontFamily: maxLength === 6 ? 'monospace' : 'inherit'
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

// ── Main Component ────────────────────────────────────────────────────────
export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate()

  // State
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // UI State
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [success, setSuccess] = useState(false)

  const strength = getPasswordStrength(password)

  // ── Step 1: Request OTP ───────────────────────────────────────────────────
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!email.trim() || !email.includes('@')) {
      setFieldErrors({ email: 'Enter a valid email address' })
      return
    }

    setLoading(true)
    try {
      await authService.requestPasswordReset(email.trim().toLowerCase())
      setStep(2) // Move to OTP input screen
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? err?.response?.data?.detail ?? 'Failed to send reset link. Check your email.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Reset Password ────────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    const errs: FieldErrors = {}
    if (!otp || otp.length < 6) errs.otp = 'Enter the 6-digit OTP'
    if (!password || password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
    
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      await authService.resetPasswordWithOTP(email.trim().toLowerCase(), otp, password)
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 3000)
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? err?.response?.data?.detail ?? 'Failed to reset password. Invalid OTP.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

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
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 13, background: 'linear-gradient(135deg, #f97316, #ea6906)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 0 28px rgba(249,115,22,0.35)' }}>
            <KeyRound size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', marginBottom: 5 }}>
            {step === 1 ? 'Reset Password' : 'Create New Password'}
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', padding: '0 20px' }}>
            {step === 1 
              ? 'Enter your email address and we will send you a one-time password to reset your account.'
              : `Enter the 6-digit OTP sent to ${email} along with your new password.`}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(17,30,53,0.85)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '32px 32px', backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}>
          
          {/* Success state */}
          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '10px 0', marginBottom: 20 }}>
                <CheckCircle size={40} color="#22c55e" style={{ margin: '0 auto 10px' }} />
                <p style={{ color: '#4ade80', fontWeight: 600, fontSize: 15 }}>Password updated successfully!</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>Redirecting you to login…</p>
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

          {!success && step === 1 && (
            <motion.form initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleRequestOTP} noValidate>
              <InputField 
                label="Email Address" value={email} onChange={setEmail} type="email" 
                placeholder="admin@company.com" icon={<Mail size={15} />}
                error={fieldErrors.email} autoComplete="email" setFieldErrors={setFieldErrors}
              />

              <motion.button type="submit" whileHover={!loading ? { scale: 1.01 } : {}} whileTap={!loading ? { scale: 0.98 } : {}} disabled={loading}
                style={{
                  width: '100%', height: 46, borderRadius: 12, border: 'none', marginTop: 10,
                  background: loading ? 'rgba(249,115,22,0.4)' : 'linear-gradient(135deg, #f97316, #ea6906)',
                  color: '#fff', fontSize: 14.5, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                  boxShadow: loading ? 'none' : '0 0 28px rgba(249,115,22,0.35)', transition: 'all 0.2s ease',
                }}>
                {loading ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> Sending OTP…</> : <>Send Reset OTP <ArrowRight size={17} /></>}
              </motion.button>
            </motion.form>
          )}

          {!success && step === 2 && (
            <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleResetPassword} noValidate>
              
              <InputField 
                label="6-Digit OTP" value={otp} onChange={setOtp} type="text" maxLength={6}
                placeholder="000000" icon={<Mail size={15} />}
                error={fieldErrors.otp} autoComplete="one-time-code" setFieldErrors={setFieldErrors}
              />

              {/* Password with strength meter */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color={fieldErrors.password ? '#f87171' : 'rgba(255,255,255,0.3)'} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" autoComplete="new-password"
                    style={{ width: '100%', height: 44, background: 'rgba(255,255,255,0.05)', border: `1px solid ${fieldErrors.password ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, padding: '0 42px 0 38px', fontSize: 14, color: '#f0f4ff', outline: 'none', transition: 'border-color 0.15s ease' }}
                    onFocus={e => { if (!fieldErrors.password) e.target.style.borderColor = 'rgba(249,115,22,0.5)' }} onBlur={e  => { if (!fieldErrors.password) e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
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
                  <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" autoComplete="new-password"
                    style={{ width: '100%', height: 44, background: 'rgba(255,255,255,0.05)', border: `1px solid ${fieldErrors.confirmPassword ? 'rgba(239,68,68,0.5)' : confirmPassword && confirmPassword === password ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, padding: '0 42px 0 38px', fontSize: 14, color: '#f0f4ff', outline: 'none', transition: 'border-color 0.15s ease' }}
                    onFocus={e => { if (!fieldErrors.confirmPassword) e.target.style.borderColor = 'rgba(249,115,22,0.5)' }} onBlur={e  => { if (!fieldErrors.confirmPassword && !(confirmPassword && confirmPassword === password)) e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  {confirmPassword && confirmPassword === password && <CheckCircle size={15} color="#22c55e" style={{ position: 'absolute', right: 36, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />}
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
                {loading ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> Resetting…</> : <><CheckCircle size={17} /> Reset Password</>}
              </motion.button>
            </motion.form>
          )}

        </div>

        {/* Navigation Links */}
        <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', justifyContent: 'center', gap: 20 }}>
          {step === 2 && (
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <ArrowLeft size={14} /> Back to email
            </button>
          )}
          <Link to="/login" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>

      </motion.div>
    </div>
  )
}
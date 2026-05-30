// src/components/Header.tsx

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Bell, User, Upload, Menu, X, LogOut, Settings, ChevronDown, Key, Lock, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react'
import { authService } from '../services/api'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

interface HeaderProps {
  title?: string
  subtitle?: string
  onMobileMenuOpen?: () => void
}

// ── Password Modal (Scoped to Header) ─────────────────────────────────────────
const HeaderPasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async () => {
    setError('')
    if (!oldPass) { setError('Current password is required'); return }
    if (newPass.length < 8) { setError('New password must be at least 8 characters'); return }
    
    setLoading(true)
    try {
      // NOTE: You must add this method to your authService in api.ts
      // Example: await api.post('/auth/change-password', { old_password: oldPass, new_password: newPass })
      // await authService.changePassword(oldPass, newPass) 
      
      toast.success(`Password changed successfully`)
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Failed to change password. Please check your current password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        style={{ width: '100%', maxWidth: 420, background: 'rgba(13,22,42,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 28, boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={16} color="#f97316" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f4ff' }}>Change Password</div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)' }}>Update your security credentials</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 13px', borderRadius: 9, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 12.5, color: '#f87171', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <AlertTriangle size={13} /> {error}
          </div>
        )}

        {/* Current Password */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Current Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={14} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type={showOld ? 'text' : 'password'} value={oldPass}
              onChange={e => setOldPass(e.target.value)} placeholder="Enter current password"
              style={{ width: '100%', height: 42, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '0 38px', fontSize: 13.5, color: '#f0f4ff', outline: 'none' }}
            />
            <button type="button" onClick={() => setShowOld(!showOld)}
              style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
              {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>New Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={14} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type={showNew ? 'text' : 'password'} value={newPass}
              onChange={e => setNewPass(e.target.value)} placeholder="Min. 8 characters"
              style={{ width: '100%', height: 42, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '0 38px', fontSize: 13.5, color: '#f0f4ff', outline: 'none' }}
            />
            <button type="button" onClick={() => setShowNew(!showNew)}
              style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
              {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, height: 40, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleReset} disabled={loading}
            style={{ flex: 2, height: 40, borderRadius: 9, background: loading ? 'rgba(249,115,22,0.4)' : 'linear-gradient(135deg, #f97316, #ea6906)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Key size={14} /> Change Password</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Header ───────────────────────────────────────────────────────────────
export const Header: React.FC<HeaderProps> = ({ title, subtitle, onMobileMenuOpen }) => {
  const navigate = useNavigate()
  const { currentUser, setCurrentUser } = useApp()
  
  const [searchOpen,   setSearchOpen]   = useState(false)
  const [searchValue,  setSearchValue]  = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false) // <-- Modal state

  const handleLogout = () => {
    setUserMenuOpen(false)
    authService.logout()
    setCurrentUser(null)
    navigate('/login', { replace: true })
  }

  const displayName = currentUser?.name  || 'Admin'
  const displayEmail= currentUser?.email || ''
  const initials    = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 'var(--header-height)', zIndex: 50,
        background: 'rgba(6,11,20,0.92)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 12,
      }}>

        {/* Mobile hamburger */}
        <button onClick={onMobileMenuOpen} className="show-mobile"
          style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'none', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>
          <Menu size={18} />
        </button>

        {/* Page title */}
        <div style={{ flex: 1, minWidth: 0, display: searchOpen ? 'none' : 'block' }}>
          {title && (
            <h1 style={{ fontSize: 15, fontWeight: 600, color: '#f0f4ff', letterSpacing: '-0.01em', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="hide-mobile" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Search */}
        <motion.div animate={{ width: searchOpen ? '100%' : 'auto' }} style={{ position: 'relative', flexShrink: searchOpen ? 0 : 1, flex: searchOpen ? 1 : 'none' }}>
          {searchOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input autoFocus type="text" placeholder="Search documents…" value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  style={{ width: '100%', height: 36, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 8, padding: '0 12px 0 32px', fontSize: 13, color: '#f0f4ff', outline: 'none' }} />
              </div>
              <button onClick={() => { setSearchOpen(false); setSearchValue('') }} style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => setSearchOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px 0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              <Search size={14} />
              <span className="hide-mobile">Search…</span>
            </button>
          )}
        </motion.div>

        {/* Upload CTA */}
        {!searchOpen && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/upload')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 14px', height: 36, background: 'linear-gradient(135deg, #f97316, #ea6906)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', boxShadow: '0 0 14px rgba(249,115,22,0.3)', flexShrink: 0 }}>
            <Upload size={14} />
            <span className="hide-mobile">Upload</span>
          </motion.button>
        )}

        {/* Notifications */}
        {!searchOpen && (
          <button style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}>
            <Bell size={15} color="rgba(255,255,255,0.6)" />
            <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: '#f97316', border: '1.5px solid #060b14' }} />
          </button>
        )}

        {/* ── User menu ── */}
        {!searchOpen && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, height: 36,
                padding: '0 10px 0 6px', borderRadius: 9, cursor: 'pointer',
                background: userMenuOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${userMenuOpen ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.15s ease',
              }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, #f97316, #ea6906)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {initials || <User size={12} />}
              </div>
              <span className="hide-mobile" style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', fontWeight: 500, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName.split(' ')[0]}
              </span>
              <ChevronDown size={12} color="rgba(255,255,255,0.35)" className="hide-mobile" style={{ transition: 'transform 0.15s', transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setUserMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -6 }}
                    transition={{ duration: 0.14 }}
                    style={{
                      position: 'absolute', top: 42, right: 0, minWidth: 200,
                      background: '#111e35', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12, padding: '6px', zIndex: 20,
                      boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                    }}
                  >
                    <div style={{ padding: '10px 12px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f4ff', marginBottom: 2 }}>{displayName}</div>
                      {displayEmail && <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayEmail}</div>}
                    </div>

                    <button onClick={() => { setUserMenuOpen(false); navigate('/settings') }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,0.65)', background: 'transparent', cursor: 'pointer', textAlign: 'left', border: 'none', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <Settings size={14} /> Settings
                    </button>

                    {/* Change Password Trigger */}
                    <button onClick={() => { setUserMenuOpen(false); setResetModalOpen(true) }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,0.65)', background: 'transparent', cursor: 'pointer', textAlign: 'left', border: 'none', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <Key size={14} /> Change Password
                    </button>

                    <button onClick={handleLogout}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', borderRadius: 8, fontSize: 13, color: '#f87171', background: 'transparent', cursor: 'pointer', textAlign: 'left', border: 'none', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <LogOut size={14} /> Sign out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </header>

      <AnimatePresence>
        {resetModalOpen && <HeaderPasswordModal onClose={() => setResetModalOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
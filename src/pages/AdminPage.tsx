// src/pages/AdminPage.tsx
import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Search, Trash2, Key, Crown, User as UserIcon,
  X, Check, AlertTriangle, Loader2, RefreshCw,
  Eye, EyeOff, MoreVertical, UserCheck, UserX, Lock
} from 'lucide-react'
import { Layout } from '../components/Layout'
import { adminService } from '../services/api'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

interface AdminUser {
  id: string
  email: string
  fullName: string
  isActive: boolean
  isSuperuser: boolean
  createdAt: string
}

// ── Role Badge ────────────────────────────────────────────────────────────────
const RoleBadge: React.FC<{ isSuperuser: boolean; size?: 'sm' | 'md' }> = ({ isSuperuser, size = 'md' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: size === 'md' ? 5 : 4,
    padding: size === 'md' ? '4px 10px' : '2px 7px',
    borderRadius: 6, fontSize: size === 'md' ? 11.5 : 10, fontWeight: 700,
    background: isSuperuser ? 'rgba(249,115,22,0.15)' : 'rgba(59,130,246,0.12)',
    color: isSuperuser ? '#f97316' : '#60a5fa',
    border: `1px solid ${isSuperuser ? 'rgba(249,115,22,0.35)' : 'rgba(59,130,246,0.25)'}`,
    letterSpacing: '0.04em', textTransform: 'uppercase' as const,
  }}>
    {isSuperuser ? <Crown size={size === 'md' ? 10 : 9} /> : <UserIcon size={size === 'md' ? 10 : 9} />}
    {isSuperuser ? 'Admin' : 'User'}
  </span>
)

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusDot: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: isActive ? '#22c55e' : '#ef4444' }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#22c55e' : '#ef4444', boxShadow: `0 0 6px ${isActive ? '#22c55e' : '#ef4444'}` }} />
    {isActive ? 'Active' : 'Inactive'}
  </span>
)

// ── Password Modal ────────────────────────────────────────────────────────────
const ResetPasswordModal: React.FC<{
  user: AdminUser | null
  onClose: () => void
}> = ({ user, onClose }) => {
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async () => {
    setError('')
    if (newPass.length < 8) { setError('Password must be at least 8 characters'); return }
    if (newPass !== confirmPass) { setError('Passwords do not match'); return }
    if (!user) return
    setLoading(true)
    try {
      await adminService.resetUserPassword(user.id, newPass)
      toast.success(`Password reset for ${user.fullName}`)
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const strength = newPass.length === 0 ? 0 : newPass.length < 8 ? 1 : newPass.length < 12 ? 2 : 3
  const strengthColors = ['transparent', '#ef4444', '#f97316', '#22c55e']
  const strengthLabels = ['', 'Weak', 'Moderate', 'Strong']

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
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f4ff' }}>Reset Password</div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)' }}>{user?.email}</div>
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

        {/* New Password */}
        <div style={{ marginBottom: 14 }}>
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
          {newPass.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: strengthColors[strength] }}>{strengthLabels[strength]}</div>
            </div>
          )}
        </div>

        {/* Confirm */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={14} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type={showConfirm ? 'text' : 'password'} value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)} placeholder="Re-enter password"
              style={{ width: '100%', height: 42, background: 'rgba(255,255,255,0.05)', border: `1px solid ${confirmPass && confirmPass !== newPass ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 9, padding: '0 38px', fontSize: 13.5, color: '#f0f4ff', outline: 'none' }}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {confirmPass && confirmPass === newPass && (
            <div style={{ marginTop: 5, fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check size={11} /> Passwords match
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, height: 40, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleReset} disabled={loading}
            style={{ flex: 2, height: 40, borderRadius: 9, background: loading ? 'rgba(249,115,22,0.4)' : 'linear-gradient(135deg, #f97316, #ea6906)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Resetting…</> : <><Key size={14} /> Reset Password</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Delete Confirm Modal ───────────────────────────────────────────────────────
const DeleteConfirmModal: React.FC<{
  user: AdminUser | null
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}> = ({ user, onClose, onConfirm, loading }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    onClick={e => { if (e.target === e.currentTarget) onClose() }}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
      style={{ width: '100%', maxWidth: 380, background: 'rgba(13,22,42,0.98)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 18, padding: 28, boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}
    >
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <Trash2 size={22} color="#f87171" />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f4ff', marginBottom: 6 }}>Delete User Account</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
          Are you sure you want to delete <span style={{ color: '#f87171', fontWeight: 600 }}>{user?.fullName}</span>? This action cannot be undone.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} style={{ flex: 1, height: 40, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
        <button onClick={onConfirm} disabled={loading}
          style={{ flex: 1, height: 40, borderRadius: 9, background: loading ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.85)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />} Delete
        </button>
      </div>
    </motion.div>
  </motion.div>
)

// ── User Row ──────────────────────────────────────────────────────────────────
const UserRow: React.FC<{
  user: AdminUser
  currentUserId?: string
  onResetPassword: (u: AdminUser) => void
  onDelete: (u: AdminUser) => void
  onToggleRole: (u: AdminUser) => void
  onToggleActive: (u: AdminUser) => void
}> = ({ user, currentUserId, onResetPassword, onDelete, onToggleRole, onToggleActive }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const isSelf = user.id === currentUserId

  const initials = user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const avatarColor = user.isSuperuser
    ? 'linear-gradient(135deg, #f97316, #ea580c)'
    : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'

  return (
    <motion.div
      layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: isSelf ? 'rgba(249,115,22,0.03)' : 'transparent',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => { if (!isSelf) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)' }}
      onMouseLeave={e => { if (!isSelf) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
    >
      {/* Avatar */}
      <div style={{ width: 38, height: 38, borderRadius: 10, background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: user.isSuperuser ? '0 0 12px rgba(249,115,22,0.3)' : '0 0 8px rgba(59,130,246,0.2)' }}>
        {initials}
      </div>

      {/* Name + email */}
      <div style={{ flex: '1 1 160px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#f0f4ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.fullName}</span>
          {isSelf && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(249,115,22,0.15)', color: '#f97316', fontWeight: 700, letterSpacing: '0.06em', flexShrink: 0 }}>YOU</span>}
        </div>
        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{user.email}</div>
      </div>

      {/* Role badge */}
      <div style={{ flexShrink: 0 }}>
        <RoleBadge isSuperuser={user.isSuperuser} />
      </div>

      {/* Status */}
      <div style={{ flexShrink: 0, minWidth: 60 }}>
        <StatusDot isActive={user.isActive} />
      </div>

      {/* Joined */}
      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', flexShrink: 0, minWidth: 80 }}>
        {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
      </div>

      {/* Actions */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button onClick={() => setMenuOpen(!menuOpen)}
          style={{ width: 32, height: 32, borderRadius: 8, background: menuOpen ? 'rgba(255,255,255,0.08)' : 'transparent', border: '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={e => { if (!menuOpen) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent' } }}>
          <MoreVertical size={15} />
        </button>
        <AnimatePresence>
          {menuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.1 }}
                style={{ position: 'absolute', top: 36, right: 0, background: '#0d1628', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, padding: 5, zIndex: 20, minWidth: 190, boxShadow: '0 12px 40px rgba(0,0,0,0.7)' }}
              >
                {[
                  { icon: <Key size={13} />, label: 'Reset Password', fn: () => { setMenuOpen(false); onResetPassword(user) }, danger: false },
                  {
                    icon: user.isSuperuser ? <UserIcon size={13} /> : <Crown size={13} />,
                    label: user.isSuperuser ? 'Demote to User' : 'Promote to Admin',
                    fn: () => { setMenuOpen(false); onToggleRole(user) }, danger: false
                  },
                  {
                    icon: user.isActive ? <UserX size={13} /> : <UserCheck size={13} />,
                    label: user.isActive ? 'Deactivate Account' : 'Activate Account',
                    fn: () => { setMenuOpen(false); onToggleActive(user) }, danger: user.isActive
                  },
                  { icon: <Trash2 size={13} />, label: 'Delete User', fn: () => { setMenuOpen(false); onDelete(user) }, danger: true },
             ].map((item, i) => {
                  // Catch all destructive actions for the current user
                  const isActionDisabled = isSelf && (item.label === 'Delete User' || item.label === 'Deactivate Account' || item.label === 'Demote to User');
                  
                  return (
                    <button key={i} onClick={item.fn} disabled={isActionDisabled}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 11px', borderRadius: 8, fontSize: 12.5, color: item.danger ? '#f87171' : 'rgba(255,255,255,0.75)', background: 'transparent', cursor: isActionDisabled ? 'not-allowed' : 'pointer', opacity: isActionDisabled ? 0.3 : 1, transition: 'background 0.1s', textAlign: 'left' as const, border: 'none' }}
                      onMouseEnter={e => { if (!isActionDisabled) (e.currentTarget as HTMLButtonElement).style.background = item.danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
                      {item.icon} {item.label}
                    </button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Main Admin Page ───────────────────────────────────────────────────────────
export const AdminPage: React.FC = () => {
  const { currentUser } = useApp()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await adminService.getAllUsers()
      setUsers(data)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  // Find current user's ID from the loaded list
  const currentUserId = useMemo(
    () => users.find(u => u.email === currentUser?.email)?.id,
    [users, currentUser]
  )

  const filtered = useMemo(() => {
    let list = [...users]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(u => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    }
    if (roleFilter !== 'all') list = list.filter(u => roleFilter === 'admin' ? u.isSuperuser : !u.isSuperuser)
    if (statusFilter !== 'all') list = list.filter(u => statusFilter === 'active' ? u.isActive : !u.isActive)
    return list
  }, [users, search, roleFilter, statusFilter])

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.isSuperuser).length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
  }), [users])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await adminService.deleteUser(deleteTarget.id)
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id))
      toast.success(`${deleteTarget.fullName} deleted`)
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? 'Delete failed')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleToggleRole = async (user: AdminUser) => {
    const newRole = !user.isSuperuser
    try {
      await adminService.updateUserRole(user.id, newRole)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isSuperuser: newRole } : u))
      toast.success(`${user.fullName} is now ${newRole ? 'an Admin' : 'a regular User'}`)
    } catch {
      toast.error('Failed to update role')
    }
  }

  const handleToggleActive = async (user: AdminUser) => {
    const newStatus = !user.isActive
    try {
      await adminService.updateUserStatus(user.id, newStatus)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: newStatus } : u))
      toast.success(`${user.fullName} ${newStatus ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <Layout title="Admin Panel" subtitle="User management & access control">
      {/* ── Stats Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Users', value: stats.total, color: '#3b82f6', icon: <Users size={16} color="#3b82f6" /> },
          { label: 'Admins', value: stats.admins, color: '#f97316', icon: <Crown size={16} color="#f97316" /> },
          { label: 'Active', value: stats.active, color: '#22c55e', icon: <UserCheck size={16} color="#22c55e" /> },
          { label: 'Inactive', value: stats.inactive, color: '#ef4444', icon: <UserX size={16} color="#ef4444" /> },
        ].map(stat => (
          <motion.div key={stat.label} whileHover={{ y: -2 }}
            style={{ background: 'rgba(21,34,64,0.85)', border: `1px solid rgba(${stat.color === '#f97316' ? '249,115,22' : stat.color === '#22c55e' ? '34,197,94' : stat.color === '#ef4444' ? '239,68,68' : '59,130,246'},0.15)`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: `rgba(${stat.color === '#f97316' ? '249,115,22' : stat.color === '#22c55e' ? '34,197,94' : stat.color === '#ef4444' ? '239,68,68' : '59,130,246'},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 0 }}>
          <Search size={13} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Search by name or email…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', height: 36, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, padding: '0 32px', fontSize: 12.5, color: '#f0f4ff', outline: 'none' }} />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Role filter */}
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)}
          style={{ height: 36, padding: '0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, fontSize: 12.5, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
          {[['all', 'All Roles'], ['admin', '👑 Admins'], ['user', '👤 Users']].map(([v, l]) => (
            <option key={v} value={v} style={{ background: '#1a2b4e' }}>{l}</option>
          ))}
        </select>

        {/* Status filter */}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
          style={{ height: 36, padding: '0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, fontSize: 12.5, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
          {[['all', 'All Status'], ['active', '🟢 Active'], ['inactive', '🔴 Inactive']].map(([v, l]) => (
            <option key={v} value={v} style={{ background: '#1a2b4e' }}>{l}</option>
          ))}
        </select>

        {/* Refresh */}
        <button onClick={loadUsers}
          style={{ height: 36, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#f97316'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* ── Table ── */}
      <div style={{ background: 'rgba(13,22,42,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14}}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ width: 38, flexShrink: 0 }} />
          <div style={{ flex: '1 1 160px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>User</div>
          <div style={{ width: 80, flexShrink: 0, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Role</div>
          <div style={{ width: 70, flexShrink: 0, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</div>
          <div style={{ width: 90, flexShrink: 0, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Joined</div>
          <div style={{ width: 32, flexShrink: 0 }} />
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'rgba(255,255,255,0.3)' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: 10 }} />
            <div style={{ fontSize: 13 }}>Loading users…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 56, color: 'rgba(255,255,255,0.25)' }}>
            <Users size={32} style={{ marginBottom: 10, opacity: 0.4 }} />
            <div style={{ fontSize: 13 }}>No users found</div>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map(user => (
              <UserRow
                key={user.id}
                user={user}
                currentUserId={currentUserId}
                onResetPassword={setResetTarget}
                onDelete={setDeleteTarget}
                onToggleRole={handleToggleRole}
                onToggleActive={handleToggleActive}
              />
            ))}
          </AnimatePresence>
        )}

        {/* Footer count */}
        {!loading && (
          <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            Showing {filtered.length} of {users.length} users
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {resetTarget && <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />}
        {deleteTarget && (
          <DeleteConfirmModal
            user={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>
    </Layout>
  )
}
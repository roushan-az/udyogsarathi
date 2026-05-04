
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Bell, User, Upload, Menu, X } from 'lucide-react'

interface HeaderProps {
  title?: string
  subtitle?: string
  onMobileMenuOpen?: () => void
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onMobileMenuOpen }) => {
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  return (
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
      <button
        onClick={onMobileMenuOpen}
        className="show-mobile"
        style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          display: 'none', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.6)', flexShrink: 0,
        }}
      >
        <Menu size={18} />
      </button>

      {/* Page title — hide on mobile when search open */}
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

      {/* Search — expands full width on mobile */}
      <motion.div animate={{ width: searchOpen ? '100%' : 'auto' }} style={{ position: 'relative', flexShrink: searchOpen ? 0 : 1, flex: searchOpen ? 1 : 'none' }}>
        {searchOpen ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input autoFocus type="text" placeholder="Search documents..." value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                style={{ width: '100%', height: 36, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 8, padding: '0 12px 0 32px', fontSize: 13, color: '#f0f4ff', outline: 'none' }} />
            </div>
            <button onClick={() => { setSearchOpen(false); setSearchValue(''); }} style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
              <X size={16} />
            </button>
          </div>
        ) : (
          <button onClick={() => setSearchOpen(true)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            height: 36, padding: '0 12px 0 10px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, color: 'rgba(255,255,255,0.4)', fontSize: 13,
          }}>
            <Search size={14} />
            <span className="hide-mobile">Search...</span>
          </button>
        )}
      </motion.div>

      {/* Upload CTA — icon only on mobile */}
      {!searchOpen && (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/upload')}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '0 14px', height: 36,
            background: 'linear-gradient(135deg, #f97316, #ea6906)',
            border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff',
            cursor: 'pointer', boxShadow: '0 0 14px rgba(249,115,22,0.3)', flexShrink: 0,
          }}>
          <Upload size={14} />
          <span className="hide-mobile">Upload</span>
        </motion.button>
      )}

      {/* Notifications */}
      {!searchOpen && (
        <button style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}>
          <Bell size={15} color="rgba(255,255,255,0.6)" />
          <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: '#f97316', border: '1.5px solid #060b14' }} />
        </button>
      )}

      {/* Avatar */}
      {!searchOpen && (
        <button style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <User size={15} color="#fff" />
        </button>
      )}
    </header>
  )
}
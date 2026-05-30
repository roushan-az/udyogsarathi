// src/components/Sidebar.tsx

import React from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Upload, FolderOpen, BarChart3, Settings,
  ChevronLeft, ChevronRight, Building2, Database, X,
  Shield
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { DocumentCategory } from '../types'

const CATEGORIES_BASE: { label: DocumentCategory; color: string }[] = [
  { label: 'Sales',     color: '#f97316' },
  { label: 'Purchase',  color: '#3b82f6' },
  { label: 'Inventory', color: '#22c55e' },
  { label: 'HR',        color: '#a855f7' },
  { label: 'Finance',   color: '#14b8a6' },
  { label: 'Legal',     color: '#ef4444' },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ onMobileClose }) => {
  const { sidebarCollapsed, setSidebarCollapsed, filters, setFilters, currentUser } = useApp()
  const location = useLocation()
  const navigate = useNavigate()

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
  const showExpanded = isMobile ? true : !sidebarCollapsed

  // Dynamically build NAV_ITEMS based on user role (No duplicate global declaration)
  const NAV_ITEMS = [
    { to: '/',           icon: LayoutDashboard, label: 'Dashboard'      },
    { to: '/upload',     icon: Upload,          label: 'Upload Document' },
    { to: '/documents',  icon: FolderOpen,      label: 'Documents'      },
    { to: '/analytics',  icon: BarChart3,       label: 'Analytics'      },
    { to: '/settings',   icon: Settings,        label: 'Settings'       },
  ]

  if (currentUser?.is_superuser) {
    NAV_ITEMS.push({ to: '/admin', icon: Shield, label: 'Admin Panel' })
  }

  const handleCategoryClick = (_e: React.MouseEvent, categoryLabel: DocumentCategory) => {
    setFilters({ ...filters, category: categoryLabel })
    navigate(`/documents?category=${encodeURIComponent(categoryLabel)}`)
    if (onMobileClose) onMobileClose()
  }

  const handleNavClick = (to: string) => {
    if (to === '/documents') {
      const resetFilters = { ...filters, category: 'All' as any }
      setFilters(resetFilters)
    }
    if (onMobileClose) onMobileClose()
  }

  const sidebarContent = (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'linear-gradient(180deg, #0a1323 0%, #080f1e 100%)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
      width: '100%',
    }}>
      {/* Logo */}
      <div style={{
        height: 'var(--header-height)', display: 'flex', alignItems: 'center',
        padding: showExpanded ? '0 20px' : '0 18px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        gap: 12, flexShrink: 0, justifyContent: showExpanded ? 'flex-start' : 'center',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #f97316, #fb923c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 0 16px rgba(249,115,22,0.4)',
        }}>
          <Building2 size={17} color="#fff" />
        </div>
        <AnimatePresence>
          {showExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#f0f4ff', letterSpacing: '-0.01em' }}>
                Udyog Sarathi
              </div>
              <div style={{
                fontSize: 9.5, color: '#f97316', fontFamily: 'var(--font-mono)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                Enterprise DMS
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {isMobile && (
          <button onClick={onMobileClose} style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
        {showExpanded && (
          <div style={{
            fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.22)',
            letterSpacing: '0.14em', textTransform: 'uppercase', padding: '0 8px 8px',
          }}>Menu</div>
        )}
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <NavLink key={to} to={to} style={{ textDecoration: 'none', display: 'block' }} onClick={() => handleNavClick(to)}>
              <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }} style={{
                display: 'flex', alignItems: 'center',
                gap: showExpanded ? 10 : 0,
                justifyContent: showExpanded ? 'flex-start' : 'center',
                padding: showExpanded ? '9px 10px' : '10px 0',
                borderRadius: 10, marginBottom: 2,
                background: isActive ? 'linear-gradient(135deg,rgba(249,115,22,0.18),rgba(249,115,22,0.08))' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(249,115,22,0.25)' : 'transparent'}`,
                position: 'relative', overflow: 'hidden',
              }} title={!showExpanded ? label : undefined}>
                {isActive && (
                  <motion.div layoutId="nav-pill" style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 3, borderRadius: '0 3px 3px 0', background: '#f97316',
                    boxShadow: '0 0 8px rgba(249,115,22,0.6)',
                  }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                )}
                <Icon size={18} color={isActive ? '#f97316' : 'rgba(255,255,255,0.45)'} style={{ flexShrink: 0 }} />
                <AnimatePresence>
                  {showExpanded && (
                    <motion.span
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ fontSize: 13.5, fontWeight: isActive ? 600 : 400, color: isActive ? '#f97316' : 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}
                    >{label}</motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </NavLink>
          )
        })}

        {/* Categories */}
        <AnimatePresence>
          {showExpanded && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginTop: 22 }}>
              <div style={{
                fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.22)',
                letterSpacing: '0.14em', textTransform: 'uppercase', padding: '0 8px 8px',
              }}>Categories</div>
              {CATEGORIES_BASE.map(({ label, color }) => {
                return (
                  <div key={label} style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }} onClick={(e) => handleCategoryClick(e, label)}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 10px', borderRadius: 8, marginBottom: 1, cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 5px ${color}` }} />
                      <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', flex: 1 }}>{label}</span>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {showExpanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ margin: '0 10px 10px', padding: '10px 12px', borderRadius: 10, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Database size={12} color="#22c55e" />
              <span style={{ fontSize: 11.5, color: '#22c55e', fontWeight: 600 }}>System Online</span>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>PostgreSQL · Cloud Storage</div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isMobile && (
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none',
          height: 44, borderTop: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
          color: 'rgba(255,255,255,0.35)', transition: 'color 0.15s ease, background 0.15s ease', flexShrink: 0,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f97316'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(249,115,22,0.06)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
          {sidebarCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      )}
    </div>
  )

  return sidebarContent
}
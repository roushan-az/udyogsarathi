
import type { ReactNode } from 'react'
import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useApp } from '../context/AppContext'

interface LayoutProps { children: ReactNode; title?: string; subtitle?: string }

export const Layout: React.FC<LayoutProps> = ({ children, title, subtitle }) => {
  const { sidebarCollapsed } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth <= 768)
    if (window.innerWidth > 768) setMobileOpen(false)
  }, [])

  useEffect(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [checkMobile])

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const desktopSidebarWidth = sidebarCollapsed
    ? 'var(--sidebar-collapsed-width)'
    : 'var(--sidebar-width)'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)' }}>
      {/* Background decoration */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '20%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      {/* ── DESKTOP: fixed sidebar ── */}
      {!isMobile && (
        <motion.div
          animate={{ width: desktopSidebarWidth }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100, overflow: 'hidden', flexShrink: 0 }}
        >
          <Sidebar />
        </motion.div>
      )}

      {/* ── MOBILE: overlay drawer ── */}
      {isMobile && (
        <>
          {/* Backdrop */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 98, backdropFilter: 'blur(3px)' }}
              />
            )}
          </AnimatePresence>
          {/* Drawer */}
          <motion.div
            animate={{ x: mobileOpen ? 0 : '-100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 'var(--sidebar-width)', zIndex: 99, willChange: 'transform' }}
          >
            <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
          </motion.div>
        </>
      )}

      {/* ── Main content ── */}
      <motion.main
        animate={{ marginLeft: isMobile ? 0 : desktopSidebarWidth }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1, minWidth: 0 }}
      >
        <Header title={title} subtitle={subtitle} onMobileMenuOpen={() => setMobileOpen(true)} />

        <div style={{ flex: 1, padding: `calc(var(--header-height) + 20px) var(--page-padding) var(--page-padding)`, maxWidth: '100%', overflowX: 'hidden' }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
            {children}
          </motion.div>
        </div>
      </motion.main>
    </div>
  )
}
// src/pages/SettingsPage.tsx

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cloud, Database, Server, Shield, Bell, Palette, Save, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { Layout } from '../components/Layout'
import { healthService, type HealthStatus } from '../services/api'
import toast from 'react-hot-toast'

// ── Reusable sub-components ───────────────────────────────────────────────────

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; delay?: number }> = ({ title, icon, children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    style={{ background: 'rgba(21,34,64,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden', marginBottom: 20 }}>
    <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ color: '#f97316' }}>{icon}</span>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f0f4ff' }}>{title}</h3>
    </div>
    <div style={{ padding: '20px 24px' }}>{children}</div>
  </motion.div>
)

const Field: React.FC<{ label: string; value: string; onChange?: (v: string) => void; mono?: boolean; readOnly?: boolean; placeholder?: string }> = ({ label, value, onChange, mono, readOnly, placeholder }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
    <input type="text" value={value} onChange={e => onChange?.(e.target.value)} readOnly={readOnly} placeholder={placeholder}
      style={{ width: '100%', height: 40, background: readOnly ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', border: `1px solid ${readOnly ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 9, padding: '0 14px', fontSize: 13, color: readOnly ? 'rgba(255,255,255,0.4)' : '#f0f4ff', fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', outline: 'none', cursor: readOnly ? 'default' : 'text' }} />
  </div>
)

const Toggle: React.FC<{ label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, sub, checked, onChange }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
    <div>
      <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{sub}</div>}
    </div>
    <button onClick={() => onChange(!checked)}
      style={{ width: 44, height: 24, borderRadius: 12, background: checked ? 'rgba(249,115,22,0.8)' : 'rgba(255,255,255,0.1)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.2s ease', flexShrink: 0 }}>
      <motion.div animate={{ x: checked ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
    </button>
  </div>
)

const ConnPill: React.FC<{ ok: boolean | null; label: string }> = ({ ok, label }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: ok === null ? 'rgba(255,255,255,0.06)' : ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: ok === null ? 'rgba(255,255,255,0.4)' : ok ? '#4ade80' : '#f87171', border: `1px solid ${ok === null ? 'rgba(255,255,255,0.08)' : ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
    {ok === null ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : ok ? <CheckCircle size={11} /> : <XCircle size={11} />}
    {label}
  </span>
)

export const SettingsPage: React.FC = () => {
  // Corrected fallbacks to point directly to Cloudflare R2 configurations from your framework setup
  const [storageAccount, setStorageAccount] = useState(import.meta.env.VITE_R2_ACCOUNT_ID || '74a3ad8b6d42ad00c97803ed2a068ebb')
  const [storageBucket,  setStorageBucket]  = useState(import.meta.env.VITE_R2_BUCKET_NAME || 'udyog-sarathi-docs')
  const [pgHost,         setPgHost]         = useState(import.meta.env.VITE_PG_HOST         || 'aws-1-ap-southeast-1.pooler.supabase.com')
  const [pgDb,           setPgDb]           = useState(import.meta.env.VITE_PG_DB           || 'postgres')
  const [apiUrl,         setApiUrl]         = useState(import.meta.env.VITE_API_URL         || 'http://localhost:8000/api')

  const [notifyUpload, setNotifyUpload] = useState(true)
  const [notifyFail,   setNotifyFail]   = useState(true)
  const [autoRetry,    setAutoRetry]    = useState(false)
  const [saving,       setSaving]       = useState(false)

  const [health,         setHealth]         = useState<HealthStatus | null>(null)
  const [healthLoading,  setHealthLoading]  = useState(false)

  const fetchHealth = async () => {
    setHealthLoading(true)
    try {
      const h = await healthService.check()
      setHealth(h)
    } catch {
      setHealth({ status: 'degraded', version: '—', database: false, storage: false })
    } finally {
      setHealthLoading(false)
    }
  }

  useEffect(() => { fetchHealth() }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      localStorage.setItem('us_notify_upload', String(notifyUpload))
      localStorage.setItem('us_notify_fail',   String(notifyFail))
      localStorage.setItem('us_auto_retry',    String(autoRetry))
      await new Promise(r => setTimeout(r, 400))
      toast.success('Settings saved locally')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    setNotifyUpload(localStorage.getItem('us_notify_upload') !== 'false')
    setNotifyFail(localStorage.getItem('us_notify_fail') !== 'false')
    setAutoRetry(localStorage.getItem('us_auto_retry') === 'true')
  }, [])

  return (
    <Layout title="Settings" subtitle="Cloud services, notifications and app configuration">
      <div style={{ maxWidth: 720 }}>

        {/* ── Service health ────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(21,34,64,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '18px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f4ff', marginBottom: 6 }}>Service Health</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <ConnPill ok={health ? health.database : null} label="PostgreSQL" />
              <ConnPill ok={health ? health.storage  : null} label="Cloud Storage (R2)" />
              <ConnPill ok={health ? health.status === 'healthy' : null} label={health ? `v${health.version}` : 'API'} />
            </div>
          </div>
          <button onClick={fetchHealth} disabled={healthLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: 12.5, cursor: 'pointer', flexShrink: 0 }}>
            <RefreshCw size={13} style={{ animation: healthLoading ? 'spin 1s linear infinite' : 'none' }} />
            Recheck
          </button>
        </motion.div>

        {/* ── Cloud Storage ─────────────────────────────────────────────────── */}
        <Section title="Cloud Storage (Cloudflare R2)" icon={<Cloud size={16} />} delay={0.06}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
            <Field label="R2 Account ID" value={storageAccount} onChange={setStorageAccount} mono />
            <Field label="R2 Bucket Name"   value={storageBucket}  onChange={setStorageBucket} />
          </div>
          {/* Updated template computation to point specifically to your R2 cluster endpoint layout */}
          <Field label="Endpoint (computed)" value={`https://${storageAccount}.r2.cloudflarestorage.com/${storageBucket}`} readOnly mono />
          <div style={{ padding: '10px 14px', borderRadius: 9, background: health?.storage ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)', border: `1px solid ${health?.storage ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: health?.storage ? '#4ade80' : '#f87171' }}>
            {health?.storage ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {health?.storage ? 'Connected — Cloud Storage reachable' : 'Cannot reach Cloud Storage — check R2 setup'}
          </div>
        </Section>

        {/* ── PostgreSQL ────────────────────────────────────────────────────── */}
        <Section title="PostgreSQL — Supabase Pooler" icon={<Database size={16} />} delay={0.12}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
            <Field label="Host"     value={pgHost} onChange={setPgHost} mono />
            <Field label="Database" value={pgDb}   onChange={setPgDb} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Port"      value="5432"    readOnly mono />
            <Field label="Pool Mode" value="Session" readOnly />
          </div>
          <Field label="SQLAlchemy async URL" value={`postgresql+asyncpg://postgres.yybhcpewgltzanlfpkvt@${pgHost}:5432/${pgDb}`} readOnly mono />
          <div style={{ padding: '10px 14px', borderRadius: 9, background: health?.database ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)', border: `1px solid ${health?.database ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: health?.database ? '#4ade80' : '#f87171' }}>
            {health?.database ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {health?.database ? 'Connected — PostgreSQL responding' : 'Cannot reach PostgreSQL — verify DATABASE_URL'}
          </div>
        </Section>

        {/* ── FastAPI ───────────────────────────────────────────────────────── */}
        <Section title="FastAPI Backend" icon={<Server size={16} />} delay={0.18}>
          <Field label="API Base URL" value={apiUrl} onChange={setApiUrl} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Environment" value="Development" readOnly />
            <Field label="Runtime"     value="Python 3.12" readOnly />
          </div>
          <div style={{ padding: '10px 14px', borderRadius: 9, background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 12.5, color: '#93c5fd', lineHeight: 1.6 }}>
            <strong>Fail-safe active:</strong> If PostgreSQL INSERT fails after storage upload, the document is deleted from Cloud Storage automatically — no orphaned files.
          </div>
        </Section>

        {/* ── Security ─────────────────────────────────────────────────────── */}
        <Section title="Security" icon={<Shield size={16} />} delay={0.24}>
          <Toggle label="JWT Bearer authentication"   sub="Validated on every FastAPI endpoint" checked={true} onChange={() => toast('JWT auth is always enabled')} />
          <Toggle label="Storage SSE at rest"         sub="Provider-managed encryption keys"    checked={true} onChange={() => toast('Encryption is always on')} />
          <Toggle label="CORS whitelist"              sub="Only React Static Web App origin"    checked={true} onChange={() => {}} />
          <Toggle label="Auto-rollback on DB failure" sub="Delete blob if PostgreSQL transaction fails" checked={autoRetry} onChange={setAutoRetry} />
        </Section>

        {/* ── Notifications ─────────────────────────────────────────────────── */}
        <Section title="Notifications" icon={<Bell size={16} />} delay={0.3}>
          <Toggle label="Notify on successful upload" sub="Toast notification on every successful upload" checked={notifyUpload} onChange={setNotifyUpload} />
          <Toggle label="Notify on upload failure"    sub="Error details + rollback confirmation"         checked={notifyFail}   onChange={setNotifyFail} />
        </Section>

        {/* ── Appearance ───────────────────────────────────────────────────── */}
        <Section title="Appearance" icon={<Palette size={16} />} delay={0.36}>
          <Toggle label="Dark mode" sub="Deep navy enterprise theme (always on)" checked={true} onChange={() => toast('Dark mode is always on 🌑')} />
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
            Colour scheme: Saffron · Azure · Deep Navy
          </div>
        </Section>

        {/* ── Save ─────────────────────────────────────────────────────────── */}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: saving ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#f97316,#ea6906)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, color: saving ? 'rgba(255,255,255,0.3)' : '#fff', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 0 24px rgba(249,115,22,0.35)' }}>
          {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
          {saving ? 'Saving…' : 'Save Settings'}
        </motion.button>
      </div>
    </Layout>
  )
}
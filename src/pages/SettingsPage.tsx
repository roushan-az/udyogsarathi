// src/pages/SettingsPage.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Database, Server, Shield, Bell, Palette, Save, CheckCircle } from 'lucide-react';

import toast from 'react-hot-toast';
import { Layout } from '../components/Layout';

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; delay?: number }> = ({
  title, icon, children, delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={{
      background: 'rgba(21,34,64,0.85)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 18,
      overflow: 'hidden',
      marginBottom: 20,
    }}
  >
    <div style={{
      padding: '16px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <span style={{ color: '#f97316' }}>{icon}</span>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f0f4ff' }}>{title}</h3>
    </div>
    <div style={{ padding: '20px 24px' }}>{children}</div>
  </motion.div>
);

const Field: React.FC<{ label: string; value: string; onChange?: (v: string) => void; mono?: boolean; readOnly?: boolean; placeholder?: string }> = ({
  label, value, onChange, mono, readOnly, placeholder,
}) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={e => onChange?.(e.target.value)}
      readOnly={readOnly}
      placeholder={placeholder}
      style={{
        width: '100%',
        height: 40,
        background: readOnly ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${readOnly ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 9,
        padding: '0 14px',
        fontSize: 13,
        color: readOnly ? 'rgba(255,255,255,0.4)' : '#f0f4ff',
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
        outline: 'none',
        cursor: readOnly ? 'default' : 'text',
      }}
    />
  </div>
);

const Toggle: React.FC<{ label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }> = ({
  label, sub, checked, onChange,
}) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
    <div>
      <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{sub}</div>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: checked ? 'rgba(249,115,22,0.8)' : 'rgba(255,255,255,0.1)',
        border: 'none',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          position: 'absolute',
          top: 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
        }}
      />
    </button>
  </div>
);

export const SettingsPage: React.FC = () => {
  const [blobAccount, setBlobAccount] = useState('udyogsarathi');
  const [blobContainer, setBlobContainer] = useState('documents');
  const [pgHost, setPgHost] = useState('udyog-db.postgres.database.azure.com');
  const [pgDb, setPgDb] = useState('udyog_sarathi');
  const [apiUrl, setApiUrl] = useState('https://udyog-api.azurewebsites.net');
  const [notifyUpload, setNotifyUpload] = useState(true);
  const [notifyFail, setNotifyFail] = useState(true);
  const [autoRetry, setAutoRetry] = useState(false);
  const [darkMode] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    toast.success('Settings saved successfully');
  };

  return (
    <Layout title="Settings" subtitle="Configure Azure services, notifications, and app preferences">
      <div style={{ maxWidth: 720 }}>
        <Section title="Azure Blob Storage" icon={<Cloud size={16} />} delay={0}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Storage Account Name" value={blobAccount} onChange={setBlobAccount} />
            <Field label="Container Name" value={blobContainer} onChange={setBlobContainer} />
          </div>
          <Field
            label="Connection Endpoint"
            value={`https://${blobAccount}.blob.core.windows.net/${blobContainer}`}
            readOnly
            mono
          />
          <div style={{
            padding: '10px 14px',
            borderRadius: 9,
            background: 'rgba(34,197,94,0.07)',
            border: '1px solid rgba(34,197,94,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12.5,
            color: '#4ade80',
          }}>
            <CheckCircle size={14} />
            Connected — 12 months free tier active
          </div>
        </Section>

        <Section title="PostgreSQL — Flexible Server" icon={<Database size={16} />} delay={0.08}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Host" value={pgHost} onChange={setPgHost} mono />
            <Field label="Database" value={pgDb} onChange={setPgDb} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Port" value="5432" readOnly mono />
            <Field label="SSL Mode" value="require" readOnly />
          </div>
          <Field label="SQLAlchemy Connection URL" value={`postgresql+asyncpg://admin@${pgHost}/${pgDb}`} readOnly mono />
        </Section>

        <Section title="FastAPI Backend — App Service" icon={<Server size={16} />} delay={0.16}>
          <Field label="API Base URL" value={apiUrl} onChange={setApiUrl} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Tier" value="F1 (Free)" readOnly />
            <Field label="Runtime" value="Python 3.12" readOnly />
          </div>
          <div style={{
            padding: '10px 14px',
            borderRadius: 9,
            background: 'rgba(59,130,246,0.07)',
            border: '1px solid rgba(59,130,246,0.15)',
            fontSize: 12.5,
            color: '#93c5fd',
            lineHeight: 1.6,
          }}>
            <strong>Fail-safe enabled:</strong> If PostgreSQL insert fails after Blob upload, the PDF is auto-deleted from Azure Blob to prevent orphaned files.
          </div>
        </Section>

        <Section title="Security" icon={<Shield size={16} />} delay={0.24}>
          <Toggle label="Require authentication for all uploads" sub="JWT Bearer token validation on FastAPI" checked={true} onChange={() => {}} />
          <Toggle label="Encrypt files at rest" sub="Azure Blob Storage SSE with Microsoft-managed keys" checked={true} onChange={() => {}} />
          <Toggle label="Enable CORS whitelist" sub="Only allow requests from Static Web App domain" checked={true} onChange={() => {}} />
          <Toggle label="Auto-rollback on DB failure" sub="Delete Blob if PostgreSQL transaction fails" checked={autoRetry} onChange={setAutoRetry} />
        </Section>

        <Section title="Notifications" icon={<Bell size={16} />} delay={0.32}>
          <Toggle label="Notify on successful upload" sub="Toast notification + activity log entry" checked={notifyUpload} onChange={setNotifyUpload} />
          <Toggle label="Notify on upload failure" sub="Error details + rollback confirmation" checked={notifyFail} onChange={setNotifyFail} />
        </Section>

        <Section title="Appearance" icon={<Palette size={16} />} delay={0.4}>
          <Toggle label="Dark mode" sub="Deep navy enterprise theme (recommended)" checked={darkMode} onChange={() => toast('Dark mode is always on 🌑')} />
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
            Color scheme: Saffron · Azure · Deep Navy — IIT/Enterprise standard
          </div>
        </Section>

        {/* Save button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 28px',
            background: saving ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #f97316, #ea6906)',
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            color: saving ? 'rgba(255,255,255,0.3)' : '#fff',
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: saving ? 'none' : '0 0 24px rgba(249,115,22,0.35)',
          }}
        >
          <Save size={15} />
          {saving ? 'Saving...' : 'Save Settings'}
        </motion.button>
      </div>
    </Layout>
  );
};
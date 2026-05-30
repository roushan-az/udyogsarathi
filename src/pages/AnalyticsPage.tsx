// src/pages/AnalyticsPage.tsx
/**
 * All data comes from GET /api/analytics/ — real PostgreSQL queries.
 * No hardcoded arrays anywhere in this file.
 */

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, Cell, PieChart, Pie,
} from 'recharts'
import { RefreshCw, TrendingUp, TrendingDown, FileText, HardDrive, Upload, CheckCircle } from 'lucide-react'
import { Layout }           from '../components/Layout'
import { useApp } from '../context/AppContext'
import { CATEGORY_COLORS, formatFileSize } from '../utils'
import type { DocumentCategory } from '../types'
import toast from 'react-hot-toast'

// ── Tooltip components ────────────────────────────────────────────────────────

const StackedTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string
}) => {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + p.value, 0)
  return (
    <div style={{ background: '#111e35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 600 }}>{label} — {total} total</div>
      {payload.filter(p => p.value > 0).map(p => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600, marginBottom: 2 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

const StorageTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: Array<{ value: number }>; label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111e35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#f97316', fontWeight: 700 }}>{payload[0].value} MB</div>
    </div>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

const Skeleton = ({ height = 200, style = {} }: { height?: number; style?: React.CSSProperties }) => (
  <div className="skeleton" style={{ height, borderRadius: 14, ...style }} />
)

// ── KPI card ──────────────────────────────────────────────────────────────────

const KPICard = ({
  label, value, sub, color, icon, trend, delay = 0
}: {
  label: string; value: string; sub: string
  color: string; icon: React.ReactNode
  trend?: { value: number; positive: boolean }
  delay?: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={{
      background: 'rgba(21,34,64,0.9)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14, padding: '18px 20px', borderTop: `3px solid ${color}`,
      position: 'relative', overflow: 'hidden',
    }}
  >
    <div style={{ position: 'absolute', top: 16, right: 16, color, opacity: 0.4 }}>{icon}</div>
    <div style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 700, color: '#f0f4ff', letterSpacing: '-0.02em' }}>{value}</div>
    <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
      {trend && (
        trend.positive
          ? <TrendingUp size={11} color="#22c55e" />
          : <TrendingDown size={11} color="#ef4444" />
      )}
      <div style={{ fontSize: 11, color: trend ? (trend.positive ? '#22c55e' : '#ef4444') : color, fontWeight: 500 }}>{sub}</div>
    </div>
  </motion.div>
)

// ── Chart panel wrapper ───────────────────────────────────────────────────────

const Panel = ({ title, subtitle, children, delay = 0, style = {} }: {
  title: string; subtitle?: string; children: React.ReactNode; delay?: number; style?: React.CSSProperties
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={{ background: 'rgba(21,34,64,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '22px 22px', ...style }}
  >
    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f0f4ff', marginBottom: 3 }}>{title}</h3>
    {subtitle && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 18 }}>{subtitle}</p>}
    {children}
  </motion.div>
)

// ── Main page ─────────────────────────────────────────────────────────────────

export const AnalyticsPage: React.FC = () => {
  const {
    analyticsData: data,
    analyticsLoading: loading,
    refreshAnalytics,
  } = useApp()

  useEffect(() => { refreshAnalytics() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const kpi = data?.kpi

  const weekLabel = kpi
    ? kpi.weekOverWeekPct >= 0
      ? `+${kpi.weekOverWeekPct}% vs last week`
      : `${kpi.weekOverWeekPct}% vs last week`
    : '…'

  const PIE_COLORS = ['#f97316','#3b82f6','#22c55e','#a855f7','#14b8a6','#ef4444']

  return (
    <Layout
      title="Analytics"
      subtitle="Live data from PostgreSQL — all your uploaded documents"
    >
      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button
          onClick={() => { refreshAnalytics(true); toast.success('Analytics refreshed') }}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            height: 36, padding: '0 16px', borderRadius: 9,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
            color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f97316')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
        >
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* ── KPI row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14, marginBottom: 24 }}>
        {loading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} height={110} />)
        ) : (
          <>
            {/* FIXED: Added strict fallback (kpi?.totalDocuments ?? 0) to prevent fatal .toLocaleString() crashes */}
            <KPICard label="Total Documents"   value={(kpi?.totalDocuments ?? 0).toLocaleString()}
              sub="all categories" color="#f97316" icon={<FileText size={18}/>} delay={0} />
            <KPICard label="This Week"         value={String(kpi?.documentsThisWeek ?? 0)}
              sub={weekLabel} color="#3b82f6" icon={<Upload size={18}/>}
              trend={{ value: kpi?.weekOverWeekPct ?? 0, positive: (kpi?.weekOverWeekPct ?? 0) >= 0 }}
              delay={0.06} />
            <KPICard label="Avg File Size"     value={formatFileSize(kpi?.avgFileSizeBytes ?? 0)}
              sub="per document" color="#22c55e" icon={<HardDrive size={18}/>} delay={0.12} />
            {/* FIXED: Added strict fallback (kpi?.totalPdfConversions ?? 0) */}
            <KPICard label="PDF Conversions"   value={(kpi?.totalPdfConversions ?? 0).toLocaleString()}
              sub={`${kpi?.successRate ?? 100}% success rate`} color="#a855f7" icon={<CheckCircle size={18}/>} delay={0.18} />
          </>
        )}
      </div>

      {/* ── Weekly stacked bar chart ── */}
      <Panel title="Daily Uploads by Category" subtitle={`Current week (${data?.weeklyTrend?.[0]?.date ?? '…'} – ${data?.weeklyTrend?.[6]?.date ?? '…'})`} delay={0.2} style={{ marginBottom: 20 }}>
        {loading ? <Skeleton height={220} /> : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.weeklyTrend ?? []} barSize={22} barGap={4}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day"  axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} />
                <YAxis              axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} allowDecimals={false} />
                <Tooltip content={<StackedTooltip />} cursor={false} />
                {(['Sales','Purchase','Inventory','HR','Finance','Legal'] as DocumentCategory[]).map((cat, idx) => (
                  <Bar key={cat} dataKey={cat} stackId="a"
                    fill={CATEGORY_COLORS[cat].accent}
                    radius={idx === 5 ? [4,4,0,0] : [0,0,0,0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12 }}>
              {(['Sales','Purchase','Inventory','HR','Finance','Legal'] as DocumentCategory[]).map(cat => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: CATEGORY_COLORS[cat].accent }} />
                  <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)' }}>{cat}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Panel>

      {/* ── Storage growth + Radar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20, marginBottom: 20 }}>
        <Panel title="Storage Growth" subtitle="Cumulative Cloudflare R2 usage — last 7 months" delay={0.28}>
          {loading ? <Skeleton height={200} /> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data?.monthlyStorage ?? []}>
                <defs>
                  <linearGradient id="storageGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} />
                <YAxis              axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} unit=" MB" />
                <Tooltip content={<StorageTooltip />} />
                <Area type="monotone" dataKey="storageMB" stroke="#f97316" strokeWidth={2.5}
                  fill="url(#storageGrad)"
                  dot={{ fill: '#f97316', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#f97316', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Category Distribution" subtitle="Document spread across all categories" delay={0.34}>
          {loading ? <Skeleton height={200} /> : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <RadarChart data={data?.categoryRadar ?? []}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.45)' }} />
                  <Radar name="Documents" dataKey="count" stroke="#f97316" fill="#f97316" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {(data?.categoryRadar ?? []).map((row, i) => {
                  const c = CATEGORY_COLORS[row.subject as DocumentCategory]
                  return (
                    <div key={row.subject} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 3, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{row.subject}</span>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: c?.text ?? '#f97316', fontWeight: 600 }}>{row.count}</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', width: 36, textAlign: 'right' }}>{row.pct}%</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </Panel>
      </div>

      {/* ── Top uploaders + Storage breakdown ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20, marginBottom: 20 }}>
        {/* Top uploaders */}
        <Panel title="Top Uploaders" subtitle="Users with most documents uploaded" delay={0.4}>
          {loading ? <Skeleton height={200} /> : (
            (data?.topUploaders ?? []).length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', padding: '32px 0', fontSize: 13 }}>
                No upload data yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(data?.topUploaders ?? []).map((u, i) => (
                  <div key={u.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Rank */}
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: i === 0 ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i === 0 ? '#f97316' : 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: '#f0f4ff', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', flexShrink: 0, marginLeft: 8 }}>{u.count} docs</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${u.pct}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + i * 0.08 }}
                          style={{ height: '100%', background: i === 0 ? '#f97316' : '#3b82f6', borderRadius: 2 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </Panel>

        {/* Mini pie — category share */}
        <Panel title="Category Share" subtitle="Proportion of total documents per category" delay={0.44}>
          {loading ? <Skeleton height={200} /> : (
            (data?.categoryRadar ?? []).every(r => r.count === 0) ? (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', padding: '32px 0', fontSize: 13 }}>
                No documents yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data?.categoryRadar ?? []}
                    dataKey="count"
                    nameKey="subject"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                    label={({ subject, pct }) => pct > 5 ? `${subject} ${pct}%` : ''}
                    labelLine={false}
                  >
                    {(data?.categoryRadar ?? []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value} docs`, name]}
                    contentStyle={{ background: '#111e35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )
          )}
        </Panel>
      </div>

      {/* ── Storage breakdown table ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ background: 'rgba(21,34,64,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden' }}
      >
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f0f4ff' }}>Storage Breakdown by Category</h3>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)' }}>
            Total: {formatFileSize(kpi?.totalStorage ?? 0)}
          </span>
        </div>
        {loading ? (
          <div style={{ padding: 20 }}><Skeleton height={140} /></div>
        ) : (
          <div>
            {(data?.categoryRadar ?? []).map((item, i) => {
              const c = CATEGORY_COLORS[item.subject as DocumentCategory]
              const storageBytes = kpi && kpi.totalStorage > 0 && kpi.totalDocuments > 0
                ? Math.round((item.count / kpi.totalDocuments) * kpi.totalStorage)
                : 0
              return (
                <div key={item.subject} style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(100px,120px) 1fr 90px 70px',
                  gap: 16, padding: '14px 24px', alignItems: 'center',
                  borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: c?.accent ?? '#f97316' }} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{item.subject}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ duration: 0.8, delay: 0.6 + i * 0.06 }}
                        style={{ height: '100%', background: c?.accent ?? '#f97316', borderRadius: 3 }}
                      />
                    </div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', width: 32 }}>{item.pct}%</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                    {formatFileSize(storageBytes)}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'right' }}>
                    {item.count} docs
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>
    </Layout>
  )
}
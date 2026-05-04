// src/pages/AnalyticsPage.tsx

import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';

import { useApp } from '../context/AppContext';
import { CATEGORY_COLORS, formatFileSize } from '../utils';
import type { DocumentCategory } from '../types';
import { Layout } from '../components/Layout';

const uploadTrendData = [
  { day: 'Mon', Sales: 8, Purchase: 5, HR: 2, Finance: 3, Legal: 1, Inventory: 4 },
  { day: 'Tue', Sales: 12, Purchase: 7, HR: 4, Finance: 2, Legal: 2, Inventory: 6 },
  { day: 'Wed', Sales: 6, Purchase: 9, HR: 1, Finance: 5, Legal: 3, Inventory: 3 },
  { day: 'Thu', Sales: 14, Purchase: 4, HR: 6, Finance: 4, Legal: 1, Inventory: 8 },
  { day: 'Fri', Sales: 10, Purchase: 11, HR: 3, Finance: 7, Legal: 4, Inventory: 5 },
  { day: 'Sat', Sales: 4, Purchase: 2, HR: 1, Finance: 1, Legal: 0, Inventory: 2 },
  { day: 'Sun', Sales: 2, Purchase: 1, HR: 0, Finance: 0, Legal: 1, Inventory: 1 },
];

const storageGrowthData = [
  { month: 'Sep', storage: 320 },
  { month: 'Oct', storage: 480 },
  { month: 'Nov', storage: 620 },
  { month: 'Dec', storage: 710 },
  { month: 'Jan', storage: 820 },
  { month: 'Feb', storage: 940 },
  { month: 'Mar', storage: 1024 },
];

const radarData = [
  { subject: 'Sales', A: 89 },
  { subject: 'Purchase', A: 62 },
  { subject: 'Inventory', A: 34 },
  { subject: 'HR', A: 28 },
  { subject: 'Finance', A: 21 },
  { subject: 'Legal', A: 14 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a2b4e',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 12,
    }}>
      <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600, marginBottom: 2 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

const StorageTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a2b4e',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 12,
    }}>
      <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#f97316', fontWeight: 700 }}>{payload[0].value} MB used</div>
    </div>
  );
};

export const AnalyticsPage: React.FC = () => {
  const { stats } = useApp();

  return (
    <Layout title="Analytics" subtitle="Document intelligence — storage, upload trends & category breakdown">
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Uploads', value: '248', sub: 'all time', color: '#f97316' },
          { label: 'This Week', value: '56', sub: '+18% vs last week', color: '#3b82f6' },
          { label: 'Avg File Size', value: '312 KB', sub: 'per document', color: '#22c55e' },
          { label: 'PDF Conversions', value: '248', sub: '100% success rate', color: '#a855f7' },
        ].map(({ label, value, sub, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              background: 'rgba(21,34,64,0.9)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14,
              padding: '18px 20px',
              borderTop: `3px solid ${color}`,
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 700, color: '#f0f4ff', letterSpacing: '-0.02em' }}>{value}</div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{label}</div>
            <div style={{ fontSize: 11, color, marginTop: 4, fontWeight: 500 }}>{sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Weekly stacked bar chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'rgba(21,34,64,0.85)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 18,
          padding: '22px 26px',
          marginBottom: 20,
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f0f4ff', marginBottom: 4 }}>
          Daily Uploads by Category
        </h3>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>This week's document activity</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={uploadTrendData} barSize={22} barGap={4}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            {(['Sales', 'Purchase', 'Inventory', 'HR', 'Finance', 'Legal'] as DocumentCategory[]).map((cat) => (
              <Bar
                key={cat}
                dataKey={cat}
                stackId="a"
                fill={CATEGORY_COLORS[cat].accent}
                radius={cat === 'Legal' ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
          {(['Sales', 'Purchase', 'Inventory', 'HR', 'Finance', 'Legal'] as DocumentCategory[]).map((cat) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: CATEGORY_COLORS[cat].accent }} />
              <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)' }}>{cat}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Storage growth + Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 20 }}>
        {/* Storage area chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          style={{
            background: 'rgba(21,34,64,0.85)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 18,
            padding: '22px 26px',
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f0f4ff', marginBottom: 4 }}>
            Storage Growth
          </h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>
            Azure Blob usage (MB) — last 7 months
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={storageGrowthData}>
              <defs>
                <linearGradient id="storageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} />
              <Tooltip content={<StorageTooltip />} />
              <Area
                type="monotone"
                dataKey="storage"
                stroke="#f97316"
                strokeWidth={2.5}
                fill="url(#storageGrad)"
                dot={{ fill: '#f97316', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#f97316', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          style={{
            background: 'rgba(21,34,64,0.85)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 18,
            padding: '22px 26px',
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f0f4ff', marginBottom: 4 }}>
            Category Distribution
          </h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
            Document spread across categories
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.45)' }} />
              <Radar name="Documents" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Storage by category table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          background: 'rgba(21,34,64,0.85)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 18,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f0f4ff' }}>Storage Breakdown by Category</h3>
        </div>
        <div>
          {(stats?.storageByCategory || []).map((item, i) => {
            const colors = CATEGORY_COLORS[item.category];
            const pct = stats ? Math.round((item.size / stats.totalStorage) * 100) : 0;
            return (
              <div
                key={item.category}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr 80px 80px',
                  gap: 16,
                  padding: '14px 24px',
                  alignItems: 'center',
                  borderBottom: i < (stats?.storageByCategory.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: colors.accent }} />
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{item.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.06 }}
                      style={{ height: '100%', background: colors.accent, borderRadius: 3 }}
                    />
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', width: 30 }}>{pct}%</span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                  {formatFileSize(item.size)}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'right' }}>
                  {item.count} docs
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </Layout>
  );
};
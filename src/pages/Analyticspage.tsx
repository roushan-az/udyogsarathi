import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';
import { CATEGORY_COLORS, formatFileSize } from '../utils';
import type { DocumentCategory } from '../types';
import { Activity, BarChart3, PieChart as PieIcon, Database } from 'lucide-react';

/**
 * Custom Tooltip for the stacked bar chart (Weekly Trend)
 */
const WeeklyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a2b4e', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600, display: 'flex', justifyContent: 'space-between', gap: 20 }}>
          <span>{p.name}:</span>
          <span>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export const AnalyticsPage: React.FC = () => {
  const { analyticsData, analyticsLoading, refreshAnalytics } = useApp();

  // 1. Fetch real-time data on mount if not already present
  useEffect(() => {
   refreshAnalytics();
  }, [ refreshAnalytics]);

  // 2. Memoized KPI cards using live backend data
  const kpiCards = useMemo(() => {
    if (!analyticsData) return [];
    return [
      { label: 'Total Uploads', value: analyticsData.kpi.totalDocuments, sub: 'all time', color: '#f97316', icon: <Database size={16} /> },
      { label: 'This Week', value: analyticsData.kpi.documentsThisWeek, sub: `${analyticsData.kpi.weekOverWeekPct > 0 ? '+' : ''}${analyticsData.kpi.weekOverWeekPct}% vs last week`, color: '#3b82f6', icon: <Activity size={16} /> },
      { label: 'Avg File Size', value: formatFileSize(analyticsData.kpi.avgFileSizeBytes), sub: 'per document', color: '#22c55e', icon: <BarChart3 size={16} /> },
      { label: 'PDF Conversions', value: analyticsData.kpi.totalPdfConversions, sub: '100% success rate', color: '#a855f7', icon: <PieIcon size={16} /> },
    ];
  }, [analyticsData]);

  // Handle loading state
  if (analyticsLoading || !analyticsData) {
    return (
      <Layout title="Analytics" subtitle="Intelligence loading...">
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ marginBottom: 16 }}></div>
            Fetching real-time document intelligence from Azure...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Analytics" subtitle="Enterprise Document Intelligence — trends, growth & category spread">
      
      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {kpiCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            style={{ 
                background: 'rgba(21,34,64,0.9)', borderRadius: 16, padding: 20, 
                border: '1px solid rgba(255,255,255,0.06)', borderTop: `4px solid ${card.color}` 
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</span>
              <div style={{ color: card.color }}>{card.icon}</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em' }}>{card.value}</div>
            <div style={{ fontSize: 11.5, color: card.color, fontWeight: 600, marginTop: 4 }}>{card.sub}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 20 }}>
        
        {/* Weekly Trend: Stacked Bar Chart */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          style={{ background: 'rgba(21,34,64,0.85)', borderRadius: 20, padding: 26, border: '1px solid rgba(255,255,255,0.06)' }}>
           <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0f4ff', marginBottom: 4 }}>Daily Upload Trend</h3>
           <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>Active uploads across categories for the last 7 days</p>
           
           <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analyticsData.weeklyTrend}>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} dy={10} />
              {/* Dynamic YAxis scales for small record counts */}
              <YAxis domain={[0, 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} dx={-10} />
              <Tooltip content={<WeeklyTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              {(['Sales', 'Purchase', 'Inventory', 'HR', 'Finance', 'Legal'] as DocumentCategory[]).map((cat) => (
                <Bar key={cat} dataKey={cat} stackId="a" fill={CATEGORY_COLORS[cat].accent} radius={[0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Radar: Distribution */}
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
          style={{ background: 'rgba(21,34,64,0.85)', borderRadius: 20, padding: 26, border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0f4ff', marginBottom: 4 }}>Category Distribution</h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>Weight of library by document type</p>
          
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={analyticsData.categoryRadar}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10.5, fill: 'rgba(255,255,255,0.45)', fontWeight: 500 }} />
              {/* Ensure dataKey matches "count" from your CategoryRadarRow schema */}
              <Radar name="Documents" dataKey="count" stroke="#f97316" strokeWidth={2} fill="#f97316" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
      
      {/* Storage Growth: Area Chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'rgba(21,34,64,0.85)', borderRadius: 20, padding: 26, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0f4ff', marginBottom: 4 }}>Azure Storage Growth</h3>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>Cumulative PDF footprint (MB) over the last 7 months</p>
        
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={analyticsData.monthlyStorage}>
            <defs>
              <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} />
            <YAxis domain={[0, 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} unit="MB" />
            <Tooltip 
                contentStyle={{ background: '#1a2b4e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}
                itemStyle={{ color: '#60a5fa', fontWeight: 700 }}
            />
            {/* dataKey "storageMB" matches MonthlyStorageRow */}
            <Area type="monotone" dataKey="storageMB" name="Storage" stroke="#3b82f6" strokeWidth={3} fill="url(#growthGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </Layout>
  );
};
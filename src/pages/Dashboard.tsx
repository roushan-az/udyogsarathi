
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText, HardDrive, TrendingUp, Calendar,
  Upload, ArrowRight, Activity, Download, Trash2, Eye,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { Layout } from '../components/Layout'
import { StatCard } from '../components/StatCard'
import { useApp } from '../context/AppContext'
import { formatFileSize, formatRelative, CATEGORY_COLORS } from '../utils'
import type { DocumentCategory } from '../types'

const PIE_COLORS = ['#f97316','#3b82f6','#22c55e','#a855f7','#14b8a6','#ef4444']

const ACTION_ICONS: Record<string, React.ReactNode> = {
  upload:   <Upload   size={12} color="#22c55e" />,
  download: <Download size={12} color="#3b82f6" />,
  delete:   <Trash2   size={12} color="#ef4444" />,
  view:     <Eye      size={12} color="#f97316" />,
}

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#1a2b4e', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#f0f4ff' }}>
      <div style={{ color:'rgba(255,255,255,0.4)', marginBottom:4 }}>{label}</div>
      <div style={{ fontWeight:700, color:'#f97316' }}>{payload[0].value} docs</div>
    </div>
  )
}

const barData = [
  { month:'Oct', docs:31 }, { month:'Nov', docs:38 }, { month:'Dec', docs:29 },
  { month:'Jan', docs:44 }, { month:'Feb', docs:51 }, { month:'Mar', docs:47 },
]

export const Dashboard: React.FC = () => {
  const { stats, documents } = useApp()
  const navigate = useNavigate()

  if (!stats) return null

  const pieData = Object.entries(stats.categoryCounts).map(([cat, count]) => ({ name: cat, value: count }))

  return (
    <Layout title="Dashboard" subtitle="Udyog Sarathi — Enterprise Document Intelligence Platform">

      {/* Welcome banner */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} style={{
        background: 'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(59,130,246,0.08) 50%, rgba(21,34,64,0.9) 100%)',
        border: '1px solid rgba(249,115,22,0.2)', borderRadius: 18,
        padding: '22px 24px', marginBottom: 22,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, overflow: 'hidden', position: 'relative', flexWrap: 'wrap',
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize:10.5, fontWeight:700, color:'#f97316', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>
            Welcome back, Admin
          </div>
          <h2 style={{ fontSize:'clamp(16px, 3vw, 22px)', fontWeight:700, color:'#f0f4ff', letterSpacing:'-0.02em', marginBottom:6 }}>
            उद्योग सारथी — Your Document Co-Pilot
          </h2>
          <p style={{ fontSize:12.5, color:'rgba(255,255,255,0.5)' }}>
            {stats.documentsThisMonth} docs this month · {formatFileSize(stats.totalStorage)} in Azure Blob
          </p>
        </div>
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          onClick={() => navigate('/upload')}
          style={{
            display:'flex', alignItems:'center', gap:8, padding:'11px 22px',
            background:'linear-gradient(135deg,#f97316,#ea6906)', border:'none', borderRadius:12,
            fontSize:13.5, fontWeight:700, color:'#fff', cursor:'pointer',
            boxShadow:'0 0 20px rgba(249,115,22,0.4)', flexShrink:0, whiteSpace:'nowrap',
          }}>
          <Upload size={15} /> Upload
        </motion.button>
      </motion.div>

      {/* Stats grid — 4 col → 2 col → 1 col */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',
        gap:14, marginBottom:22,
      }}>
        <StatCard label="Total Documents" value={stats.totalDocuments.toLocaleString()} subLabel="All categories" icon={<FileText size={18}/>} trend={{ value:12, label:'vs last month' }} accentColor="#f97316" delay={0} />
        <StatCard label="Storage Used" value={formatFileSize(stats.totalStorage)} subLabel="Azure Blob" icon={<HardDrive size={18}/>} trend={{ value:8, label:'growth' }} accentColor="#3b82f6" delay={0.06} />
        <StatCard label="This Month" value={stats.documentsThisMonth} subLabel="Uploaded" icon={<Calendar size={18}/>} trend={{ value:23, label:'vs last month' }} accentColor="#22c55e" delay={0.12} />
        <StatCard label="Avg Rate" value="1.6/hr" subLabel="Peak: 12 in 1hr" icon={<TrendingUp size={18}/>} accentColor="#a855f7" delay={0.18} />
      </div>

      {/* Charts row */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',
        gap:18, marginBottom:18,
      }}>
        {/* Bar chart */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }} style={{
          background:'rgba(21,34,64,0.85)', border:'1px solid rgba(255,255,255,0.07)',
          borderRadius:18, padding:'20px 20px',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <h3 style={{ fontSize:13.5, fontWeight:600, color:'#f0f4ff' }}>Upload Trend</h3>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>Last 6 months</p>
            </div>
            <Activity size={15} color="rgba(255,255,255,0.2)" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barSize={24}>
              <defs>
                <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false}/>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize:11, fill:'rgba(255,255,255,0.35)' }}/>
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fill:'rgba(255,255,255,0.35)' }}/>
              <Tooltip content={<ChartTooltip />} cursor={false}/>
              <Bar dataKey="docs" radius={[6,6,0,0]} fill="url(#bg1)"/>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} style={{
          background:'rgba(21,34,64,0.85)', border:'1px solid rgba(255,255,255,0.07)',
          borderRadius:18, padding:'20px 20px',
        }}>
          <h3 style={{ fontSize:13.5, fontWeight:600, color:'#f0f4ff', marginBottom:4 }}>By Category</h3>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:14 }}>Distribution</p>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={32} outerRadius={55} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:10 }}>
            {Object.entries(stats.categoryCounts).map(([cat, count], i) => {
              const colors = CATEGORY_COLORS[cat as DocumentCategory]
              const pct = Math.round((count / stats.totalDocuments) * 100)
              return (
                <div key={cat} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:3, background:PIE_COLORS[i], flexShrink:0 }}/>
                  <span style={{ flex:1, fontSize:12, color:'rgba(255,255,255,0.55)' }}>{cat}</span>
                  <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color:colors.text, fontWeight:600 }}>{count}</span>
                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)', width:28, textAlign:'right' }}>{pct}%</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:18 }}>
        {/* Activity feed */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }} style={{
          background:'rgba(21,34,64,0.85)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, overflow:'hidden',
        }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 style={{ fontSize:13.5, fontWeight:600, color:'#f0f4ff' }}>Recent Activity</h3>
            <Activity size={14} color="rgba(255,255,255,0.2)"/>
          </div>
          {stats.recentActivity.map((item, i) => (
            <div key={item.id} style={{
              display:'flex', gap:10, padding:'11px 20px', alignItems:'center',
              borderBottom: i < stats.recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <div style={{ width:28, height:28, borderRadius:8, background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {ACTION_ICONS[item.action]}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12.5, color:'rgba(255,255,255,0.7)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  <span style={{ textTransform:'capitalize' }}>{item.action}</span>{' '}
                  <span style={{ color:'#f0f4ff', fontWeight:500 }}>{item.documentName}</span>
                </div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:1 }}>
                  {item.user} · {formatRelative(item.timestamp)}
                </div>
              </div>
              <span style={{
                fontSize:10, padding:'2px 7px', borderRadius:4, flexShrink:0,
                // FIX: Added '?.bg' and a fallback default color
                background: CATEGORY_COLORS[item.category as DocumentCategory]?.bg || 'rgba(255,255,255,0.1)',
                // FIX: Added '?.text' and a fallback default text color
                color: CATEGORY_COLORS[item.category as DocumentCategory]?.text || 'rgba(255,255,255,0.7)',
              }}>
                {item.category || 'Unknown'}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Recent documents */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }} style={{
          background:'rgba(21,34,64,0.85)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, overflow:'hidden',
        }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 style={{ fontSize:13.5, fontWeight:600, color:'#f0f4ff' }}>Recent Documents</h3>
            <button onClick={() => navigate('/documents')} style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#f97316', background:'none', border:'none', cursor:'pointer' }}>
              View all <ArrowRight size={11}/>
            </button>
          </div>
          {documents.slice(0,5).map((doc, i) => {
            const colors = CATEGORY_COLORS[doc.category]
            return (
              <div key={doc.id} style={{
                display:'flex', gap:10, padding:'11px 20px', alignItems:'center',
                borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{ width:32, height:32, borderRadius:8, background:colors.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <FileText size={14} color={colors.text}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12.5, fontWeight:500, color:'#f0f4ff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.originalName}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{formatRelative(doc.uploadedAt)} · {formatFileSize(doc.fileSize)}</div>
                </div>
                <span className={`status-badge status-${doc.status}`} style={{ flexShrink:0 }}>{doc.status}</span>
              </div>
            )
          })}
        </motion.div>
      </div>
    </Layout>
  )
}
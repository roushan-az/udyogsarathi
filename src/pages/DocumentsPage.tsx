
import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Grid3X3, List, SortAsc, SortDesc, X, ChevronLeft, ChevronRight, FileText, RefreshCw } from 'lucide-react'
import { Layout } from '../components/Layout'
import { DocumentCard } from '../components/DocumentCard'
import { useApp } from '../context/AppContext'
import { CATEGORIES, CATEGORY_COLORS, formatFileSize, formatRelative } from '../utils'
import type { DocumentCategory } from '../types'

type SortKey  = 'uploadedAt' | 'fileName' | 'fileSize' | 'category'
type ViewMode = 'grid' | 'list'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const DocumentsPage: React.FC = () => {
  const { documents, isLoading, error, pagination, refreshDocuments, setFilters, setPagination } = useApp()

  const [viewMode,        setViewMode]        = useState<ViewMode>('grid')
  const [search,          setSearch]          = useState('')
  const [categoryFilter,  setCategoryFilter]  = useState<DocumentCategory | 'All'>('All')
  const [statusFilter,    setStatusFilter]    = useState('All')
  const [sortKey,         setSortKey]         = useState<SortKey>('uploadedAt')
  const [sortAsc,         setSortAsc]         = useState(false)
  const [page,            setPage]            = useState(1)
  const PAGE_SIZE = viewMode === 'grid' ? 9 : 10

  // ── Push filter/pagination changes to AppContext → API ────────────────────
  useEffect(() => {
    const newFilters = {
      category: categoryFilter,
      status:   statusFilter as 'All' | 'uploaded' | 'processing' | 'failed' | 'queued',
      search:   search || undefined,
    }
    setFilters(newFilters)
    setPagination({ page, pageSize: PAGE_SIZE })

    if (!USE_MOCK) {
      refreshDocuments(newFilters, { page, pageSize: PAGE_SIZE })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, statusFilter, search, page, PAGE_SIZE])

  // ── Client-side sort (backend returns pre-filtered list) ──────────────────
  const sorted = useMemo(() => {
    let docs = [...documents]
    if (categoryFilter !== 'All') {
      docs = docs.filter(d => d.category === categoryFilter)
    }
    if (statusFilter !== 'All') {
      docs = docs.filter(d => d.status === statusFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      docs = docs.filter(d => 
        d.originalName.toLowerCase().includes(q) || 
        (d.tags && d.tags.some(t => t.toLowerCase().includes(q)))
      )
    }
    docs.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'uploadedAt') cmp = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
      else if (sortKey === 'fileName') cmp = a.fileName.localeCompare(b.fileName)
      else if (sortKey === 'fileSize') cmp = a.fileSize - b.fileSize
      else if (sortKey === 'category') cmp = a.category.localeCompare(b.category)
      return sortAsc ? cmp : -cmp
    })
    return docs
  }, [documents, sortKey, sortAsc, categoryFilter, statusFilter, search])

  // In mock mode, paginate locally; in real mode pagination is server-side
  const displayDocs = USE_MOCK
    ? sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : sorted

  const totalDocs  = USE_MOCK ? sorted.length : pagination.total
  const totalPages = Math.ceil(totalDocs / PAGE_SIZE)

  const hasFilters = search || categoryFilter !== 'All' || statusFilter !== 'All'

  const clearFilters = () => {
    setSearch(''); setCategoryFilter('All'); setStatusFilter('All'); setPage(1)
  }

  return (
    <Layout title="Documents" subtitle={`${totalDocs} document${totalDocs !== 1 ? 's' : ''}`}>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>

        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 0 }}>
          <Search size={13} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Search documents…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ width: '100%', height: 36, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, padding: '0 32px', fontSize: 12.5, color: '#f0f4ff', outline: 'none' }} />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1) }} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={12} /></button>
          )}
        </div>

        {/* Status */}
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          style={{ height: 36, padding: '0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, fontSize: 12.5, color: 'rgba(255,255,255,0.7)', outline: 'none', cursor: 'pointer', flex: '0 0 auto' }}>
          {['All', 'uploaded', 'processing', 'failed', 'queued'].map(s => (
            <option key={s} value={s} style={{ background: '#1a2b4e' }}>{s === 'All' ? 'All Status' : s}</option>
          ))}
        </select>

        {/* Sort */}
        <div style={{ display: 'flex', flex: '0 0 auto' }}>
          <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}
            style={{ height: 36, padding: '0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px 0 0 9px', fontSize: 12.5, color: 'rgba(255,255,255,0.7)', outline: 'none', cursor: 'pointer' }}>
            {[['uploadedAt','Date'],['fileName','Name'],['fileSize','Size'],['category','Category']].map(([v,l]) => (
              <option key={v} value={v} style={{ background: '#1a2b4e' }}>{l}</option>
            ))}
          </select>
          <button onClick={() => setSortAsc(!sortAsc)}
            style={{ height: 36, padding: '0 9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: 'none', borderRadius: '0 9px 9px 0', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center' }}>
            {sortAsc ? <SortAsc size={14} /> : <SortDesc size={14} />}
          </button>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, overflow: 'hidden', flex: '0 0 auto' }}>
          {(['grid', 'list'] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setViewMode(v)}
              style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: viewMode === v ? 'rgba(249,115,22,0.15)' : 'transparent', color: viewMode === v ? '#f97316' : 'rgba(255,255,255,0.4)', transition: 'all 0.15s' }}>
              {v === 'grid' ? <Grid3X3 size={14} /> : <List size={14} />}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button onClick={() => refreshDocuments()}
          style={{ height: 36, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', flex: '0 0 auto', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#f97316'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'}>
          <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
        </button>

        {/* Clear filters */}
        {hasFilters && (
          <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            onClick={clearFilters}
            style={{ display: 'flex', alignItems: 'center', gap: 5, height: 36, padding: '0 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 9, fontSize: 12.5, color: '#f87171', cursor: 'pointer', flex: '0 0 auto' }}>
            <X size={12} /> Clear
          </motion.button>
        )}
      </div>

      {/* ── Category chips ── */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 18, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        <button onClick={() => { setCategoryFilter('All'); setPage(1) }}
          style={{ padding: '5px 13px', borderRadius: 8, border: `1px solid ${categoryFilter === 'All' ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.08)'}`, background: categoryFilter === 'All' ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.03)', color: categoryFilter === 'All' ? '#f97316' : 'rgba(255,255,255,0.5)', fontSize: 12.5, fontWeight: categoryFilter === 'All' ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
          All
        </button>
        {CATEGORIES.map(cat => {
          const c = CATEGORY_COLORS[cat]
          const active = categoryFilter === cat
          return (
            <button key={cat} onClick={() => { setCategoryFilter(cat); setPage(1) }}
              style={{ padding: '5px 13px', borderRadius: 8, border: `1px solid ${active ? c.accent + '50' : 'rgba(255,255,255,0.07)'}`, background: active ? c.bg : 'rgba(255,255,255,0.03)', color: active ? c.text : 'rgba(255,255,255,0.45)', fontSize: 12.5, fontWeight: active ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {cat}
            </button>
          )
        })}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 13, color: '#f87171', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          ⚠ {error} — showing cached data.
          <button onClick={() => refreshDocuments()} style={{ marginLeft: 'auto', fontSize: 12, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
        </div>
      )}

      {/* ── Content ── */}
      {isLoading && documents.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 190 }} />)}
        </div>
      ) : displayDocs.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '60px 24px', color: 'rgba(255,255,255,0.3)' }}>
          <Filter size={36} style={{ margin: '0 auto 14px', opacity: 0.3 }} />
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>No documents found</div>
          <div style={{ fontSize: 13 }}>Try different filters or upload a new document</div>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
          <AnimatePresence>{displayDocs.map(doc => <DocumentCard key={doc.id} document={doc} view="grid" />)}</AnimatePresence>
        </motion.div>
      ) : (
        <div style={{ background: 'rgba(21,34,64,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
          <AnimatePresence>
            {displayDocs.map((doc) => {
              const c = CATEGORY_COLORS[doc.category]
              return (
                <motion.div key={doc.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', gap: 12, padding: '12px 18px', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FileText size={14} color={c.text} /></div>
                  <div style={{ flex: '1 1 140px', minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#f0f4ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.originalName}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{formatFileSize(doc.fileSize)} · {formatRelative(doc.uploadedAt)}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: c.bg, color: c.text, fontWeight: 600, flexShrink: 0 }}>{doc.category}</span>
                  <span className={`status-badge status-${doc.status}`} style={{ flexShrink: 0 }}>{doc.status}</span>
                  <DocumentCard document={doc} view="list" />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7, marginTop: 24, flexWrap: 'wrap' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: page === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
            <ChevronLeft size={15} />
          </button>
          {[...Array(Math.min(totalPages, 7))].map((_, i) => {
            const p = i + 1
            return (
              <button key={p} onClick={() => setPage(p)}
                style={{ width: 34, height: 34, borderRadius: 8, background: page === p ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${page === p ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.08)'}`, color: page === p ? '#f97316' : 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: page === p ? 700 : 400, cursor: 'pointer' }}>{p}</button>
            )
          })}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: page === totalPages ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </Layout>
  )
}
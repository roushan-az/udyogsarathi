// src/pages/DocumentsPage.tsx
import React, { useState, useEffect, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Search, Grid3X3, List, X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { Layout } from '../components/Layout'
import { DocumentCard } from '../components/DocumentCard'
import { useApp } from '../context/AppContext'
import { userService } from '../services/api'
import { CATEGORIES, CATEGORY_COLORS } from '../utils'
import type { DocumentCategory } from '../types'

type ViewMode = 'grid' | 'list'

export const DocumentsPage: React.FC = () => {
  const { documents, isLoading, error, refreshDocuments, filters, currentUser } = useApp()
  
  // 1. ── Local Filter States ────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'All'>(filters?.category || 'All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [uploaderFilter, setUploaderFilter] = useState('All')
  const [page, setPage] = useState(1)

  const PAGE_SIZE = viewMode === 'grid' ? 9 : 10

  // 2. ── Admin Check & User List ────────────────────────────────────────────
  const isSuperuser = currentUser?.is_superuser || false;
  // Included email so we can distinguish users with the exact same name
  const [userList, setUserList] = useState<{id: string, fullName: string, email?: string}[]>([])

  useEffect(() => {
    if (filters?.category) {
      setCategoryFilter(filters.category);
      setPage(1);
    }
  }, [filters?.category]);

  useEffect(() => {
    if (isSuperuser) {
      userService.getUsers().then(users => {
        // 👇 FIX: Deduplicate users by their unique ID to prevent API duplicates
        const uniqueUsers = Array.from(new Map(users.map(u => [u.id, u])).values());
        setUserList(uniqueUsers);
      }).catch(console.error)
    }
  }, [isSuperuser])

  // 3. ── Cache Population ───────────────────────────────────────────────────
  useEffect(() => {
    refreshDocuments({ category: 'All', status: 'All' }, { page: 1, pageSize: 10000 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 4. ── Lightning-Fast Local Filtering ─────────────────────────────────────
  const filteredDocs = useMemo(() => {
    let docs = [...documents]

    if (categoryFilter !== 'All') {
      docs = docs.filter(d => d.category === categoryFilter)
    }
    if (statusFilter !== 'All') {
      docs = docs.filter(d => d.status === statusFilter)
    }
    if (uploaderFilter !== 'All') {
      docs = docs.filter(d => d.uploadedBy === uploaderFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      docs = docs.filter(d =>
        d.originalName.toLowerCase().includes(q) ||
        (d.tags && d.tags.some(t => t.toLowerCase().includes(q)))
      )
    }

    docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    return docs
  }, [documents, categoryFilter, statusFilter, uploaderFilter, search])

  // 5. ── Local Pagination ───────────────────────────────────────────────────
  const totalDocs = filteredDocs.length
  const totalPages = Math.max(1, Math.ceil(totalDocs / PAGE_SIZE))
  
  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages, page])

  const displayDocs = filteredDocs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const hasFilters = search || categoryFilter !== 'All' || statusFilter !== 'All' || uploaderFilter !== 'All'

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter('All')
    setStatusFilter('All')
    setUploaderFilter('All')
    setPage(1)
  }

  return (
    <Layout title="Documents" subtitle={`${totalDocs} document${totalDocs !== 1 ? 's' : ''}`}>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 0 }}>
          <Search size={13} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Search documents…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ width: '100%', height: 36, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, padding: '0 32px', fontSize: 12.5, color: '#f0f4ff', outline: 'none' }} />
        </div>

        {/* Status Dropdown */}
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ height: 36, padding: '0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, fontSize: 12.5, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
          {['All', 'uploaded', 'processing', 'failed', 'queued'].map(s => <option key={s} value={s} style={{background: '#1a2b4e'}}>{s === 'All' ? 'All Status' : s}</option>)}
        </select>

        {/* User Dropdown (Admin Only) */}
        {isSuperuser && (
          <select value={uploaderFilter} onChange={e => { setUploaderFilter(e.target.value); setPage(1); }}
            style={{ 
              height: 36, padding: '0 10px', background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, fontSize: 12.5, 
              color: '#3b82f6', cursor: 'pointer', fontWeight: 600,
              // 👇 Added flex sizing and text truncation for mobile
              flex: '1 1 160px', minWidth: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' 
            }}>
            <option value="All" style={{background: '#1a2b4e'}}>👥 All Users</option>
            {userList.map(u => (
              <option key={u.id} value={u.fullName} style={{background: '#1a2b4e'}}>
                {/* Append email so identical names can be told apart visually */}
                {u.fullName} {u.email ? `(${u.email})` : ''}
              </option>
            ))}
          </select>
        )}

        {/* View mode toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, overflow: 'hidden', flex: '0 0 auto' }}>
          {(['grid', 'list'] as ViewMode[]).map(v => (
            <button key={v} onClick={() => { setViewMode(v); setPage(1); }}
              style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: viewMode === v ? 'rgba(249,115,22,0.15)' : 'transparent', color: viewMode === v ? '#f97316' : 'rgba(255,255,255,0.4)', transition: 'all 0.15s', border: 'none', cursor: 'pointer' }}>
              {v === 'grid' ? <Grid3X3 size={14} /> : <List size={14} />}
            </button>
          ))}
        </div>

        {/* Refresh Force */}
        <button onClick={() => refreshDocuments({ category: 'All', status: 'All' }, { page: 1, pageSize: 10000 })}
          style={{ height: 36, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', flex: '0 0 auto', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#f97316'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'}>
          <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
        </button>

        {/* Clear Filters */}
        {hasFilters && (
          <button onClick={clearFilters}
            style={{ display: 'flex', alignItems: 'center', gap: 5, height: 36, padding: '0 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 9, fontSize: 12.5, color: '#f87171', cursor: 'pointer' }}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* ── Category Chips ── */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 18, overflowX: 'auto', paddingBottom: 4 }}>
        <button onClick={() => { setCategoryFilter('All'); setPage(1); }}
          style={{ padding: '5px 13px', borderRadius: 8, background: categoryFilter === 'All' ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.03)', color: categoryFilter === 'All' ? '#f97316' : 'rgba(255,255,255,0.5)', cursor: 'pointer', border: `1px solid ${categoryFilter === 'All' ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
          All
        </button>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => { setCategoryFilter(cat); setPage(1); }}
            style={{ padding: '5px 13px', borderRadius: 8, background: categoryFilter === cat ? CATEGORY_COLORS[cat].bg : 'rgba(255,255,255,0.03)', color: categoryFilter === cat ? CATEGORY_COLORS[cat].text : 'rgba(255,255,255,0.45)', cursor: 'pointer', border: `1px solid ${categoryFilter === cat ? CATEGORY_COLORS[cat].accent + '50' : 'rgba(255,255,255,0.07)'}` }}>
            {cat}
          </button>
        ))}
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 13, color: '#f87171', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          ⚠ {error} — showing cached data.
        </div>
      )}

      {/* ── Content ── */}
      {isLoading && documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>Loading documents...</div>
      ) : displayDocs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>No documents found matching your filters</div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
          <AnimatePresence>
            {displayDocs.map(doc => <DocumentCard key={doc.id} document={doc} view="grid" />)}
          </AnimatePresence>
        </div>
      ) : (
        <div style={{ background: 'rgba(21,34,64,0.85)', borderRadius: 14, overflow: 'hidden' }}>
          <AnimatePresence>
            {displayDocs.map(doc => <DocumentCard key={doc.id} document={doc} view="list" />)}
          </AnimatePresence>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7, marginTop: 24 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: page === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex' }}>
            <ChevronLeft size={15} style={{margin: 'auto'}} />
          </button>
          
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', padding: '0 10px' }}>
            Page <strong style={{ color: '#fff' }}>{page}</strong> of {totalPages}
          </span>

          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: page === totalPages ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex' }}>
            <ChevronRight size={15} style={{margin: 'auto'}} />
          </button>
        </div>
      )}
    </Layout>
  )
}
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Download, Trash2, ExternalLink, MoreVertical, Eye, Calendar, HardDrive } from 'lucide-react'
import type { Document } from '../types'
import { CATEGORY_COLORS, formatFileSize, formatRelative, truncate } from '../utils'
import { documentService } from '../services/api'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

interface DocumentCardProps { document: Document; view?: 'grid' | 'list' }

export const DocumentCard: React.FC<DocumentCardProps> = ({ document: doc, view = 'grid' }) => {
  const { removeDocument } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const colors = CATEGORY_COLORS[doc.category]

  // ── DELETE ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true)
    setMenuOpen(false)
    try {
      await documentService.deleteDocument(doc.id)
      removeDocument(doc.id)
      toast.success(`"${truncate(doc.originalName, 30)}" deleted`)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message
        ?? 'Failed to delete document'
      toast.error(msg)
      setDeleting(false)
    }
  }

 // ── DOWNLOAD ─────────────────────────────────────────────────────────────
const handleDownload = async () => {
  setMenuOpen(false);
  try {
    // Force 'attachment'
    const data = await documentService.downloadDocument(doc.id, 'attachment');
    if (data?.downloadUrl) {
      window.location.href = data.downloadUrl;
    }
  } catch (error) {
    toast.error('Download failed');
  }
};


// ── VIEW ─────────────────────────────────────────────────────────────────
const handleView = async () => {
  setMenuOpen(false);
  try {
    // Force 'inline'
    const data = await documentService.downloadDocument(doc.id, 'inline');
    if (data?.downloadUrl) {
      window.open(data.downloadUrl, '_blank', 'noopener,noreferrer');
    }
  } catch (error) {
    toast.error('Could not open file');
  }
};

  // ── COPY URL ─────────────────────────────────────────────────────────────
  const handleCopyUrl = async () => {
    setMenuOpen(false)
    const tid = toast.loading('Generating secure link...')
    try {
      // We use 'inline' for shared links so it opens in the browser for whoever clicks it
      const data = await documentService.downloadDocument(doc.id, 'inline')

      if (data?.downloadUrl) {
        await navigator.clipboard.writeText(data.downloadUrl)
        toast.success('Secure link copied to clipboard!', { id: tid })
      } else {
        throw new Error("No URL returned from API")
      }
    } catch (error) {
      console.error("Copy failed:", error)
      toast.error('Could not copy link', { id: tid })
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LIST VIEW
  // ─────────────────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
        style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', flexWrap: 'wrap', opacity: deleting ? 0.4 : 1, transition: 'opacity 0.3s' }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FileText size={15} color={colors.text} />
        </div>
        {/* Name and Meta */}
        <div style={{ flex: '1 1 140px', minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#f0f4ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {doc.originalName}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
            {/* 👇 This ensures we display the Uploader Name if available */}
            {doc.uploadedBy ? (
              <span style={{ color: '#93c5fd', fontWeight: 600 }}>{doc.uploadedBy} · </span>
            ) : null}
            {formatFileSize(doc.fileSize)} · {formatRelative(doc.uploadedAt)}
          </div>
          </div>

        <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: colors.bg, color: colors.text, fontWeight: 600, flexShrink: 0 }}>{doc.category}</span>
        <span className={`status-badge status-${doc.status}`} style={{ flexShrink: 0 }}>{doc.status}</span>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <ActionBtn icon={<Eye size={13} />}      title="View File" onClick={handleView} />
          <ActionBtn icon={<Download size={13} />}  title="Download"  onClick={handleDownload} />
          <ActionBtn icon={<Trash2 size={13} />}    title="Delete"    onClick={handleDelete} danger />
        </div>
      </motion.div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GRID VIEW
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: deleting ? 0.4 : 1, scale: deleting ? 0.92 : 1 }}
      exit={{ opacity: 0, scale: 0.9 }} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
      style={{ background: 'linear-gradient(145deg,rgba(21,34,64,0.95),rgba(11,18,34,0.98))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden', position: 'relative', transition: 'border-color 0.2s' }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = `${colors.accent}40`}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'}>

      {/* Top accent bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg,${colors.accent},transparent)` }} />

      <div style={{ padding: '16px 18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: colors.bg, border: `1px solid ${colors.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={19} color={colors.text} />
          </div>

          {/* Context menu */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ width: 28, height: 28, borderRadius: 6, background: menuOpen ? 'rgba(255,255,255,0.08)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
              <MoreVertical size={14} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setMenuOpen(false)} />
                  <motion.div initial={{ opacity: 0, scale: 0.9, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -5 }} transition={{ duration: 0.12 }}
                    style={{ position: 'absolute', top: 32, right: 0, background: '#1a2b4e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 4, zIndex: 20, minWidth: 165, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                    {[
                      { icon: <Eye size={13} />,          label: 'View File',        fn: handleView,    danger: false },
                      { icon: <Download size={13} />,      label: 'Download File',    fn: handleDownload, danger: false },
                      { icon: <ExternalLink size={13} />,  label: 'Copy Secure URL',  fn: handleCopyUrl, danger: false },
                      { icon: <Trash2 size={13} />,        label: 'Delete',           fn: handleDelete,  danger: true  },
                    ].map((item, i) => (
                      <button key={i} onClick={item.fn}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 7, fontSize: 12.5, color: item.danger ? '#f87171' : 'rgba(255,255,255,0.7)', background: 'transparent', cursor: 'pointer', transition: 'background 0.1s', textAlign: 'left' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = item.danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                        {item.icon} {item.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Name */}
        <div title={doc.originalName} style={{ fontSize: 13.5, fontWeight: 600, color: '#f0f4ff', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.originalName}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {doc.uploadedBy ? (
            <>Uploaded by <span style={{ color: '#93c5fd', fontWeight: 600 }}>{doc.uploadedBy}</span></>
          ) : (
            <span style={{ fontFamily: 'var(--font-mono)' }}>{doc.fileName}</span>
          )}
        </div>
        {/* Category + status */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: colors.bg, color: colors.text, border: `1px solid ${colors.accent}25` }}>{doc.category}</span>
          <span className={`status-badge status-${doc.status}`} style={{ fontSize: 10 }}>{doc.status}</span>
        </div>

        {/* Tags */}
        {doc.tags && doc.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {doc.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Footer meta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}><HardDrive size={10} />{formatFileSize(doc.fileSize)}</span>
            {doc.pageCount && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{doc.pageCount}p</span>}
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}><Calendar size={10} />{formatRelative(doc.uploadedAt)}</span>
        </div>
      </div>
    </motion.div>
  )
}

// ── Tiny action button ────────────────────────────────────────────────────────
const ActionBtn: React.FC<{ icon: React.ReactNode; title: string; onClick: () => void; danger?: boolean }> = ({ icon, title, onClick, danger }) => (
  <button title={title} onClick={onClick}
    style={{ width: 28, height: 28, borderRadius: 6, background: 'transparent', border: '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: danger ? '#f87171' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.15s' }}
    onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)'; b.style.borderColor = danger ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)' }}
    onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'transparent'; b.style.borderColor = 'transparent' }}>
    {icon}
  </button>
)
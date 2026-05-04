// src/components/DocumentCard.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Trash2,
  ExternalLink,
  MoreVertical,
  Eye,
  Calendar,
  HardDrive,
} from 'lucide-react';
import type { Document } from '../types';
import { CATEGORY_COLORS, formatFileSize, formatRelative, truncate } from '../utils';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

interface DocumentCardProps {
  document: Document;
  view?: 'grid' | 'list';
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document: doc, view = 'grid' }) => {
  const { removeDocument } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const colors = CATEGORY_COLORS[doc.category];

  const handleDelete = async () => {
    setDeleting(true);
    setMenuOpen(false);
    try {
      // In production: await documentService.deleteDocument(doc.id)
      await new Promise((r) => setTimeout(r, 800));
      removeDocument(doc.id);
      toast.success(`"${truncate(doc.originalName, 30)}" deleted`);
    } catch {
      toast.error('Failed to delete document');
      setDeleting(false);
    }
  };

  const handleDownload = () => {
    setMenuOpen(false);
    toast.success('Download started');
    // In production: documentService.downloadDocument(doc.id, doc.fileName)
  };

  if (view === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
        style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 120px 100px 100px 80px 80px',
          alignItems: 'center',
          gap: 12,
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          transition: 'background 0.15s ease',
          opacity: deleting ? 0.5 : 1,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: colors.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FileText size={16} color={colors.text} />
        </div>

        {/* Name & tags */}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#f0f4ff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {doc.originalName}
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.3)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {doc.fileName}
          </div>
        </div>

        {/* Category */}
        <div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 9px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              background: colors.bg,
              color: colors.text,
            }}
          >
            {doc.category}
          </span>
        </div>

        {/* Status */}
        <div>
          <span
            className={`status-badge status-${doc.status}`}
            style={{ fontSize: 10 }}
          >
            {doc.status}
          </span>
        </div>

        {/* Size */}
        <div
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.4)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {formatFileSize(doc.fileSize)}
        </div>

        {/* Date */}
        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>
          {formatRelative(doc.uploadedAt)}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
          <ActionButton icon={<Eye size={13} />} title="View" onClick={() => window.open(doc.blobUrl, '_blank')} />
          <ActionButton icon={<Download size={13} />} title="Download" onClick={handleDownload} />
          <ActionButton icon={<Trash2 size={13} />} title="Delete" onClick={handleDelete} danger />
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: deleting ? 0.9 : 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      style={{
        background: 'linear-gradient(145deg, rgba(21,34,64,0.95), rgba(11,18,34,0.98))',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'default',
        opacity: deleting ? 0.6 : 1,
        transition: 'opacity 0.3s ease, border-color 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${colors.accent}40`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
      }}
    >
      {/* Category top bar */}
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${colors.accent}, transparent)`,
        }}
      />

      {/* Card body */}
      <div style={{ padding: '16px 18px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: colors.bg,
              border: `1px solid ${colors.accent}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={20} color={colors.text} />
          </div>

          {/* Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: menuOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <MoreVertical size={14} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div
                    style={{
                      position: 'fixed',
                      inset: 0,
                      zIndex: 10,
                    }}
                    onClick={() => setMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -5 }}
                    transition={{ duration: 0.12 }}
                    style={{
                      position: 'absolute',
                      top: 32,
                      right: 0,
                      background: '#1a2b4e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      padding: 4,
                      zIndex: 20,
                      minWidth: 160,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                    }}
                  >
                    {[
                      { icon: <Eye size={13} />, label: 'View in Azure', onClick: () => window.open(doc.blobUrl, '_blank') },
                      { icon: <Download size={13} />, label: 'Download PDF', onClick: handleDownload },
                      { icon: <ExternalLink size={13} />, label: 'Copy URL', onClick: () => { navigator.clipboard.writeText(doc.blobUrl); toast.success('URL copied'); setMenuOpen(false); } },
                      { icon: <Trash2 size={13} />, label: 'Delete', onClick: handleDelete, danger: true },
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={item.onClick}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 9,
                          padding: '7px 10px',
                          borderRadius: 7,
                          fontSize: 12.5,
                          color: (item as { danger?: boolean }).danger ? '#f87171' : 'rgba(255,255,255,0.7)',
                          background: 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.1s ease',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = (item as { danger?: boolean }).danger
                            ? 'rgba(239,68,68,0.1)'
                            : 'rgba(255,255,255,0.06)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                        }}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* File name */}
        <div
          title={doc.originalName}
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: '#f0f4ff',
            marginBottom: 3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {doc.originalName}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.3)',
            fontFamily: 'var(--font-mono)',
            marginBottom: 12,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {doc.fileName}
        </div>

        {/* Category + status */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 14 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 9px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              background: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.accent}25`,
            }}
          >
            {doc.category}
          </span>
          <span className={`status-badge status-${doc.status}`} style={{ fontSize: 10 }}>
            {doc.status}
          </span>
        </div>

        {/* Tags */}
        {doc.tags && doc.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
            {doc.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 10,
                  padding: '2px 7px',
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.4)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 12,
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              <HardDrive size={10} />
              {formatFileSize(doc.fileSize)}
            </span>
            {doc.pageCount && (
              <span
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.3)',
                }}
              >
                {doc.pageCount}p
              </span>
            )}
          </div>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            <Calendar size={10} />
            {formatRelative(doc.uploadedAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Small action button
const ActionButton: React.FC<{
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
}> = ({ icon, title, onClick, danger }) => (
  <button
    title={title}
    onClick={onClick}
    style={{
      width: 26,
      height: 26,
      borderRadius: 6,
      background: 'transparent',
      border: '1px solid transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: danger ? '#f87171' : 'rgba(255,255,255,0.4)',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background = danger
        ? 'rgba(239,68,68,0.1)'
        : 'rgba(255,255,255,0.06)';
      (e.currentTarget as HTMLButtonElement).style.borderColor = danger
        ? 'rgba(239,68,68,0.2)'
        : 'rgba(255,255,255,0.1)';
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
    }}
  >
    {icon}
  </button>
);
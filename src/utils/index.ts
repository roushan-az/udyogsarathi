// src/utils/index.ts

import type { DocumentCategory } from "../types";



export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelative = (iso: string): string => {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(iso);
};

export const CATEGORY_COLORS: Record<DocumentCategory, { bg: string; text: string; accent: string }> = {
  Sales: { bg: 'rgba(251, 146, 60, 0.15)', text: '#fb923c', accent: '#f97316' },
  Purchase: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', accent: '#3b82f6' },
  Inventory: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', accent: '#22c55e' },
  HR: { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', accent: '#a855f7' },
  Finance: { bg: 'rgba(20, 184, 166, 0.15)', text: '#2dd4bf', accent: '#14b8a6' },
  Legal: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', accent: '#ef4444' },
};

export const CATEGORIES: DocumentCategory[] = ['Sales', 'Purchase', 'Inventory', 'HR', 'Finance', 'Legal'];

export const CATEGORY_ICONS: Record<DocumentCategory, string> = {
  Sales: '📊',
  Purchase: '🛒',
  Inventory: '📦',
  HR: '👥',
  Finance: '💰',
  Legal: '⚖️',
};

export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

export const generateId = (): string => {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const truncate = (str: string, maxLen: number): string => {
  if (str.length <= maxLen) return str;
  return `${str.slice(0, maxLen - 3)}...`;
};
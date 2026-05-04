// src/types/index.ts

export type DocumentCategory = 'Sales' | 'Purchase' | 'Inventory' | 'HR' | 'Finance' | 'Legal';

export type DocumentStatus = 'processing' | 'uploaded' | 'failed' | 'queued';

export interface Document {
  id: string;
  fileName: string;
  originalName: string;
  category: DocumentCategory;
  blobUrl: string;
  fileSize: number;
  uploadedAt: string;
  status: DocumentStatus;
  tags?: string[];
  uploadedBy?: string;
  pageCount?: number;
}

export interface UploadPayload {
  file: File;
  category: DocumentCategory;
  tags?: string[];
}

export interface UploadResponse {
  success: boolean;
  document?: Document;
  message: string;
  blobUrl?: string;
}

export interface DashboardStats {
  totalDocuments: number;
  totalStorage: number; // bytes
  documentsThisMonth: number;
  categoryCounts: Record<DocumentCategory, number>;
  recentActivity: ActivityItem[];
  storageByCategory: StorageItem[];
}

export interface ActivityItem {
  id: string;
  action: 'upload' | 'delete' | 'view' | 'download';
  documentName: string;
  category: DocumentCategory;
  timestamp: string;
  user?: string;
}

export interface StorageItem {
  category: DocumentCategory;
  size: number;
  count: number;
}

export interface FilterOptions {
  category?: DocumentCategory | 'All';
  dateRange?: { from: string; to: string };
  search?: string;
  status?: DocumentStatus | 'All';
}

export interface UploadState {
  file: File | null;
  preview: string | null;
  category: DocumentCategory;
  tags: string[];
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  resultDocument?: Document;
}

export interface ToastConfig {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}
// src/services/api.ts
import type { AxiosProgressEvent } from 'axios';
import axios from 'axios';
import type { Document, DashboardStats, FilterOptions, UploadResponse, PaginationState } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface UploadOptions {
  file: File;
  category: string;
  tags?: string[];
  onProgress?: (progress: number) => void;
}

export const documentService = {
  /**
   * Upload image → FastAPI converts to PDF → stores in Azure Blob → records in PostgreSQL
   */
  async uploadDocument(options: UploadOptions): Promise<UploadResponse> {
    const { file, category, tags = [], onProgress } = options;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('tags', JSON.stringify(tags));

    const response = await api.post<UploadResponse>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return response.data;
  },

  async getDocuments(
    filters: FilterOptions = {},
    pagination: Partial<PaginationState> = {}
  ): Promise<{ documents: Document[]; total: number }> {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'All') params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    if (filters.status && filters.status !== 'All') params.set('status', filters.status);
    if (filters.dateRange?.from) params.set('date_from', filters.dateRange.from);
    if (filters.dateRange?.to) params.set('date_to', filters.dateRange.to);
    if (pagination.page) params.set('page', String(pagination.page));
    if (pagination.pageSize) params.set('page_size', String(pagination.pageSize));

    const response = await api.get<{ documents: Document[]; total: number }>(
      `/documents?${params.toString()}`
    );
    return response.data;
  },

  async getDocument(id: string): Promise<Document> {
    const response = await api.get<Document>(`/documents/${id}`);
    return response.data;
  },

  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  async downloadDocument(id: string, fileName: string): Promise<void> {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

// Mock data for development/demo
export const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    fileName: 'invoice_001.pdf',
    originalName: 'Invoice_March_2024.jpg',
    category: 'Sales',
    blobUrl: 'https://udyogsarathi.blob.core.windows.net/docs/invoice_001.pdf',
    fileSize: 245760,
    uploadedAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'uploaded',
    tags: ['invoice', 'Q1-2024'],
    uploadedBy: 'Rahul Sharma',
    pageCount: 2,
  },
  {
    id: '2',
    fileName: 'purchase_order_089.pdf',
    originalName: 'PO_89_Supplier.jpg',
    category: 'Purchase',
    blobUrl: 'https://udyogsarathi.blob.core.windows.net/docs/purchase_order_089.pdf',
    fileSize: 184320,
    uploadedAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'uploaded',
    tags: ['purchase-order', 'vendor-A'],
    uploadedBy: 'Priya Patel',
    pageCount: 1,
  },
  {
    id: '3',
    fileName: 'hr_letter_emp_045.pdf',
    originalName: 'Employee_Letter_045.png',
    category: 'HR',
    blobUrl: 'https://udyogsarathi.blob.core.windows.net/docs/hr_letter_emp_045.pdf',
    fileSize: 102400,
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'uploaded',
    tags: ['appointment', 'employee'],
    uploadedBy: 'Amit Kumar',
    pageCount: 3,
  },
  {
    id: '4',
    fileName: 'contract_vendor_q1.pdf',
    originalName: 'Vendor_Contract_Q1.jpg',
    category: 'Legal',
    blobUrl: 'https://udyogsarathi.blob.core.windows.net/docs/contract_vendor_q1.pdf',
    fileSize: 512000,
    uploadedAt: new Date(Date.now() - 172800000).toISOString(),
    status: 'uploaded',
    tags: ['contract', 'vendor', 'legal'],
    uploadedBy: 'Sunita Mehta',
    pageCount: 8,
  },
  {
    id: '5',
    fileName: 'gst_return_jan2024.pdf',
    originalName: 'GST_Return_Jan.jpg',
    category: 'Finance',
    blobUrl: 'https://udyogsarathi.blob.core.windows.net/docs/gst_return_jan2024.pdf',
    fileSize: 327680,
    uploadedAt: new Date(Date.now() - 259200000).toISOString(),
    status: 'processing',
    tags: ['GST', 'tax', 'January'],
    uploadedBy: 'Vikram Singh',
    pageCount: 4,
  },
  {
    id: '6',
    fileName: 'stock_report_feb.pdf',
    originalName: 'Stock_Report_Feb.png',
    category: 'Inventory',
    blobUrl: 'https://udyogsarathi.blob.core.windows.net/docs/stock_report_feb.pdf',
    fileSize: 419840,
    uploadedAt: new Date(Date.now() - 345600000).toISOString(),
    status: 'uploaded',
    tags: ['inventory', 'February', 'stock'],
    uploadedBy: 'Neha Gupta',
    pageCount: 6,
  },
];

export const MOCK_STATS: DashboardStats = {
  totalDocuments: 248,
  totalStorage: 1073741824, // 1 GB
  documentsThisMonth: 47,
  categoryCounts: {
    Sales: 89,
    Purchase: 62,
    Inventory: 34,
    HR: 28,
    Finance: 21,
    Legal: 14,
  },
  storageByCategory: [
    { category: 'Sales', size: 312456192, count: 89 },
    { category: 'Purchase', size: 251658240, count: 62 },
    { category: 'Inventory', size: 188743680, count: 34 },
    { category: 'HR', size: 136314880, count: 28 },
    { category: 'Finance', size: 115343360, count: 21 },
    { category: 'Legal', size: 69206016, count: 14 },
  ],
  recentActivity: [
    {
      id: 'a1',
      action: 'upload',
      documentName: 'Invoice_March_2024.pdf',
      category: 'Sales',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'Rahul Sharma',
    },
    {
      id: 'a2',
      action: 'view',
      documentName: 'PO_89_Supplier.pdf',
      category: 'Purchase',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      user: 'Priya Patel',
    },
    {
      id: 'a3',
      action: 'download',
      documentName: 'Employee_Letter_045.pdf',
      category: 'HR',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      user: 'Amit Kumar',
    },
    {
      id: 'a4',
      action: 'upload',
      documentName: 'GST_Return_Jan.pdf',
      category: 'Finance',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      user: 'Vikram Singh',
    },
    {
      id: 'a5',
      action: 'delete',
      documentName: 'Old_Vendor_Contract.pdf',
      category: 'Legal',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      user: 'Sunita Mehta',
    },
  ],
};
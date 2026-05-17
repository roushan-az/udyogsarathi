
import type { AxiosProgressEvent } from 'axios';
import axios from 'axios';
import type {
  Document,
  DashboardStats,
  FilterOptions,
  UploadResponse,
  PaginationState,
} from '../types';

// ── Axios instance ────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000,
});

// Attach stored JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler — clear token and redirect to login
// Global 401 handler — clear token and redirect to login
api.interceptors.response.use(
  (res) => res, 
  (err) => {
    if (err.response?.status === 401) {
      // 1. Clear the invalid or expired token
      authService.logout();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // 2. Redirect to login. 
      // We no longer need to worry about the loop because AppContext
      // will see the token is gone and halt all initial data fetches.
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth service ──────────────────────────────────────────────────────────────

export interface LoginPayload  { email: string; password: string }
export interface RegisterPayload { email: string; password: string; full_name: string }

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface UserOut {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  isSuperuser: boolean;
}

export const authService = {
// src/services/api.ts

// src/services/api.ts
// src/services/api.ts

async login(payload: LoginPayload): Promise<TokenResponse> {
  // We use 'any' here temporarily to catch the raw response
  const res = await api.post<any>('/auth/login', payload);
  
  // SUPPORT BOTH: check for camelCase AND snake_case
  const token = res.data.accessToken || res.data.access_token;
  
  if (!token) {
    console.error("Payload received:", res.data);
    throw new Error("Login succeeded but no token was found in the response.");
  }

  localStorage.setItem('auth_token', token);
  
  // Also save user info if it's in the response
  if (res.data.user) {
    localStorage.setItem('auth_user', JSON.stringify(res.data.user));
  }

  return res.data;
},

  async register(payload: RegisterPayload): Promise<UserOut> {
    const res = await api.post<UserOut>('/auth/register', payload);
    return res.data;
  },

  async me(): Promise<UserOut> {
    const res = await api.get<UserOut>('/auth/me');
    return res.data;
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },
};

// ── Document service ──────────────────────────────────────────────────────────

export interface UploadOptions {
  file: File;
  category: string;
  tags?: string[];
  onProgress?: (pct: number) => void;
}

export const documentService = {
  /**
   * POST /api/documents/upload
   * Sends multipart form → FastAPI converts image→PDF→Blob→PostgreSQL.
   * onProgress fires with 0-100 as the multipart body uploads.
   */
  async uploadDocument(opts: UploadOptions): Promise<UploadResponse> {
    const { file, category, tags = [], onProgress } = opts;
    const form = new FormData();
    form.append('file', file);
    form.append('category', category);
    form.append('tags', JSON.stringify(tags));

    const res = await api.post<UploadResponse>('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e: AxiosProgressEvent) => {
        if (e.total && onProgress) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return res.data;
  },

  /** GET /api/documents/?category=…&search=…&page=… */
  async getDocuments(
    filters: FilterOptions = {},
    pagination: Partial<PaginationState> = {}
  ): Promise<{ documents: Document[]; total: number; page: number; pageSize: number }> {
    const p = new URLSearchParams();
    if (filters.category && filters.category !== 'All') p.set('category', filters.category);
    if (filters.search)                                  p.set('search', filters.search);
    if (filters.status && filters.status !== 'All')      p.set('status', filters.status);
    if (filters.dateRange?.from)                         p.set('date_from', filters.dateRange.from);
    if (filters.dateRange?.to)                           p.set('date_to', filters.dateRange.to);
    if (pagination.page)                                 p.set('page', String(pagination.page));
    if (pagination.pageSize)                             p.set('page_size', String(pagination.pageSize));

    const res = await api.get(`/documents/?${p.toString()}`);
    return res.data;
  },

  /** GET /api/documents/:id */
  async getDocument(id: string): Promise<Document> {
    const res = await api.get<Document>(`/documents/${id}`);
    return res.data;
  },

  /** DELETE /api/documents/:id */
  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },

  /**
   * GET /api/documents/:id/download
   * Backend returns { downloadUrl, expiresInMinutes }.
   * We open the SAS URL directly — no blob stream needed.
   */
  async downloadDocument(id: string, fileName: string): Promise<void> {
    const res = await api.get<{ downloadUrl: string; expiresInMinutes: number }>(
      `/documents/${id}/download`
    );
    const link = document.createElement('a');
    link.href = res.data.downloadUrl;
    link.setAttribute('download', fileName);
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  /** GET /api/dashboard/stats */
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await api.get<DashboardStats>('/dashboard/stats');
    return res.data;
  },
};

// ── Health service ────────────────────────────────────────────────────────────

export interface HealthStatus {
  status: 'healthy' | 'degraded';
  version: string;
  database: boolean;
  storage: boolean;
}

export const healthService = {
  async check(): Promise<HealthStatus> {
    const res = await api.get<HealthStatus>('/health');
    return res.data;
  },
};

// src/services/api.ts

// Add these interfaces to match app/schemas/analytics.py
export interface AnalyticsKPI {
  totalDocuments: number;
  totalStorage: number;
  documentsThisWeek: number;
  documentsLastWeek: number;
  weekOverWeekPct: number;
  avgFileSizeBytes: number;
  totalPdfConversions: number;
  successRate: number;
}

export interface AnalyticsResponse {
  kpi: AnalyticsKPI;
  weeklyTrend: any[];
  monthlyStorage: any[];
  categoryRadar: any[];
  topUploaders: any[];
}

export const analyticsService = {
  async getAnalytics(): Promise<AnalyticsResponse> {
    const res = await api.get<AnalyticsResponse>('/analytics');
    return res.data;
  }
};
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Document, FilterOptions, PaginationState, DashboardStats } from '../types';
// Add authService to your import here:
import { documentService, authService, analyticsService } from '../services/api'; 
import { MOCK_DOCUMENTS, MOCK_STATS } from '../services/mockData';

import type { AnalyticsResponse } from '../services/api';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ── Context shape ─────────────────────────────────────────────────────────────

interface AppContextValue {
  documents:          Document[];
  stats:              DashboardStats | null;
  filters:            FilterOptions;
  pagination:         PaginationState;
  isLoading:          boolean;
  statsLoading:       boolean;
  error:              string | null;
  sidebarCollapsed:   boolean;
  currentUser:        { name: string; email: string } | null;
  setFilters:         (f: FilterOptions) => void;
  setPagination:      (p: Partial<PaginationState>) => void;
  setSidebarCollapsed:(v: boolean) => void;
  setCurrentUser:     (u: { name: string; email: string } | null) => void;
  addDocument:        (doc: Document) => void;
  removeDocument:     (id: string) => void;
  refreshDocuments:   (filters?: FilterOptions, pagination?: Partial<PaginationState>) => Promise<void>;
  refreshStats:       () => Promise<void>;

  analyticsData: AnalyticsResponse | null;
  analyticsLoading: boolean;
  refreshAnalytics: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [documents,        setDocuments]        = useState<Document[]>(USE_MOCK ? MOCK_DOCUMENTS : []);
  const [stats,            setStats]            = useState<DashboardStats | null>(USE_MOCK ? MOCK_STATS : null);
  const [isLoading,        setIsLoading]        = useState(!USE_MOCK);
  const [statsLoading,     setStatsLoading]     = useState(!USE_MOCK);
  const [error,            setError]            = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUser,      setCurrentUser]      = useState<{ name: string; email: string } | null>(null);
  const [filters,          setFilters]          = useState<FilterOptions>({ category: 'All', status: 'All' });
  const [pagination,       setPaginationState]  = useState<PaginationState>({ page: 1, pageSize: 10, total: 0 });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(!USE_MOCK);

// 1. Update the signature to accept a boolean
const refreshAnalytics = useCallback(async (silent = false) => {
  // 2. Only show loading screens if we aren't doing a silent background update
  if (!silent) setAnalyticsLoading(true);
  try {
    const data = await analyticsService.getAnalytics();
    setAnalyticsData(data);
  } catch (err) {
    console.error("Failed to fetch analytics:", err);
  } finally {
    if (!silent) setAnalyticsLoading(false);
  }
}, []);

  // Update Bootstrap to include analytics
  useEffect(() => {
    if (USE_MOCK || !authService.isAuthenticated()) return;
    refreshDocuments();
    refreshStats();
    refreshAnalytics(); // Fetch real analytics data on mount
  }, [refreshAnalytics]);

  const setPagination = useCallback((partial: Partial<PaginationState>) => {
    setPaginationState(prev => ({ ...prev, ...partial }));
  }, []);

  // ── Fetch documents from backend ──────────────────────────────────────────

  const refreshDocuments = useCallback(async (
    overrideFilters?: FilterOptions,
    overridePagination?: Partial<PaginationState>,
  ) => {
    if (USE_MOCK) return;

    setIsLoading(true);
    setError(null);
    try {
      const f = overrideFilters  ?? filters;
      const p = overridePagination ?? pagination;
      const data = await documentService.getDocuments(f, p);
      setDocuments(data.documents);
      setPaginationState(prev => ({ ...prev, total: data.total }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load documents';
      setError(msg);
      console.error('[AppContext] refreshDocuments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination]);

  // ── Fetch dashboard stats from backend ────────────────────────────────────

  const refreshStats = useCallback(async () => {
    if (USE_MOCK) return;

    setStatsLoading(true);
    try {
      const data = await documentService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('[AppContext] refreshStats:', err);
      // Non-fatal — dashboard still renders with stale/empty stats
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Bootstrap: load data once on mount ───────────────────────────────────

// ── Bootstrap: load data once on mount ───────────────────────────────────

useEffect(() => {
    if (USE_MOCK) return;
    
    // BULLETPROOF FIX: Do not fetch if the user does not have a token.
    // This completely ignores Azure URL quirks.
    if (!authService.isAuthenticated()) {
      return; 
    }

    refreshDocuments();
    refreshStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Optimistic local mutations ────────────────────────────────────────────

  // AppContext.tsx

  const addDocument = useCallback((doc: Document) => {
    setDocuments(prev => [doc, ...prev]);
    setStats(prev => prev ? {
      ...prev,
      totalDocuments: prev.totalDocuments + 1,
      documentsThisMonth: prev.documentsThisMonth + 1,
      categoryCounts: {
        ...prev.categoryCounts,
        [doc.category]: (prev.categoryCounts[doc.category] ?? 0) + 1,
      },
    } : prev);
    
    // NEW: Silently fetch fresh analytics in the background!
    refreshAnalytics(true); 
  }, [refreshAnalytics]); // make sure to add refreshAnalytics to the dependency array

  const removeDocument = useCallback((id: string) => {
    setDocuments(prev => {
      // ... your existing remove logic ...
      return prev.filter(d => d.id !== id);
    });
    
    // NEW: Silently fetch fresh analytics in the background!
    refreshAnalytics(true);
  }, [refreshAnalytics]);

  return (
    <AppContext.Provider value={{
      documents, stats, filters, pagination,
      isLoading, statsLoading, error,
      sidebarCollapsed, currentUser,
      setFilters, setPagination, setSidebarCollapsed, setCurrentUser,
      addDocument, removeDocument, refreshDocuments, refreshStats,
      analyticsData, analyticsLoading, refreshAnalytics,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
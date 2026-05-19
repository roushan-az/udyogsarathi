// src/context/AppContext.tsx

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'; // <-- ADD useRef
import type { Document, FilterOptions, PaginationState, DashboardStats } from '../types';
import { documentService, authService, analyticsService } from '../services/api'; 
import { MOCK_DOCUMENTS, MOCK_STATS } from '../services/mockData';

import type { AnalyticsResponse } from '../services/api';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

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
  refreshDocuments:   (filters?: FilterOptions, pagination?: Partial<PaginationState>, silent?: boolean) => Promise<void>;
  refreshStats:       () => Promise<void>;

  analyticsData: AnalyticsResponse | null;
  analyticsLoading: boolean;
  refreshAnalytics: (silent?: boolean) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

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
  const [analyticsData,    setAnalyticsData]    = useState<AnalyticsResponse | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(!USE_MOCK);

  // 1. CREATE THE IN-MEMORY CACHE
  const docCache = useRef<Record<string, { documents: Document[], total: number }>>({});

  const refreshAnalytics = useCallback(async (silent = false) => {
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

  const setPagination = useCallback((partial: Partial<PaginationState>) => {
    setPaginationState(prev => ({ ...prev, ...partial }));
  }, []);

  // ── BLZING FAST FETCH WITH CACHE ──────────────────────────────────────────

  const refreshDocuments = useCallback(async (
    overrideFilters?: FilterOptions,
    overridePagination?: Partial<PaginationState>,
    silent = false
  ) => {
    if (USE_MOCK) return;

    const f = overrideFilters ?? filters;
    const p = overridePagination ?? pagination;
    
    // Generate a unique key for this exact filter combination
    const cacheKey = `${f.category}-${f.status}-${f.search || ''}-${p.page || 1}`;

    // 2. INSTANT CACHE HIT: Serve immediately if we have it!
    if (docCache.current[cacheKey]) {
      setDocuments(docCache.current[cacheKey].documents);
      setPaginationState(prev => ({ ...prev, total: docCache.current[cacheKey].total }));
    } else if (!silent) {
      setIsLoading(true); // Only show spinner if no cache exists
    }

    setError(null);
    try {
      // 3. Always fetch fresh data silently in the background
      const data = await documentService.getDocuments(f, p);
      
      setDocuments(data.documents);
      setPaginationState(prev => ({ ...prev, total: data.total }));
      
      // 4. Save to cache for next time
      docCache.current[cacheKey] = { documents: data.documents, total: data.total };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load documents';
      setError(msg);
      console.error('[AppContext] refreshDocuments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination]);

  const refreshStats = useCallback(async () => {
    if (USE_MOCK) return;
    setStatsLoading(true);
    try {
      const data = await documentService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('[AppContext] refreshStats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (USE_MOCK) return;
    if (!authService.isAuthenticated()) return; 

    refreshDocuments();
    refreshStats();
    refreshAnalytics();
  }, []); 

  // ── MUTATIONS (Clear Cache on upload/delete) ──────────────────────────────

  const addDocument = useCallback((doc: Document) => {
    docCache.current = {}; // Wipe cache so new files appear instantly everywhere
    
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
    
    refreshAnalytics(true); 
  }, [refreshAnalytics]); 

  const removeDocument = useCallback((id: string) => {
    docCache.current = {}; // Wipe cache

    setDocuments(prev => {
      const removed = prev.find(d => d.id === id);
      if (removed) {
        setStats(s => s ? {
          ...s,
          totalDocuments: s.totalDocuments - 1,
          categoryCounts: {
            ...s.categoryCounts,
            [removed.category]: Math.max(0, (s.categoryCounts[removed.category] ?? 1) - 1),
          },
        } : s);
        setPaginationState(p => ({ ...p, total: Math.max(0, p.total - 1) }));
      }
      return prev.filter(d => d.id !== id);
    });
    
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
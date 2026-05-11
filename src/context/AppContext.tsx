import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Document, FilterOptions, PaginationState, DashboardStats } from '../types';
// Add authService to your import here:
import { documentService, authService } from '../services/api'; 
import { MOCK_DOCUMENTS, MOCK_STATS } from '../services/mockData';

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

  const addDocument = useCallback((doc: Document) => {
    setDocuments(prev => [doc, ...prev]);
    setPaginationState(prev => ({ ...prev, total: prev.total + 1 }));
    setStats(prev => prev ? {
      ...prev,
      totalDocuments: prev.totalDocuments + 1,
      documentsThisMonth: prev.documentsThisMonth + 1,
      categoryCounts: {
        ...prev.categoryCounts,
        [doc.category]: (prev.categoryCounts[doc.category] ?? 0) + 1,
      },
    } : prev);
  }, []);

  const removeDocument = useCallback((id: string) => {
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
  }, []);

  return (
    <AppContext.Provider value={{
      documents, stats, filters, pagination,
      isLoading, statsLoading, error,
      sidebarCollapsed, currentUser,
      setFilters, setPagination, setSidebarCollapsed, setCurrentUser,
      addDocument, removeDocument, refreshDocuments, refreshStats,
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
// src/context/AppContext.tsx

import type { ReactNode } from 'react';
import {
  createContext, useContext, useState,
  useCallback, useEffect, useRef,
} from 'react';
import type { Document, FilterOptions, PaginationState, DashboardStats } from '../types';
import {
  documentService, authService, analyticsService,
} from '../services/api';
import type { AnalyticsResponse } from '../services/api';
import { MOCK_DOCUMENTS, MOCK_STATS } from '../services/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ── Context shape ─────────────────────────────────────────────────────────────

interface AppContextValue {
  documents:           Document[];
  stats:               DashboardStats | null;
  analyticsData:       AnalyticsResponse | null;
  filters:             FilterOptions;
  pagination:          PaginationState;
  isLoading:           boolean;
  statsLoading:        boolean;
  analyticsLoading:    boolean;
  error:               string | null;
  sidebarCollapsed:    boolean;
  currentUser: { name: string; email: string; is_superuser?: boolean } | null;
  setFilters:          (f: FilterOptions) => void;
  setPagination:       (p: Partial<PaginationState>) => void;
  setSidebarCollapsed: (v: boolean) => void;
  // ✅ Callers use this wrapper — it keeps localStorage in sync automatically.
  setCurrentUser:      (u: { name: string; email: string; is_superuser?: boolean } | null) => void;
  addDocument:         (doc: Document) => void;
  removeDocument:      (id: string) => void;
  // silent=true → background refresh, no spinner shown
  refreshDocuments:    (filters?: FilterOptions, pagination?: Partial<PaginationState>, silent?: boolean) => Promise<void>;
  refreshStats:        () => Promise<void>;
  refreshAnalytics:    (silent?: boolean) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [documents,        setDocuments]        = useState<Document[]>(USE_MOCK ? MOCK_DOCUMENTS : []);
  const [stats,            setStats]            = useState<DashboardStats | null>(USE_MOCK ? MOCK_STATS : null);
  const [analyticsData,    setAnalyticsData]    = useState<AnalyticsResponse | null>(null);
  const [isLoading,        setIsLoading]        = useState(!USE_MOCK);
  const [statsLoading,     setStatsLoading]     = useState(!USE_MOCK);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error,            setError]            = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUser,      setCurrentUserState] = useState<{ name: string; email: string; is_superuser?: boolean } | null>(null);
  const [filters,          setFiltersState]     = useState<FilterOptions>({ category: 'All', status: 'All' });
  const [pagination,       setPaginationState]  = useState<PaginationState>({ page: 1, pageSize: 10000, total: 0 });

  // ── Refs: avoid stale closures in callbacks ───────────────────────────────
  const filtersRef    = useRef(filters);
  const paginationRef = useRef(pagination);
  const isMountedRef  = useRef(true);

  filtersRef.current    = filters;
  paginationRef.current = pagination;

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const docCache = useRef<Record<string, { documents: Document[]; total: number }>>({});

  const setFilters = useCallback((f: FilterOptions) => {
    setFiltersState(f);
    filtersRef.current = f;
  }, []);

  const setPagination = useCallback((partial: Partial<PaginationState>) => {
    setPaginationState(prev => {
      const next = { ...prev, ...partial };
      paginationRef.current = next;
      return next;
    });
  }, []);

  // ── setCurrentUser ────────────────────────────────────────────────────────
  // ✅ FIX: Wrap the raw state setter so every caller automatically keeps
  // localStorage in sync. This means the persisted identity is always
  // authoritative and consistent, whether set from the bootstrap /me call,
  // a profile update, or an explicit logout.

  const setCurrentUser = useCallback(
    (u: { name: string; email: string; is_superuser?: boolean } | null) => {
      setCurrentUserState(u);
      if (u) {
        localStorage.setItem('auth_user', JSON.stringify({
          fullName:    u.name,
          email:       u.email,
          isSuperuser: u.is_superuser ?? false,
        }));
      } else {
        localStorage.removeItem('auth_user');
      }
    },
    []
  );

  // ── refreshDocuments ──────────────────────────────────────────────────────

  const refreshDocuments = useCallback(async (
    overrideFilters?:    FilterOptions,
    overridePagination?: Partial<PaginationState>,
    silent = false,
  ) => {
    if (USE_MOCK) return;
    if (!authService.isAuthenticated()) {
      if (isMountedRef.current) setIsLoading(false);
      return;
    }

    const f = overrideFilters    ?? filtersRef.current;
    const p = overridePagination ?? paginationRef.current;

    const cacheKey = [
      f.category ?? 'All',
      f.status   ?? 'All',
      f.search   ?? '',
      p.page     ?? 1,
      p.pageSize ?? 10000,
    ].join('|');

    if (docCache.current[cacheKey]) {
      if (isMountedRef.current) {
        setDocuments(docCache.current[cacheKey].documents);
        setPaginationState(prev => ({ ...prev, total: docCache.current[cacheKey].total }));
      }
    } else if (!silent) {
      if (isMountedRef.current) setIsLoading(true);
    }

    if (isMountedRef.current) setError(null);

    try {
      const data = await documentService.getDocuments(f, p);

      if (isMountedRef.current) {
        setDocuments(data.documents || []);
        setPaginationState(prev => ({ ...prev, total: data.total }));
        docCache.current[cacheKey] = { documents: data.documents || [], total: data.total };
      }
    } catch (err) {
      if (isMountedRef.current) {
        if (!docCache.current[cacheKey]) {
          setError(err instanceof Error ? err.message : 'Failed to load documents');
        }
        console.error('[AppContext] refreshDocuments:', err);
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, []);

  // ── refreshStats ──────────────────────────────────────────────────────────

  const refreshStats = useCallback(async () => {
    if (USE_MOCK) return;
    if (!authService.isAuthenticated()) {
      if (isMountedRef.current) setStatsLoading(false);
      return;
    }
    if (isMountedRef.current) setStatsLoading(true);
    try {
      const data = await documentService.getDashboardStats();
      if (isMountedRef.current) setStats(data);
    } catch (err) {
      console.error('[AppContext] refreshStats:', err);
    } finally {
      if (isMountedRef.current) setStatsLoading(false);
    }
  }, []);

  // ── refreshAnalytics ──────────────────────────────────────────────────────

  const refreshAnalytics = useCallback(async (silent = false) => {
    if (USE_MOCK) return;
    if (!authService.isAuthenticated()) return;

    if (!silent && isMountedRef.current) setAnalyticsLoading(true);
    try {
      const data = await analyticsService.getAnalytics();
      if (isMountedRef.current) setAnalyticsData(data);
    } catch (err) {
      console.error('[AppContext] refreshAnalytics:', err);
    } finally {
      if (!silent && isMountedRef.current) setAnalyticsLoading(false);
    }
  }, []);

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  // Strategy:
  //   1. If no token → not logged in, stop.
  //   2. Token found (page refresh OR browser reopen after close):
  //      a. Optimistically restore identity from localStorage immediately
  //         so the UI is not blank while the network request is in flight.
  //      b. Call authService.me() to verify the token and get the live,
  //         authoritative role from the server. This is the fix for the
  //         admin-shown-as-user bug — role always comes from the server,
  //         never from stale localStorage alone.
  //      c. If /me fails (token expired/invalid) → logout + redirect.
  //   3. Clear the doc cache so a freshly-logged-in user never sees data
  //      that was cached for a previous user in the same browser tab.

  useEffect(() => {
    if (USE_MOCK) return;

    if (!authService.isAuthenticated()) {
      // No token at all — not logged in, nothing to restore.
      setIsLoading(false);
      setStatsLoading(false);
      return;
    }

    // ── Step 1: Optimistic paint ──────────────────────────────────────────
    // Show something immediately while /me is in flight, so the UI does
    // not flash blank on page refresh or browser reopen.
    const cachedRaw = localStorage.getItem('auth_user');
    if (cachedRaw) {
      try {
        const cached = JSON.parse(cachedRaw);
        // Note: we call setCurrentUserState (NOT setCurrentUser) here to
        // avoid redundantly writing back to localStorage what we just read.
        setCurrentUserState({
          name:         cached.fullName ?? cached.full_name ?? cached.name ?? '',
          email:        cached.email    ?? '',
          is_superuser: cached.isSuperuser ?? cached.is_superuser ?? false,
        });
      } catch {
        // Corrupted cache entry — ignore; /me below will populate the state.
      }
    }

    // ── Step 2: Authoritative role verification ───────────────────────────
    // Always call /me on boot. This is what prevents a stale cached role
    // (e.g. regular user) from persisting when a different user (e.g. admin)
    // has since logged in on this machine.
    authService.me()
      .then(user => {
        if (!isMountedRef.current) return;

        // Overwrite state and localStorage with the live server values.
        // setCurrentUser (the wrapper) handles both in one call.
        setCurrentUser({
          name:         user.fullName,
          email:        user.email,
          is_superuser: user.isSuperuser,
        });
      })
      .catch(() => {
        if (!isMountedRef.current) return;
        // Token is expired or invalid — clear everything and force re-login.
        authService.logout();
        setCurrentUserState(null);
        window.location.href = '/login';
      });

    // ── Step 3: Clear doc cache + fetch data for the current user ─────────
    // Wiping the cache ensures that even if a previous user's documents
    // are still in memory, they will never be served to the new user.
    docCache.current = {};

    refreshDocuments({ category: 'All', status: 'All' }, { page: 1, pageSize: 10000 });
    refreshStats();
  // Empty deps is intentional: this is "on mount only" bootstrap.
  // Re-running it on every render would cause infinite fetch loops.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Optimistic mutations ──────────────────────────────────────────────────

  const addDocument = useCallback((doc: Document) => {
    docCache.current = {};

    setDocuments(prev => [doc, ...prev]);
    setPaginationState(p => ({ ...p, total: p.total + 1 }));
    setStats(prev => prev ? {
      ...prev,
      totalDocuments:     prev.totalDocuments + 1,
      documentsThisMonth: prev.documentsThisMonth + 1,
      categoryCounts: {
        ...prev.categoryCounts,
        [doc.category]: (prev.categoryCounts[doc.category] ?? 0) + 1,
      },
    } : prev);

    refreshAnalytics(true);
  }, [refreshAnalytics]);

  const removeDocument = useCallback((id: string) => {
    docCache.current = {};

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
      documents, stats, analyticsData, filters, pagination,
      isLoading, statsLoading, analyticsLoading, error,
      sidebarCollapsed, currentUser,
      setFilters, setPagination, setSidebarCollapsed,
      setCurrentUser,   // ← the wrapper, not the raw setter
      addDocument, removeDocument,
      refreshDocuments, refreshStats, refreshAnalytics,
    }}>
      {children}
    </AppContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
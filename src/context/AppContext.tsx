// src/context/AppContext.tsx
import type {ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Document, FilterOptions, PaginationState } from '../types';

import type { DashboardStats } from '../types';
import { MOCK_DOCUMENTS, MOCK_STATS } from '../services/api';

interface AppContextValue {
  documents: Document[];
  stats: DashboardStats | null;
  filters: FilterOptions;
  pagination: PaginationState;
  isLoading: boolean;
  sidebarCollapsed: boolean;
  setFilters: (filters: FilterOptions) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  addDocument: (doc: Document) => void;
  removeDocument: (id: string) => void;
  refreshDocuments: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const [stats, setStats] = useState<DashboardStats | null>(MOCK_STATS);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({ category: 'All', status: 'All' });
  const [pagination, setPaginationState] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: MOCK_DOCUMENTS.length,
  });

  const setPagination = useCallback((partial: Partial<PaginationState>) => {
    setPaginationState((prev) => ({ ...prev, ...partial }));
  }, []);

  const addDocument = useCallback((doc: Document) => {
    setDocuments((prev) => [doc, ...prev]);
    setStats((prev) =>
      prev
        ? {
            ...prev,
            totalDocuments: prev.totalDocuments + 1,
            documentsThisMonth: prev.documentsThisMonth + 1,
            categoryCounts: {
              ...prev.categoryCounts,
              [doc.category]: (prev.categoryCounts[doc.category] || 0) + 1,
            },
          }
        : prev
    );
  }, []);

  const removeDocument = useCallback((id: string) => {
    setDocuments((prev) => {
      const removed = prev.find((d) => d.id === id);
      if (removed) {
        setStats((s) =>
          s
            ? {
                ...s,
                totalDocuments: s.totalDocuments - 1,
                categoryCounts: {
                  ...s.categoryCounts,
                  [removed.category]: Math.max(0, (s.categoryCounts[removed.category] || 1) - 1),
                },
              }
            : s
        );
      }
      return prev.filter((d) => d.id !== id);
    });
  }, []);

  const refreshDocuments = useCallback(async () => {
    setIsLoading(true);
    // In production: await documentService.getDocuments(filters, pagination)
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
  }, []);

  const refreshStats = useCallback(async () => {
    // In production: const s = await documentService.getDashboardStats()
    await new Promise((r) => setTimeout(r, 300));
  }, []);

  return (
    <AppContext.Provider
      value={{
        documents,
        stats,
        filters,
        pagination,
        isLoading,
        sidebarCollapsed,
        setFilters,
        setPagination,
        setSidebarCollapsed,
        addDocument,
        removeDocument,
        refreshDocuments,
        refreshStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
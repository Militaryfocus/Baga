import { useState, useCallback, useMemo } from 'react';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

interface UsePaginationReturn {
  pagination: PaginationState;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  hasData: boolean;
  reset: () => void;
}

export const usePagination = (options: UsePaginationOptions = {}): UsePaginationReturn => {
  const {
    initialPage = 1,
    initialLimit = 10,
    onPageChange,
    onLimitChange
  } = options;

  const [pagination, setPaginationState] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0
  });

  const setPage = useCallback((page: number) => {
    setPaginationState(prev => {
      const newPage = Math.max(1, Math.min(page, prev.totalPages || 1));
      if (newPage !== prev.page) {
        onPageChange?.(newPage);
        return { ...prev, page: newPage };
      }
      return prev;
    });
  }, [onPageChange]);

  const setLimit = useCallback((limit: number) => {
    setPaginationState(prev => {
      const newLimit = Math.max(1, limit);
      const newTotalPages = Math.ceil(prev.total / newLimit);
      const newPage = Math.min(prev.page, newTotalPages || 1);
      
      onLimitChange?.(newLimit);
      return {
        ...prev,
        limit: newLimit,
        totalPages: newTotalPages,
        page: newPage
      };
    });
  }, [onLimitChange]);

  const setTotal = useCallback((total: number) => {
    setPaginationState(prev => {
      const newTotalPages = Math.ceil(total / prev.limit);
      const newPage = Math.min(prev.page, newTotalPages || 1);
      
      return {
        ...prev,
        total,
        totalPages: newTotalPages,
        page: newPage
      };
    });
  }, []);

  const nextPage = useCallback(() => {
    setPage(pagination.page + 1);
  }, [pagination.page, setPage]);

  const prevPage = useCallback(() => {
    setPage(pagination.page - 1);
  }, [pagination.page, setPage]);

  const goToFirstPage = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const goToLastPage = useCallback(() => {
    setPage(pagination.totalPages);
  }, [pagination.totalPages, setPage]);

  const canGoNext = useMemo(() => {
    return pagination.page < pagination.totalPages;
  }, [pagination.page, pagination.totalPages]);

  const canGoPrev = useMemo(() => {
    return pagination.page > 1;
  }, [pagination.page]);

  const hasData = useMemo(() => {
    return pagination.total > 0;
  }, [pagination.total]);

  const reset = useCallback(() => {
    setPaginationState({
      page: initialPage,
      limit: initialLimit,
      total: 0,
      totalPages: 0
    });
  }, [initialPage, initialLimit]);

  return {
    pagination,
    setPage,
    setLimit,
    setTotal,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    canGoNext,
    canGoPrev,
    hasData,
    reset
  };
};
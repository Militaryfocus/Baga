import { useState, useCallback, useMemo } from 'react';

interface FilterState {
  [key: string]: string | string[] | number | undefined;
}

interface UseSearchAndFiltersOptions {
  initialFilters?: FilterState;
  onFiltersChange?: (filters: FilterState) => void;
  debounceMs?: number;
}

interface UseSearchAndFiltersReturn {
  searchQuery: string;
  filters: FilterState;
  setSearchQuery: (query: string) => void;
  setFilter: (key: string, value: any) => void;
  setFilters: (filters: FilterState) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  getFilterValue: (key: string) => any;
  reset: () => void;
}

export const useSearchAndFilters = (options: UseSearchAndFiltersOptions = {}): UseSearchAndFiltersReturn => {
  const {
    initialFilters = {},
    onFiltersChange,
    debounceMs = 300
  } = options;

  const [searchQuery, setSearchQueryState] = useState('');
  const [filters, setFiltersState] = useState<FilterState>(initialFilters);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  const setFilter = useCallback((key: string, value: any) => {
    setFiltersState(prev => {
      const newFilters = { ...prev, [key]: value };
      onFiltersChange?.(newFilters);
      return newFilters;
    });
  }, [onFiltersChange]);

  const setFilters = useCallback((newFilters: FilterState) => {
    setFiltersState(newFilters);
    onFiltersChange?.(newFilters);
  }, [onFiltersChange]);

  const clearFilter = useCallback((key: string) => {
    setFiltersState(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      onFiltersChange?.(newFilters);
      return newFilters;
    });
  }, [onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    setFiltersState({});
    setSearchQueryState('');
    onFiltersChange?.({});
  }, [onFiltersChange]);

  const hasActiveFilters = useMemo(() => {
    return searchQuery.trim() !== '' || Object.keys(filters).length > 0;
  }, [searchQuery, filters]);

  const getFilterValue = useCallback((key: string) => {
    return filters[key];
  }, [filters]);

  const reset = useCallback(() => {
    setSearchQueryState('');
    setFiltersState(initialFilters);
    onFiltersChange?.(initialFilters);
  }, [initialFilters, onFiltersChange]);

  return {
    searchQuery,
    filters,
    setSearchQuery,
    setFilter,
    setFilters,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    getFilterValue,
    reset
  };
};
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchHeroes, 
  fetchHeroById, 
  fetchHeroBySlug,
  searchHeroes,
  fetchHeroRoles,
  fetchHeroDifficulties,
  fetchPopularHeroes,
  setFilters,
  setPagination,
  clearError,
  clearCurrentHero
} from '../store/slices/heroesSlice';
import { useCallback } from 'react';

export const useHeroes = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    heroes, 
    currentHero, 
    popularHeroes, 
    roles, 
    difficulties,
    filters, 
    pagination, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.heroes);

  const handleFetchHeroes = useCallback(
    (params?: { filters?: any; pagination?: any }) => {
      return dispatch(fetchHeroes(params || {}));
    },
    [dispatch]
  );

  const handleFetchHeroById = useCallback(
    (id: string) => {
      return dispatch(fetchHeroById(id));
    },
    [dispatch]
  );

  const handleFetchHeroBySlug = useCallback(
    (slug: string) => {
      return dispatch(fetchHeroBySlug(slug));
    },
    [dispatch]
  );

  const handleSearchHeroes = useCallback(
    (query: string, limit?: number) => {
      return dispatch(searchHeroes({ query, limit }));
    },
    [dispatch]
  );

  const handleFetchHeroRoles = useCallback(() => {
    return dispatch(fetchHeroRoles());
  }, [dispatch]);

  const handleFetchHeroDifficulties = useCallback(() => {
    return dispatch(fetchHeroDifficulties());
  }, [dispatch]);

  const handleFetchPopularHeroes = useCallback(
    (limit?: number) => {
      return dispatch(fetchPopularHeroes(limit));
    },
    [dispatch]
  );

  const handleSetFilters = useCallback(
    (newFilters: any) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  const handleSetPagination = useCallback(
    (newPagination: any) => {
      dispatch(setPagination(newPagination));
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleClearCurrentHero = useCallback(() => {
    dispatch(clearCurrentHero());
  }, [dispatch]);

  return {
    heroes,
    currentHero,
    popularHeroes,
    roles,
    difficulties,
    filters,
    pagination,
    isLoading,
    error,
    fetchHeroes: handleFetchHeroes,
    fetchHeroById: handleFetchHeroById,
    fetchHeroBySlug: handleFetchHeroBySlug,
    searchHeroes: handleSearchHeroes,
    fetchHeroRoles: handleFetchHeroRoles,
    fetchHeroDifficulties: handleFetchHeroDifficulties,
    fetchPopularHeroes: handleFetchPopularHeroes,
    setFilters: handleSetFilters,
    setPagination: handleSetPagination,
    clearError: handleClearError,
    clearCurrentHero: handleClearCurrentHero,
  };
};
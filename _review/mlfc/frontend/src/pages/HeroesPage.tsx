import { useEffect, useState } from 'react';
import { useHeroes } from '../hooks/useHeroes';
import { usePagination } from '../hooks/usePagination';
import { useSearchAndFilters } from '../hooks/useSearchAndFilters';
import HeroCard from '../components/HeroCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { SearchInput } from '../components/SearchInput';
import { FilterDropdown } from '../components/FilterDropdown';
import { Pagination } from '../components/Pagination';
import { ErrorMessage } from '../components/ErrorMessage';
import { Search, Filter, Star } from 'lucide-react';

const HeroesPage = () => {
  const { 
    heroes, 
    roles, 
    difficulties, 
    filters, 
    pagination, 
    isLoading, 
    error,
    fetchHeroes, 
    setFilters, 
    setPagination,
    clearError
  } = useHeroes();
  
  const [showFilters, setShowFilters] = useState(false);
  
  const paginationHook = usePagination({
    initialPage: pagination.page,
    initialLimit: pagination.limit,
    onPageChange: (page) => setPagination({ ...pagination, page }),
    onLimitChange: (limit) => setPagination({ ...pagination, limit, page: 1 })
  });

  const searchAndFilters = useSearchAndFilters({
    initialFilters: filters,
    onFiltersChange: (newFilters) => {
      setFilters(newFilters);
      setPagination({ ...pagination, page: 1 });
    }
  });

  useEffect(() => {
    fetchHeroes({ 
      filters: searchAndFilters.filters, 
      pagination: paginationHook.pagination 
    });
  }, [searchAndFilters.filters, paginationHook.pagination, fetchHeroes]);

  useEffect(() => {
    paginationHook.setTotal(pagination.total);
  }, [pagination.total, paginationHook]);

  const handleSearch = (query: string) => {
    searchAndFilters.setSearchQuery(query);
    searchAndFilters.setFilter('search', query);
  };

  const handleRoleChange = (values: string[]) => {
    searchAndFilters.setFilter('role', values.length > 0 ? values[0] : undefined);
  };

  const handleDifficultyChange = (values: string[]) => {
    searchAndFilters.setFilter('difficulty', values.length > 0 ? parseInt(values[0]) : undefined);
  };

  const roleOptions = [
    { value: 'TANK', label: 'Tank' },
    { value: 'FIGHTER', label: 'Fighter' },
    { value: 'ASSASSIN', label: 'Assassin' },
    { value: 'MAGE', label: 'Mage' },
    { value: 'MARKSMAN', label: 'Marksman' },
    { value: 'SUPPORT', label: 'Support' }
  ];

  const difficultyOptions = [
    { value: '1', label: '★' },
    { value: '2', label: '★★' },
    { value: '3', label: '★★★' },
    { value: '4', label: '★★★★' },
    { value: '5', label: '★★★★★' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Heroes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discover and learn about all Mobile Legends heroes
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-4">
          <SearchInput
            placeholder="Search heroes..."
            onSearch={handleSearch}
            onClear={() => searchAndFilters.setFilter('search', undefined)}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
          
          {searchAndFilters.hasActiveFilters && (
            <button
              onClick={searchAndFilters.clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear all filters
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <FilterDropdown
                options={roleOptions}
                selectedValues={filters.role ? [filters.role] : []}
                onSelectionChange={handleRoleChange}
                placeholder="Select role"
                multiple={false}
                showCounts={true}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <FilterDropdown
                options={difficultyOptions}
                selectedValues={filters.difficulty ? [filters.difficulty.toString()] : []}
                onSelectionChange={handleDifficultyChange}
                placeholder="Select difficulty"
                multiple={false}
                showCounts={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <ErrorMessage
          error={error}
          onRetry={() => {
            clearError();
            fetchHeroes({ 
              filters: searchAndFilters.filters, 
              pagination: paginationHook.pagination 
            });
          }}
        />
      )}

      {/* Heroes Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : heroes.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {heroes.map((hero) => (
            <HeroCard key={hero.id} hero={hero} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No heroes found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={paginationHook.pagination.page}
        totalPages={paginationHook.pagination.totalPages}
        onPageChange={paginationHook.setPage}
        className="mt-8"
      />
    </div>
  );
};

export default HeroesPage;
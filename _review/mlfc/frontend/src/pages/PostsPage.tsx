import { useEffect, useState } from 'react';
import { usePosts } from '../hooks/usePosts';
import { useHeroes } from '../hooks/useHeroes';
import { usePagination } from '../hooks/usePagination';
import { useSearchAndFilters } from '../hooks/useSearchAndFilters';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { SearchInput } from '../components/SearchInput';
import { FilterDropdown } from '../components/FilterDropdown';
import { Pagination } from '../components/Pagination';
import { ErrorMessage } from '../components/ErrorMessage';
import { Search, Filter, Plus } from 'lucide-react';

const PostsPage = () => {
  const { 
    posts, 
    filters, 
    pagination, 
    isLoading, 
    error,
    fetchPosts, 
    setFilters, 
    setPagination,
    clearError
  } = usePosts();
  const { roles } = useHeroes();
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
    fetchPosts({ 
      filters: searchAndFilters.filters, 
      pagination: paginationHook.pagination 
    });
  }, [searchAndFilters.filters, paginationHook.pagination, fetchPosts]);

  useEffect(() => {
    paginationHook.setTotal(pagination.total);
  }, [pagination.total, paginationHook]);

  const handleSearch = (query: string) => {
    searchAndFilters.setSearchQuery(query);
    searchAndFilters.setFilter('search', query);
  };

  const handleCategoryChange = (values: string[]) => {
    searchAndFilters.setFilter('category', values.length > 0 ? values[0] : undefined);
  };

  const handleRoleChange = (values: string[]) => {
    searchAndFilters.setFilter('heroRole', values.length > 0 ? values[0] : undefined);
  };

  const categories = [
    { value: 'GUIDES', label: 'Guides' },
    { value: 'NEWS', label: 'News' },
    { value: 'FANART', label: 'Fan Art' },
    { value: 'GAMEPLAY', label: 'Gameplay' },
    { value: 'DISCUSSION', label: 'Discussion' },
    { value: 'MEMES', label: 'Memes' },
  ];

  const roleOptions = roles.map(role => ({
    value: role.role,
    label: role.role,
    count: role.count
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Posts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discover strategies, guides, and discussions from the community
          </p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-4">
          <SearchInput
            placeholder="Search posts..."
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
                Category
              </label>
              <FilterDropdown
                options={categories}
                selectedValues={filters.category ? [filters.category] : []}
                onSelectionChange={handleCategoryChange}
                placeholder="Select category"
                multiple={false}
                showCounts={false}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hero Role
              </label>
              <FilterDropdown
                options={roleOptions}
                selectedValues={filters.heroRole ? [filters.heroRole] : []}
                onSelectionChange={handleRoleChange}
                placeholder="Select role"
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
            fetchPosts({ 
              filters: searchAndFilters.filters, 
              pagination: paginationHook.pagination 
            });
          }}
        />
      )}

      {/* Posts Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No posts found
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

export default PostsPage;
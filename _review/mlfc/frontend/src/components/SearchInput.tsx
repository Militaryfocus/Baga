import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../utils/cn';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  className?: string;
  debounceMs?: number;
  showClearButton?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search...',
  onSearch,
  onClear,
  className,
  debounceMs = 300,
  showClearButton = true
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim()) {
      setIsSearching(true);
      debounceRef.current = setTimeout(() => {
        onSearch(query.trim());
        setIsSearching(false);
      }, debounceMs);
    } else {
      setIsSearching(false);
      if (onClear) {
        onClear();
      }
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, onSearch, onClear, debounceMs]);

  const handleClear = () => {
    setQuery('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className={cn(
              'h-5 w-5 transition-colors duration-200',
              isSearching ? 'text-blue-500' : 'text-gray-400'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {showClearButton && query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
      {isSearching && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};
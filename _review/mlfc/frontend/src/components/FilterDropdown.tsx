import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/cn';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterDropdownProps {
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  className?: string;
  showCounts?: boolean;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = 'Select options',
  multiple = true,
  className,
  showCounts = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (value: string) => {
    if (multiple) {
      const newSelection = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([value]);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onSelectionChange([]);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    }
    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.value === selectedValues[0]);
      return option?.label || selectedValues[0];
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
          selectedValues.length > 0 ? 'text-gray-900' : 'text-gray-500'
        )}
      >
        <span className="block truncate">{getDisplayText()}</span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className={cn('h-5 w-5 text-gray-400 transition-transform duration-200', isOpen && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {selectedValues.length > 0 && multiple && (
            <div className="px-3 py-2 border-b border-gray-100">
              <button
                onClick={handleClear}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
            </div>
          )}
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <div
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                className={cn(
                  'relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-gray-50',
                  isSelected && 'bg-blue-50'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn('block truncate', isSelected ? 'font-medium' : 'font-normal')}>
                    {option.label}
                  </span>
                  {isSelected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                  {showCounts && option.count !== undefined && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({option.count})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
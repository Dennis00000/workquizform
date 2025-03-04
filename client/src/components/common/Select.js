import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/solid';

/**
 * Select Component
 * A custom select dropdown with support for search and multi-select
 */
const Select = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  isMulti = false,
  isSearchable = false,
  isDisabled = false,
  isRequired = false,
  name,
  id,
  label,
  error,
  className = '',
  optionClassName = '',
  size = 'md',
  noOptionsMessage = 'No options available'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && isSearchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, isSearchable]);
  
  // Toggle dropdown
  const toggleDropdown = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };
  
  // Handle option selection
  const handleSelect = (option) => {
    if (isMulti) {
      // For multi-select, toggle the selected option
      const newValue = Array.isArray(value) ? [...value] : [];
      const optionIndex = newValue.findIndex(item => item.value === option.value);
      
      if (optionIndex >= 0) {
        newValue.splice(optionIndex, 1);
      } else {
        newValue.push(option);
      }
      
      onChange(newValue);
    } else {
      // For single select, set the value and close dropdown
      onChange(option);
      setIsOpen(false);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Check if an option is selected
  const isSelected = (option) => {
    if (isMulti) {
      return Array.isArray(value) && value.some(item => item.value === option.value);
    }
    return value && value.value === option.value;
  };
  
  // Get display value for the select
  const getDisplayValue = () => {
    if (!value) return placeholder;
    
    if (isMulti) {
      if (Array.isArray(value) && value.length > 0) {
        if (value.length === 1) {
          return value[0].label;
        }
        return `${value.length} selected`;
      }
      return placeholder;
    }
    
    return value.label;
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'py-1 px-2 text-sm',
    md: 'py-2 px-3 text-base',
    lg: 'py-3 px-4 text-lg'
  };
  
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div ref={selectRef} className="relative">
        <button
          type="button"
          id={id}
          name={name}
          onClick={toggleDropdown}
          disabled={isDisabled}
          className={`relative w-full bg-white dark:bg-gray-700 border ${
            error 
              ? 'border-red-300 dark:border-red-600' 
              : 'border-gray-300 dark:border-gray-600'
          } rounded-md shadow-sm pl-3 pr-10 ${sizeClasses[size]} text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? id : undefined}
        >
          <span className="block truncate text-gray-900 dark:text-white">
            {getDisplayValue()}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </button>
        
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {isSearchable && (
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-700 px-2 py-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            
            {filteredOptions.length > 0 ? (
              <ul 
                className="py-1" 
                role="listbox" 
                aria-labelledby={id}
                tabIndex={-1}
              >
                {filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    className={`${
                      isSelected(option)
                        ? 'text-white bg-indigo-600 dark:bg-indigo-700'
                        : 'text-gray-900 dark:text-white'
                    } cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 dark:hover:bg-gray-600 ${optionClassName}`}
                    role="option"
                    aria-selected={isSelected(option)}
                    onClick={() => handleSelect(option)}
                  >
                    <span className={`block truncate ${
                      isSelected(option) ? 'font-semibold' : 'font-normal'
                    }`}>
                      {option.label}
                    </span>
                    
                    {isSelected(option) && (
                      <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                        isSelected(option) ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'
                      }`}>
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                {noOptionsMessage}
              </div>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

Select.propTypes = {
  /** Array of options to display */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  /** Selected value(s) */
  value: PropTypes.oneOfType([
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired
    }),
    PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired
      })
    )
  ]),
  /** Function called when selection changes */
  onChange: PropTypes.func.isRequired,
  /** Placeholder text when no option is selected */
  placeholder: PropTypes.string,
  /** Whether multiple options can be selected */
  isMulti: PropTypes.bool,
  /** Whether to show a search input */
  isSearchable: PropTypes.bool,
  /** Whether the select is disabled */
  isDisabled: PropTypes.bool,
  /** Whether the select is required */
  isRequired: PropTypes.bool,
  /** Name attribute for the select */
  name: PropTypes.string,
  /** ID attribute for the select */
  id: PropTypes.string,
  /** Label text */
  label: PropTypes.string,
  /** Error message */
  error: PropTypes.string,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Additional CSS classes for options */
  optionClassName: PropTypes.string,
  /** Size of the select */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Message to display when no options match the search */
  noOptionsMessage: PropTypes.string
};

export default Select; 
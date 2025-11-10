// File: MarketplaceFilters.tsx
// Path: /src/components/marketplace/filters/MarketplaceFilters.tsx

'use client';

import { useState } from 'react';

interface FilterProps {
  onFilterChange: (filters: FilterState) => void;
  type: 'products' | 'services';
}

export interface FilterState {
  category: string;
  priceMin: string;
  priceMax: string;
  sortBy: string;
  rating: string;
  search: string;
}

const PRODUCT_CATEGORIES = [
  'Beats & Instrumentals',
  'Samples & Loops',
  'Presets & Plugins',
  'Mixing & Mastering',
  'Sound Effects',
  'Vocal Packs',
  'MIDI Files',
  'Project Files',
  'Tutorials & Courses',
  'Other'
];

const SERVICE_CATEGORIES = [
  'Music Production',
  'Mixing & Mastering',
  'Vocal Recording',
  'Songwriting',
  'Beat Making',
  'Sound Design',
  'Audio Editing',
  'Consultation',
  'Lessons & Coaching',
  'Other'
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' }
];

export default function MarketplaceFilters({ onFilterChange, type }: FilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    priceMin: '',
    priceMax: '',
    sortBy: 'created_at',
    rating: '',
    search: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  const categories = type === 'products' ? PRODUCT_CATEGORIES : SERVICE_CATEGORIES;

  const handleFilterUpdate = (key: keyof FilterState, value: string) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      category: '',
      priceMin: '',
      priceMax: '',
      sortBy: 'created_at',
      rating: '',
      search: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-[#111111] border border-gray-800 rounded-lg">
      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden w-full p-4 flex items-center justify-between text-white"
      >
        <span className="font-medium">Filters</span>
        <svg
          className={`w-5 h-5 transform transition-transform ${showFilters ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filters Content */}
      <div className={`p-4 space-y-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterUpdate('search', e.target.value)}
            placeholder="Search..."
            className="w-full bg-[#1A1A1A] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00E5BE]"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterUpdate('category', e.target.value)}
            className="w-full bg-[#1A1A1A] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00E5BE]"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterUpdate('sortBy', e.target.value)}
            className="w-full bg-[#1A1A1A] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00E5BE]"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Price Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={filters.priceMin}
              onChange={(e) => handleFilterUpdate('priceMin', e.target.value)}
              placeholder="Min"
              min="0"
              className="w-1/2 bg-[#1A1A1A] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00E5BE]"
            />
            <input
              type="number"
              value={filters.priceMax}
              onChange={(e) => handleFilterUpdate('priceMax', e.target.value)}
              placeholder="Max"
              min="0"
              className="w-1/2 bg-[#1A1A1A] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00E5BE]"
            />
          </div>
        </div>

        {/* Minimum Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Minimum Rating
          </label>
          <select
            value={filters.rating}
            onChange={(e) => handleFilterUpdate('rating', e.target.value)}
            className="w-full bg-[#1A1A1A] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00E5BE]"
          >
            <option value="">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="1">1+ Stars</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="w-full py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
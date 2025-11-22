// File: FilterSidebar.tsx
// Path: /src/components/marketplace/FilterSidebar.tsx
// Reusable filter sidebar for marketplace pages

'use client'

import { useTheme } from '@/lib/contexts/ThemeContext'

interface FilterSidebarProps {
  // Category
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  
  // Price Range
  priceRange: [number, number]
  maxPrice?: number
  onPriceRangeChange: (range: [number, number]) => void
  
  // Free Only
  showFreeOnly: boolean
  onFreeOnlyChange: (value: boolean) => void
  
  // Genres
  genres: string[]
  selectedGenres: string[]
  onGenresChange: (genres: string[]) => void
  
  // File Types
  fileTypes: string[]
  selectedFileTypes: string[]
  onFileTypesChange: (types: string[]) => void
  
  // Optional: Custom filters
  customFilters?: React.ReactNode
}

export default function FilterSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  maxPrice = 500,
  onPriceRangeChange,
  showFreeOnly,
  onFreeOnlyChange,
  genres,
  selectedGenres,
  onGenresChange,
  fileTypes,
  selectedFileTypes,
  onFileTypesChange,
  customFilters,
}: FilterSidebarProps) {
  const { theme } = useTheme()

  const handleGenreToggle = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      onGenresChange(selectedGenres.filter(g => g !== genre))
    } else {
      onGenresChange([...selectedGenres, genre])
    }
  }

  const handleFileTypeToggle = (type: string) => {
    if (selectedFileTypes.includes(type)) {
      onFileTypesChange(selectedFileTypes.filter(t => t !== type))
    } else {
      onFileTypesChange([...selectedFileTypes, type])
    }
  }

  return (
    <aside 
      className="hidden lg:block w-[15%] flex-shrink-0"
      style={{
        position: 'sticky',
        top: '80px',
        alignSelf: 'flex-start',
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
      }}
    >
      <div 
        className="rounded-xl border p-6 backdrop-blur-md"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
          borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
        }}
      >
        <h2 
          className="text-xl font-bold mb-6"
          style={{
            fontFamily: 'var(--font-heading)',
            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
          }}
        >
          Filters
        </h2>

        {/* Category Filter */}
        <div className="mb-6">
          <h3 
            className="text-sm font-semibold mb-3"
            style={{
              fontFamily: 'var(--font-body)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
            }}
          >
            Category
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat.toLowerCase())}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: selectedCategory === cat.toLowerCase() ? '#009ae9' : theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
                  color: selectedCategory === cat.toLowerCase() ? 'white' : theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="mb-6">
          <h3 
            className="text-sm font-semibold mb-3"
            style={{
              fontFamily: 'var(--font-body)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
            }}
          >
            Price Range
          </h3>
          <input
            type="range"
            min="0"
            max={maxPrice}
            value={priceRange[1]}
            onChange={(e) => onPriceRangeChange([0, parseInt(e.target.value)])}
            className="w-full"
          />
          <div 
            className="flex justify-between text-sm mt-2"
            style={{
              color: theme === 'dark' ? '#b3b3b3' : '#666666',
            }}
          >
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>

        {/* Free Only Filter */}
        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showFreeOnly}
              onChange={(e) => onFreeOnlyChange(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span 
              className="text-sm"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
            >
              Free only
            </span>
          </label>
        </div>

        {/* Genre Filter */}
        {genres.length > 0 && (
          <div className="mb-6">
            <h3 
              className="text-sm font-semibold mb-3"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
            >
              Genre
            </h3>
            <div className="space-y-2">
              {genres.map((genre) => (
                <label key={genre} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre)}
                    onChange={() => handleGenreToggle(genre)}
                    className="w-4 h-4 rounded"
                  />
                  <span 
                    className="text-sm"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    }}
                  >
                    {genre}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* File Type Filter */}
        {fileTypes.length > 0 && (
          <div className="mb-6">
            <h3 
              className="text-sm font-semibold mb-3"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
            >
              File Type
            </h3>
            <div className="space-y-2">
              {fileTypes.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFileTypes.includes(type)}
                    onChange={() => handleFileTypeToggle(type)}
                    className="w-4 h-4 rounded"
                  />
                  <span 
                    className="text-sm"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    }}
                  >
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Custom Filters */}
        {customFilters && (
          <div className="mb-6">
            {customFilters}
          </div>
        )}
      </div>
    </aside>
  )
}
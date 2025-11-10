// File: SearchBar.tsx
// Path: /src/components/common/SearchBar.tsx

'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
  className?: string;
}

export default function SearchBar({ 
  placeholder = "Search for products, services, or users...",
  defaultValue = "",
  onSearch,
  autoFocus = false,
  className = ""
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative h-12 w-full max-w-3xl mx-auto ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full h-full pl-12 pr-28 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-600"
      />
      <button
        type="submit"
        style={{ height: '48px', top: '0', right: '0' }}
        className="absolute px-4 sm:px-6 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition font-semibold text-sm"
      >
        Search
      </button>
    </form>
  );
}
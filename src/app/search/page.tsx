// File: page.tsx
// Path: /src/app/search/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { Search, Filter, X, Loader2, Package, Briefcase } from 'lucide-react';

type SearchType = 'all' | 'products' | 'services' | 'users';
type SortBy = 'relevance' | 'newest' | 'price_low' | 'price_high' | 'popular';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState<SearchType>((searchParams.get('type') as SearchType) || 'all');
  const [sortBy, setSortBy] = useState<SortBy>((searchParams.get('sort') as SortBy) || 'relevance');
  const [results, setResults] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

  useEffect(() => {
    if (query) {
      performSearch();
    } else {
      setLoading(false);
    }
  }, [query, searchType, sortBy, categoryFilter, minPrice, maxPrice]);

  async function performSearch() {
    setLoading(true);
    
    try {
      let allResults: any[] = [];

      // Search products
      if (searchType === 'all' || searchType === 'products') {
        let productQuery = supabase
          .from('products')
          .select(`
            *,
            seller:seller_id(username, full_name, avatar_url)
          `)
          .eq('is_active', true)
          .ilike('name', `%${query}%`);

        if (categoryFilter) {
          productQuery = productQuery.eq('category', categoryFilter);
        }
        if (minPrice) {
          productQuery = productQuery.gte('price', parseFloat(minPrice));
        }
        if (maxPrice) {
          productQuery = productQuery.lte('price', parseFloat(maxPrice));
        }

        const { data: products } = await productQuery;
        
        if (products) {
          allResults.push(...products.map(p => ({ ...p, type: 'product' })));
        }
      }

      // Search services
      if (searchType === 'all' || searchType === 'services') {
        let serviceQuery = supabase
          .from('services')
          .select(`
            *,
            seller:seller_id(username, full_name, avatar_url)
          `)
          .eq('is_active', true)
          .ilike('name', `%${query}%`);

        if (categoryFilter) {
          serviceQuery = serviceQuery.eq('category', categoryFilter);
        }
        if (minPrice) {
          serviceQuery = serviceQuery.gte('price_from', parseFloat(minPrice));
        }
        if (maxPrice) {
          serviceQuery = serviceQuery.lte('price_from', parseFloat(maxPrice));
        }

        const { data: services } = await serviceQuery;
        
        if (services) {
          allResults.push(...services.map(s => ({ ...s, type: 'service' })));
        }
      }

      // Search users
      if (searchType === 'all' || searchType === 'users') {
        const { data: users } = await supabase
          .from('user_profiles')
          .select('*')
          .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`);

        if (users) {
          allResults.push(...users.map(u => ({ ...u, type: 'user' })));
        }
      }

      // Apply sorting
      allResults = sortResults(allResults);

      setResults(allResults);
      setTotalResults(allResults.length);
      setLoading(false);
    } catch (error) {
      console.error('Search error:', error);
      setLoading(false);
    }
  }

  function sortResults(items: any[]) {
    switch (sortBy) {
      case 'newest':
        return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'price_low':
        return items.sort((a, b) => {
          const priceA = a.price || a.price_from || 0;
          const priceB = b.price || b.price_from || 0;
          return priceA - priceB;
        });
      case 'price_high':
        return items.sort((a, b) => {
          const priceA = a.price || a.price_from || 0;
          const priceB = b.price_from || b.price_from || 0;
          return priceB - priceA;
        });
      case 'popular':
        return items.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
      default:
        return items;
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateURL();
    performSearch();
  }

  function updateURL() {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (searchType !== 'all') params.set('type', searchType);
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    if (categoryFilter) params.set('category', categoryFilter);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);

    router.push(`/search?${params.toString()}`);
  }

  function clearFilters() {
    setCategoryFilter('');
    setMinPrice('');
    setMaxPrice('');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Search Bar - BUTTON INSIDE INPUT */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative h-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, services, or users..."
              className="w-full h-full pl-12 pr-28 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              style={{ height: '48px', top: '0', right: '0' }}
              className="absolute px-6 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition font-semibold text-sm"
            >
              Search
            </button>
          </form>
        </div>

        {/* Filters & Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Type Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setSearchType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  searchType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSearchType('products')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  searchType === 'products'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setSearchType('services')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  searchType === 'services'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Services
              </button>
              <button
                onClick={() => setSearchType('users')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  searchType === 'users'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Users
              </button>
            </div>

            {/* Sort */}
            {searchType !== 'users' && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="relevance">Most Relevant</option>
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            )}

            {/* Filter Toggle */}
            {searchType !== 'users' && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && searchType !== 'users' && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    placeholder="e.g., Beats"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="$0"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Any"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? 'Searching...' : `${totalResults} results for "${query}"`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No results found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item) => (
              <div key={`${item.type}-${item.id}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                {item.type === 'user' ? (
                  <Link href={`/profile/${item.username}`} className="block p-6">
                    <div className="flex items-center gap-4">
                      {item.avatar_url ? (
                        <img src={item.avatar_url} alt={item.full_name} className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{item.full_name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">@{item.username}</p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <Link href={`/marketplace/${item.type}s/${item.id}`}>
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover" />
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {item.type === 'product' ? (
                          <Package className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Briefcase className="w-4 h-4 text-purple-600" />
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{item.type}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">by @{item.seller?.username}</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        ${item.price || item.price_from || 0}
                        {item.type === 'service' && '+'}
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
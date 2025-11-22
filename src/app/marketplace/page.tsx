// File: page.tsx
// Path: /src/app/marketplace/page.tsx
// Main marketplace page with tabs - matching Products/Services layout

'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { createClient } from '@/lib/supabase/client'
import { Search, Loader2 } from 'lucide-react'
import ProductCard from '@/components/marketplace/products/ProductCard'
import ServiceCard from '@/components/marketplace/services/ServiceCard'

type TabType = 'products' | 'services' | 'webinars'

interface Product {
  id: string
  title: string
  slug: string
  price: number
  compare_at_price: number | null
  thumbnail_url: string | null
  preview_urls: string[] | null
  tags: string[]
  rating_average: number
  reviews_count: number
  is_featured: boolean
  created_at: string
  seller_id: string
  is_in_cart?: boolean
  is_wishlisted?: boolean
}

interface Service {
  id: string
  title: string
  slug: string
  packages: any
  thumbnail_url: string | null
  tags: string[]
  rating_average: number
  reviews_count: number
  is_featured: boolean
  created_at: string
  seller_id: string
  response_time_hours: number | null
}

interface UserProfile {
  username: string
  display_name: string | null
  avatar_url: string | null
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function MarketplacePage() {
  const { theme } = useTheme()
  const supabase = createClient()
  
  // State
  const [activeTab, setActiveTab] = useState<TabType>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [showFreeOnly, setShowFreeOnly] = useState(false)
  const [sortBy, setSortBy] = useState('newest')

  // Get current user
  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [])

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('marketplace_categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('sort_order')
      
      if (data) {
        setCategories(data)
      }
    }
    fetchCategories()
  }, [])

  // Fetch data when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts()
    } else if (activeTab === 'services') {
      fetchServices()
    }
  }, [activeTab, selectedCategory, priceRange, showFreeOnly, sortBy, searchQuery, currentUserId])

  async function fetchProducts() {
    setLoading(true)
    
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('status', 'active')

      if (selectedCategory !== 'all') {
        const category = categories.find(c => c.slug === selectedCategory)
        if (category) {
          query = query.eq('marketplace_category_id', category.id)
        }
      }

      query = query.gte('price', priceRange[0]).lte('price', priceRange[1])

      if (showFreeOnly) {
        query = query.eq('price', 0)
      }

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
      }

      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'price-low':
          query = query.order('price', { ascending: true })
          break
        case 'price-high':
          query = query.order('price', { ascending: false })
          break
        case 'popular':
          query = query.order('views_count', { ascending: false })
          break
        case 'rating':
          query = query.order('rating_average', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data: productsData } = await query

      if (productsData) {
        const sellerIds = [...new Set(productsData.map(p => p.seller_id))]
        
        if (sellerIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('user_profiles')
            .select('user_id, username, display_name, avatar_url')
            .in('user_id', sellerIds)
          
          if (profilesData) {
            const profilesMap: Record<string, UserProfile> = {}
            profilesData.forEach(profile => {
              profilesMap[profile.user_id] = {
                username: profile.username,
                display_name: profile.display_name,
                avatar_url: profile.avatar_url
              }
            })
            setUserProfiles(profilesMap)
          }
        }

        if (currentUserId) {
          const productIds = productsData.map(p => p.id)

          const { data: cartItems } = await supabase
            .from('cart_items')
            .select('product_id')
            .eq('user_id', currentUserId)
            .in('product_id', productIds)

          const cartProductIds = new Set(cartItems?.map(item => item.product_id) || [])

          const { data: wishlistItems } = await supabase
            .from('wishlist_items')
            .select('product_id')
            .eq('user_id', currentUserId)
            .in('product_id', productIds)

          const wishlistProductIds = new Set(wishlistItems?.map(item => item.product_id) || [])

          const productsWithStatus = productsData.map(product => ({
            ...product,
            is_in_cart: cartProductIds.has(product.id),
            is_wishlisted: wishlistProductIds.has(product.id)
          }))

          setProducts(productsWithStatus)
        } else {
          setProducts(productsData.map(product => ({
            ...product,
            is_in_cart: false,
            is_wishlisted: false
          })))
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchServices() {
    setLoading(true)
    
    try {
      let query = supabase
        .from('services')
        .select('*')
        .eq('status', 'active')

      if (selectedCategory !== 'all') {
        const category = categories.find(c => c.slug === selectedCategory)
        if (category) {
          query = query.eq('marketplace_category_id', category.id)
        }
      }

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
      }

      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'popular':
          query = query.order('views_count', { ascending: false })
          break
        case 'rating':
          query = query.order('rating_average', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data: servicesData } = await query

      if (servicesData) {
        const sellerIds = [...new Set(servicesData.map(s => s.seller_id))]
        
        if (sellerIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('user_profiles')
            .select('user_id, username, display_name, avatar_url')
            .in('user_id', sellerIds)
          
          if (profilesData) {
            const profilesMap: Record<string, UserProfile> = {}
            profilesData.forEach(profile => {
              profilesMap[profile.user_id] = {
                username: profile.username,
                display_name: profile.display_name,
                avatar_url: profile.avatar_url
              }
            })
            setUserProfiles(profilesMap)
          }
        }

        const filteredServices = servicesData.filter(service => {
          if (!service.packages || !Array.isArray(service.packages)) return false
          
          const minPrice = Math.min(...service.packages.map((pkg: any) => pkg.price || 0))
          return minPrice >= priceRange[0] && minPrice <= priceRange[1]
        })

        setServices(filteredServices)
      }
    } catch (error) {
      console.error('Error:', error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const itemCount = activeTab === 'products' ? products.length : services.length

  return (
    <div 
      className="min-h-screen flex"
      style={{
        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
      }}
    >
      {/* Sidebar */}
      <aside 
        className="hidden lg:block w-[250px] border-r"
        style={{
          position: 'sticky',
          top: '0',
          height: '100vh',
          overflowY: 'auto',
          borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
          backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
        }}
      >
        <div className="p-6">
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
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: selectedCategory === 'all' ? '#009ae9' : 'transparent',
                  color: selectedCategory === 'all' ? 'white' : theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: selectedCategory === cat.slug ? '#009ae9' : 'transparent',
                    color: selectedCategory === cat.slug ? 'white' : theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 
              className="text-sm font-semibold mb-3"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
            >
              {activeTab === 'products' ? 'Price Range' : 'Starting Price'}
            </h3>
            <input
              type="range"
              min="0"
              max={activeTab === 'products' ? 500 : 1000}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
              className="w-full accent-[#009ae9]"
            />
            <div 
              className="flex justify-between text-sm mt-2"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#b3b3b3' : '#666666',
              }}
            >
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>

          {/* Free Only - Products tab only */}
          {activeTab === 'products' && (
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFreeOnly}
                  onChange={(e) => setShowFreeOnly(e.target.checked)}
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
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{
                fontFamily: 'var(--font-heading)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
            >
              MARKETPLACE
            </h1>
            <p 
              className="text-lg"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#b3b3b3' : '#666666',
              }}
            >
              Browse beats, samples, loops, and professional services
            </p>
          </div>

          {/* Tabs */}
          <div 
            className="flex items-center gap-1 mb-6 border-b"
            style={{
              borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
            }}
          >
            {(['products', 'services', 'webinars'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-6 py-3 font-semibold transition-colors relative"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: activeTab === tab ? '#009ae9' : theme === 'dark' ? '#b3b3b3' : '#666666',
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{
                      backgroundColor: '#009ae9',
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-[3]">
              <div className="relative">
                <Search 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  size={20}
                  style={{
                    color: theme === 'dark' ? '#666666' : '#999999',
                  }}
                />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border transition-colors"
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>
            </div>

            <div className="flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border transition-colors appearance-none cursor-pointer"
                style={{
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                  borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  fontFamily: 'var(--font-body)',
                  backgroundImage: theme === 'dark' 
                    ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f5f5f5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
                    : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%231a1a1a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Count */}
          <p 
            className="text-sm mb-6"
            style={{
              fontFamily: 'var(--font-body)',
              color: theme === 'dark' ? '#b3b3b3' : '#666666',
            }}
          >
            {loading ? 'Loading...' : `Showing ${itemCount} ${activeTab}`}
          </p>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin" size={40} style={{ color: '#009ae9' }} />
            </div>
          )}

          {/* Empty State */}
          {!loading && itemCount === 0 && (
            <div className="text-center py-20">
              <p 
                className="text-xl mb-2"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                {activeTab === 'webinars' ? 'Webinars coming soon!' : `No ${activeTab} found`}
              </p>
              {activeTab !== 'webinars' && (
                <p 
                  className="text-sm"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#b3b3b3' : '#666666',
                  }}
                >
                  Try adjusting your filters or search
                </p>
              )}
            </div>
          )}

          {/* Products Grid */}
          {!loading && activeTab === 'products' && products.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
              {products.map((product) => {
                const seller = userProfiles[product.seller_id]
                
                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    image={product.thumbnail_url || '/images/placeholder-product.jpg'}
                    seller={{
                      name: seller?.display_name || seller?.username || 'Unknown',
                      avatar: seller?.avatar_url || null,
                    }}
                    rating={product.rating_average || 0}
                    reviewCount={product.reviews_count || 0}
                    isFeatured={product.is_featured}
                    hasPreview={!!product.preview_urls && product.preview_urls.length > 0}
                    previewTracks={product.preview_urls ? product.preview_urls.map((url, index) => ({
                      id: `preview-${index}`,
                      title: product.title,
                      duration: 30,
                      url: url,
                    })) : []}
                    isInCart={product.is_in_cart || false}
                    isWishlisted={product.is_wishlisted || false}
                  />
                )
              })}
            </div>
          )}

          {/* Services Grid */}
          {!loading && activeTab === 'services' && services.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
              {services.map((service) => {
                const seller = userProfiles[service.seller_id]
                const minPrice = service.packages && Array.isArray(service.packages) 
                  ? Math.min(...service.packages.map((pkg: any) => pkg.price || 0))
                  : 0
                
                return (
                  <ServiceCard
                    key={service.id}
                    id={service.id}
                    title={service.title}
                    startingPrice={minPrice}
                    image={service.thumbnail_url || '/images/placeholder-service.jpg'}
                    seller={{
                      name: seller?.display_name || seller?.username || 'Unknown',
                      avatar: seller?.avatar_url || null,
                    }}
                    rating={service.rating_average || 0}
                    reviewCount={service.reviews_count || 0}
                    deliveryTime={service.response_time_hours ? `${service.response_time_hours}h response` : 'N/A'}
                    isFeatured={service.is_featured}
                  />
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
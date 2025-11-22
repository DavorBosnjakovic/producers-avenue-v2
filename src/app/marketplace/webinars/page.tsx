// File: page.tsx
// Path: /src/app/marketplace/webinars/page.tsx
// Webinars listing page - matching Products/Services page layout exactly

'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { createClient } from '@/lib/supabase/client'
import { Search, Loader2, Calendar, Users } from 'lucide-react'

interface Webinar {
  id: string
  title: string
  slug: string
  description: string
  cover_image_url: string | null
  scheduled_date: string
  duration_minutes: number
  price: number
  max_attendees: number
  current_attendees: number
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  tags: string[]
  rating_average: number
  reviews_count: number
  is_featured: boolean
  created_at: string
  host_id: string
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

export default function WebinarsPage() {
  const { theme } = useTheme()
  const supabase = createClient()
  
  // State
  const [webinars, setWebinars] = useState<Webinar[]>([])
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [showFreeOnly, setShowFreeOnly] = useState(false)
  const [webinarStatus, setWebinarStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState('newest')

  const statusOptions = ['All', 'Upcoming', 'Live', 'Completed']

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

  // Fetch webinars
  useEffect(() => {
    fetchWebinars()
  }, [selectedCategory, priceRange, showFreeOnly, webinarStatus, sortBy, searchQuery])

  async function fetchWebinars() {
    setLoading(true)
    
    try {
      // Build webinars query
      let query = supabase
        .from('webinars')
        .select('*')
        .neq('status', 'cancelled')

      // Category filter
      if (selectedCategory !== 'all') {
        const category = categories.find(c => c.slug === selectedCategory)
        if (category) {
          query = query.eq('marketplace_category_id', category.id)
        }
      }

      // Price range filter
      query = query.gte('price', priceRange[0]).lte('price', priceRange[1])

      // Free only filter
      if (showFreeOnly) {
        query = query.eq('price', 0)
      }

      // Status filter
      if (webinarStatus !== 'all') {
        if (webinarStatus === 'upcoming') {
          query = query.eq('status', 'scheduled')
        } else if (webinarStatus === 'live') {
          query = query.eq('status', 'live')
        } else if (webinarStatus === 'completed') {
          query = query.eq('status', 'completed')
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
      }

      // Sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'date-soon':
          query = query.order('scheduled_date', { ascending: true })
          break
        case 'date-later':
          query = query.order('scheduled_date', { ascending: false })
          break
        case 'price-low':
          query = query.order('price', { ascending: true })
          break
        case 'price-high':
          query = query.order('price', { ascending: false })
          break
        case 'popular':
          query = query.order('current_attendees', { ascending: false })
          break
        case 'rating':
          query = query.order('rating_average', { ascending: false })
          break
        default:
          query = query.order('scheduled_date', { ascending: true })
      }

      const { data: webinarsData, error: webinarsError } = await query

      if (webinarsError) {
        console.error('Error fetching webinars:', webinarsError)
        setWebinars([])
      } else if (webinarsData) {
        // Fetch user profiles for all hosts
        const hostIds = [...new Set(webinarsData.map(w => w.host_id))]
        
        if (hostIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('user_profiles')
            .select('user_id, username, display_name, avatar_url')
            .in('user_id', hostIds)
          
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

        setWebinars(webinarsData)
      }
    } catch (error) {
      console.error('Error:', error)
      setWebinars([])
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function getStatusBadge(status: string) {
    const colors = {
      scheduled: { bg: '#3b82f6', text: 'white' },
      live: { bg: '#ef4444', text: 'white' },
      completed: { bg: '#6b7280', text: 'white' },
    }
    const statusColors = colors[status as keyof typeof colors] || colors.scheduled
    
    return (
      <span 
        className="px-2 py-1 rounded-full text-xs font-semibold uppercase"
        style={{
          backgroundColor: statusColors.bg,
          color: statusColors.text,
        }}
      >
        {status === 'live' ? '🔴 LIVE' : status}
      </span>
    )
  }

  return (
    <div 
      className="min-h-screen flex"
      style={{
        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
      }}
    >
      {/* Sidebar - Full Height */}
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
              max="500"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
              className="w-full accent-[#009ae9]"
              style={{
                height: '6px',
                borderRadius: '3px',
              }}
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

          {/* Free Only Filter */}
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

          {/* Status Filter */}
          <div className="mb-6">
            <h3 
              className="text-sm font-semibold mb-3"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
            >
              Status
            </h3>
            <div className="space-y-2">
              {statusOptions.map((status) => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="webinarStatus"
                    checked={webinarStatus === status.toLowerCase()}
                    onChange={() => setWebinarStatus(status.toLowerCase())}
                    className="w-4 h-4"
                  />
                  <span 
                    className="text-sm"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    }}
                  >
                    {status}
                  </span>
                </label>
              ))}
            </div>
          </div>
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
              WEBINARS
            </h1>
            <p 
              className="text-lg"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#b3b3b3' : '#666666',
              }}
            >
              Join live sessions and learn from industry professionals
            </p>
          </div>

          {/* Search Bar and Sort - Same Row on Desktop, Stacked on Mobile */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Bar - 3/4 width on desktop, full width on mobile */}
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
                  placeholder="Search webinars..."
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

            {/* Sort Dropdown - 1/4 width on desktop, full width on mobile */}
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
                <option 
                  value="date-soon"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  Date: Soonest
                </option>
                <option 
                  value="date-later"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  Date: Latest
                </option>
                <option 
                  value="newest"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  Newest Added
                </option>
                <option 
                  value="price-low"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  Price: Low to High
                </option>
                <option 
                  value="price-high"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  Price: High to Low
                </option>
                <option 
                  value="popular"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  Most Popular
                </option>
                <option 
                  value="rating"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  Highest Rated
                </option>
              </select>
            </div>
          </div>

          {/* Webinar Count */}
          <p 
            className="text-sm mb-6"
            style={{
              fontFamily: 'var(--font-body)',
              color: theme === 'dark' ? '#b3b3b3' : '#666666',
            }}
          >
            {loading ? 'Loading...' : `Showing ${webinars.length} webinars`}
          </p>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin" size={40} style={{ color: '#009ae9' }} />
            </div>
          )}

          {/* Empty State */}
          {!loading && webinars.length === 0 && (
            <div className="text-center py-20">
              <p 
                className="text-xl mb-2"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                No webinars found
              </p>
              <p 
                className="text-sm"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#b3b3b3' : '#666666',
                }}
              >
                Try adjusting your filters or search
              </p>
            </div>
          )}

          {/* Webinars Grid - Responsive 6 columns on XL */}
          {!loading && webinars.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {webinars.map((webinar) => {
                const host = userProfiles[webinar.host_id]
                const spotsLeft = webinar.max_attendees - webinar.current_attendees
                
                return (
                  <div
                    key={webinar.id}
                    className="rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg cursor-pointer"
                    style={{
                      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                    }}
                    onClick={() => window.location.href = `/marketplace/webinars/${webinar.slug}`}
                  >
                    {/* Cover Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={webinar.cover_image_url || '/images/placeholder-webinar.jpg'}
                        alt={webinar.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(webinar.status)}
                      </div>
                      {/* Featured Badge */}
                      {webinar.is_featured && (
                        <div 
                          className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: '#009ae9',
                            color: 'white',
                          }}
                        >
                          FEATURED
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Title */}
                      <h3 
                        className="font-bold mb-2 line-clamp-2"
                        style={{
                          fontFamily: 'var(--font-body)',
                          color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                        }}
                      >
                        {webinar.title}
                      </h3>

                      {/* Host */}
                      <div className="flex items-center gap-2 mb-3">
                        <img
                          src={host?.avatar_url || '/images/default-avatar.png'}
                          alt={host?.display_name || host?.username || 'Host'}
                          className="w-6 h-6 rounded-full"
                        />
                        <span 
                          className="text-sm"
                          style={{
                            fontFamily: 'var(--font-body)',
                            color: theme === 'dark' ? '#b3b3b3' : '#666666',
                          }}
                        >
                          {host?.display_name || host?.username || 'Unknown Host'}
                        </span>
                      </div>

                      {/* Date & Duration */}
                      <div className="flex items-center gap-4 mb-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} style={{ color: '#009ae9' }} />
                          <span 
                            style={{
                              fontFamily: 'var(--font-body)',
                              color: theme === 'dark' ? '#b3b3b3' : '#666666',
                            }}
                          >
                            {formatDate(webinar.scheduled_date)}
                          </span>
                        </div>
                      </div>

                      {/* Attendees */}
                      <div className="flex items-center gap-2 mb-3 text-sm">
                        <Users size={14} style={{ color: '#009ae9' }} />
                        <span 
                          style={{
                            fontFamily: 'var(--font-body)',
                            color: theme === 'dark' ? '#b3b3b3' : '#666666',
                          }}
                        >
                          {webinar.current_attendees}/{webinar.max_attendees} registered
                        </span>
                        {spotsLeft > 0 && spotsLeft <= 10 && (
                          <span 
                            className="text-xs font-semibold"
                            style={{ color: '#ef4444' }}
                          >
                            ({spotsLeft} spots left!)
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <span 
                          className="text-2xl font-bold"
                          style={{
                            fontFamily: 'var(--font-heading)',
                            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                          }}
                        >
                          {webinar.price === 0 ? 'FREE' : `$${webinar.price.toFixed(2)}`}
                        </span>

                        {/* Rating */}
                        {webinar.reviews_count > 0 && (
                          <div className="flex items-center gap-1">
                            <span style={{ color: '#fbbf24' }}>★</span>
                            <span 
                              className="text-sm font-semibold"
                              style={{
                                fontFamily: 'var(--font-body)',
                                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                              }}
                            >
                              {webinar.rating_average.toFixed(1)}
                            </span>
                            <span 
                              className="text-xs"
                              style={{
                                color: theme === 'dark' ? '#b3b3b3' : '#666666',
                              }}
                            >
                              ({webinar.reviews_count})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
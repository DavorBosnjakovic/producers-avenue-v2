// File: page.tsx
// Path: /src/app/community/page.tsx
// RESPONSIVE VERSION: Optimized for all devices

'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { createClient } from '@/lib/supabase/client'
import { Search, Loader2 } from 'lucide-react'
import MemberCard from '@/components/community/MemberCard'

interface Member {
  id: string
  user_id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  smart_link: string | null
  location_display: string | null
  experience_level: string | null
  followers_count: number
  following_count: number
  products_count: number
  services_count: number
  subscription_tier: string
  categories: string[]
  category_slugs: string[]
  genres: string[]
  genre_slugs: string[]
  created_at: string
  is_following?: boolean
  is_current_user?: boolean
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Genre {
  id: string
  name: string
  slug: string
}

export default function CommunityPage() {
  const { theme } = useTheme()
  const supabase = createClient()
  
  const [members, setMembers] = useState<Member[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [])

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('user_role_categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('sort_order')
      
      if (data) {
        setCategories(data)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    async function fetchGenres() {
      const { data } = await supabase
        .from('genres')
        .select('id, name, slug')
        .eq('is_active', true)
        .is('parent_genre_id', null)
        .order('name')
      
      if (data) {
        setGenres(data)
      }
    }
    fetchGenres()
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [selectedCategory, selectedGenres, sortBy, searchQuery, currentUserId])

  async function fetchMembers() {
    setLoading(true)
    
    try {
      const { data: membersData, error } = await supabase
        .rpc('get_community_members', {
          p_current_user_id: null,
          p_category_slug: selectedCategory !== 'all' ? selectedCategory : null,
          p_genre_slugs: selectedGenres.length > 0 ? selectedGenres : null,
          p_search_query: searchQuery || null,
          p_experience_level: null,
          p_sort_by: sortBy,
          p_limit: 20,
          p_offset: 0
        })

      if (error) {
        console.error('Error fetching members:', error)
        setMembers([])
        return
      }

      if (!membersData) {
        setMembers([])
        return
      }

      if (currentUserId) {
        const memberIds = membersData.map((m: Member) => m.user_id)
        
        const { data: followData } = await supabase
          .from('followers')
          .select('following_id')
          .eq('follower_id', currentUserId)
          .in('following_id', memberIds)

        const followingIds = new Set(followData?.map(f => f.following_id) || [])

        const membersWithStatus = membersData.map((member: Member) => ({
          ...member,
          is_following: followingIds.has(member.user_id),
          is_current_user: member.user_id === currentUserId
        }))

        // Sort to show current user first
        const sortedMembers = membersWithStatus.sort((a, b) => {
          if (a.is_current_user) return -1
          if (b.is_current_user) return 1
          return 0
        })

        setMembers(sortedMembers)
      } else {
        setMembers(membersData.map((member: Member) => ({
          ...member,
          is_following: false,
          is_current_user: false
        })))
      }
    } catch (error) {
      console.error('Error:', error)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex"
      style={{
        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
      }}
    >
      {/* Sidebar - Hidden on mobile/tablet, visible on XL+ screens */}
      <aside 
        className="hidden xl:block w-[280px] border-r flex-shrink-0"
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
            className="text-xl font-bold mb-8"
            style={{
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
            }}
          >
            FILTERS
          </h2>

          {/* Category Filter */}
          <div className="mb-8">
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
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: selectedCategory === 'all' ? '#009ae9' : theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
                  color: selectedCategory === 'all' ? 'white' : theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: selectedCategory === cat.slug ? '#009ae9' : theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
                    color: selectedCategory === cat.slug ? 'white' : theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Genre Filter */}
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
              {genres.slice(0, 8).map((genre) => (
                <label key={genre.id} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre.slug)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGenres([...selectedGenres, genre.slug])
                      } else {
                        setSelectedGenres(selectedGenres.filter(g => g !== genre.slug))
                      }
                    }}
                    className="w-4 h-4 rounded"
                  />
                  <span 
                    className="text-sm"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    }}
                  >
                    {genre.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-12">
          {/* Header Section */}
          <div className="mb-8 lg:mb-12">
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4"
              style={{
                fontFamily: 'var(--font-heading)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
            >
              COMMUNITY
            </h1>
            <p 
              className="text-base sm:text-lg lg:text-xl"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#b3b3b3' : '#666666',
              }}
            >
              Connect with producers, musicians, and creatives from around the world
            </p>
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
                  size={20}
                  style={{
                    color: theme === 'dark' ? '#666666' : '#999999',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="w-full sm:w-[200px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
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
                <option value="popular">Most Popular</option>
                <option value="followers">Most Followers</option>
                <option value="active">Most Active</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <p 
            className="text-sm mb-6"
            style={{
              fontFamily: 'var(--font-body)',
              color: theme === 'dark' ? '#b3b3b3' : '#666666',
            }}
          >
            {loading ? 'Loading...' : `Showing ${members.length} member${members.length !== 1 ? 's' : ''}`}
          </p>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20 sm:py-32">
              <Loader2 className="animate-spin" size={40} style={{ color: '#009ae9' }} />
            </div>
          )}

          {/* Empty State */}
          {!loading && members.length === 0 && (
            <div className="text-center py-20 sm:py-32">
              <p 
                className="text-xl sm:text-2xl mb-2"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                No members found
              </p>
              <p 
                className="text-sm sm:text-base"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#b3b3b3' : '#666666',
                }}
              >
                Try adjusting your filters or search query
              </p>
            </div>
          )}

          {/* Members Grid - Fixed responsive grid that never overlaps */}
          {!loading && members.length > 0 && (
            <div className="grid gap-6 lg:gap-8 justify-items-center" style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))'
            }}>
              {members.map((member) => (
                <MemberCard
                  key={member.id}
                  id={member.id}
                  userId={member.user_id}
                  username={member.username}
                  displayName={member.display_name || member.username}
                  avatar={member.avatar_url}
                  bio={member.bio}
                  location={member.location_display}
                  categories={member.categories}
                  genres={member.genres}
                  followers={member.followers_count}
                  following={member.following_count}
                  products={member.products_count}
                  services={member.services_count}
                  subscriptionTier={member.subscription_tier}
                  experienceLevel={member.experience_level}
                  isFollowing={member.is_following || false}
                  isCurrentUser={member.is_current_user || false}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
// File: page.tsx
// Path: /src/app/(protected)/member/[username]/page.tsx
// Member Profile Page - With database integration and Edit button for owners

'use client'

import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  MapPin, 
  Calendar, 
  Link as LinkIcon, 
  MessageCircle, 
  MoreHorizontal,
  Grid3x3,
  Package,
  Briefcase,
  User,
  Users,
  Settings,
  ShoppingBag
} from 'lucide-react'
import Image from 'next/image'

export default function MemberProfilePage() {
  const { theme } = useTheme()
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  const [activeTab, setActiveTab] = useState<'posts' | 'groups'>('posts')
  const [isFollowing, setIsFollowing] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [showAllSkills, setShowAllSkills] = useState(false)
  const [showAllGenres, setShowAllGenres] = useState(false)
  const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(999) // Start high to render all
  const [visibleSkillsCount, setVisibleSkillsCount] = useState(999)
  const [visibleGenresCount, setVisibleGenresCount] = useState(999)
  const [measurementDone, setMeasurementDone] = useState(false)
  
  const categoriesRef = useRef<HTMLDivElement>(null)
  const skillsRef = useRef<HTMLDivElement>(null)
  const genresRef = useRef<HTMLDivElement>(null)

  // Fetch profile data and check if it's the current user's profile
  useEffect(() => {
    fetchProfileData()
  }, [username])

  // Calculate how many items can fit in one line based on container width
  useEffect(() => {
    if (!profile) return

    const calculateVisibleItems = () => {
      // Categories
      if (categoriesRef.current && profile.categories.length > 0) {
        const containerWidth = categoriesRef.current.offsetWidth
        const gap = 8 // gap-2 = 8px
        const buttonWidth = 130 // Reserve space for "See all (XX)" button
        
        // Get all badge elements
        const allBadges = Array.from(categoriesRef.current.querySelectorAll('span'))
        
        let totalWidth = 0
        let count = 0
        
        for (let i = 0; i < allBadges.length; i++) {
          const badgeWidth = allBadges[i].offsetWidth + gap
          if (totalWidth + badgeWidth + buttonWidth <= containerWidth) {
            totalWidth += badgeWidth
            count++
          } else {
            break
          }
        }
        
        // If all items fit, set count to total length (no button needed)
        if (count >= profile.categories.length) {
          setVisibleCategoriesCount(profile.categories.length)
        } else {
          setVisibleCategoriesCount(Math.max(1, count))
        }
      }

      // Skills
      if (skillsRef.current && profile.skills.length > 0) {
        const containerWidth = skillsRef.current.offsetWidth
        const gap = 8
        const buttonWidth = 110
        
        const allBadges = Array.from(skillsRef.current.querySelectorAll('span'))
        
        let totalWidth = 0
        let count = 0
        
        for (let i = 0; i < allBadges.length; i++) {
          const badgeWidth = allBadges[i].offsetWidth + gap
          if (totalWidth + badgeWidth + buttonWidth <= containerWidth) {
            totalWidth += badgeWidth
            count++
          } else {
            break
          }
        }
        
        if (count >= profile.skills.length) {
          setVisibleSkillsCount(profile.skills.length)
        } else {
          setVisibleSkillsCount(Math.max(1, count))
        }
      }

      // Genres
      if (genresRef.current && profile.genres.length > 0) {
        const containerWidth = genresRef.current.offsetWidth
        const gap = 8
        const buttonWidth = 110
        
        const allBadges = Array.from(genresRef.current.querySelectorAll('span'))
        
        let totalWidth = 0
        let count = 0
        
        for (let i = 0; i < allBadges.length; i++) {
          const badgeWidth = allBadges[i].offsetWidth + gap
          if (totalWidth + badgeWidth + buttonWidth <= containerWidth) {
            totalWidth += badgeWidth
            count++
          } else {
            break
          }
        }
        
        if (count >= profile.genres.length) {
          setVisibleGenresCount(profile.genres.length)
        } else {
          setVisibleGenresCount(Math.max(1, count))
        }
      }
      
      setMeasurementDone(true)
    }

    // Initial calculation after a short delay to ensure DOM is rendered
    const timer = setTimeout(calculateVisibleItems, 150)
    
    // Recalculate on window resize
    const handleResize = () => {
      setMeasurementDone(false)
      setTimeout(calculateVisibleItems, 100)
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [profile, showAllCategories, showAllSkills, showAllGenres])

  const fetchProfileData = async () => {
    const supabase = createClient()
    
    try {
      // Get current logged-in user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      console.log('Current user:', user)
      console.log('Looking for username:', username)

      // Fetch profile by username
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        console.log('Error details:', error.message, error.code)
        setLoading(false)
        return
      }

      console.log('Profile data:', profileData)

      // Check if viewing own profile
      const isOwn = user?.id === profileData?.user_id
      console.log('Is own profile?', isOwn, 'user.id:', user?.id, 'profile.user_id:', profileData?.user_id)
      setIsOwnProfile(isOwn)

      // Fetch selected categories, skills, and genres with proper joins
      const [categoriesData, skillsData, genresData] = await Promise.all([
        supabase
          .from('user_selected_categories')
          .select('user_role_categories(name)')
          .eq('user_id', profileData.user_id),
        supabase
          .from('user_selected_skills')
          .select('user_role_skills(name)')
          .eq('user_id', profileData.user_id),
        supabase
          .from('user_selected_genres')
          .select('genres(name)')
          .eq('user_id', profileData.user_id),
      ])

      console.log('Categories fetched:', categoriesData.data)
      console.log('Skills fetched:', skillsData.data)
      console.log('Genres fetched:', genresData.data)

      // Check if current user follows this profile
      if (user && !isOwn) {
        const { data: followData } = await supabase
          .from('followers')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profileData.user_id)
          .single()
        
        setIsFollowing(!!followData)
      }

      // Format profile data
      const formattedProfile = {
        ...profileData,
        // Combine location fields
        location: [profileData.location_city, profileData.location_country]
          .filter(Boolean)
          .join(', ') || null,
        // Extract arrays from junction tables with proper nested data access
        categories: categoriesData.data?.map(c => c.user_role_categories?.name).filter(Boolean) || [],
        skills: skillsData.data?.map(s => s.user_role_skills?.name).filter(Boolean) || [],
        genres: genresData.data?.map(g => g.genres?.name).filter(Boolean) || [],
        // Use counts from table (they're already there!)
        stats: {
          products: profileData.products_count || 0,
          services: profileData.services_count || 0,
          followers: profileData.followers_count || 0,
          following: profileData.following_count || 0,
        },
        joinedDate: new Date(profileData.created_at).toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        }),
      }

      console.log('Formatted profile with categories:', formattedProfile.categories)
      console.log('Formatted profile with skills:', formattedProfile.skills)
      console.log('Formatted profile with genres:', formattedProfile.genres)

      setProfile(formattedProfile)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/login')
      return
    }

    const supabase = createClient()

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.user_id)
        
        setIsFollowing(false)
        setProfile({
          ...profile,
          stats: {
            ...profile.stats,
            followers: profile.stats.followers - 1
          }
        })
      } else {
        // Follow
        await supabase
          .from('followers')
          .insert({
            follower_id: currentUser.id,
            following_id: profile.user_id
          })
        
        setIsFollowing(true)
        setProfile({
          ...profile,
          stats: {
            ...profile.stats,
            followers: profile.stats.followers + 1
          }
        })
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  const handleMessage = () => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    router.push(`/messages/new?user=${username}`)
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Profile link copied to clipboard!')
    } catch (error) {
      console.error('Error copying link:', error)
    }
  }

  const handleReport = () => {
    // TODO: Implement report modal
    alert('Report functionality coming soon')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009ae9] mx-auto mb-4"></div>
          <p style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}>
            Loading profile...
          </p>
        </div>
      </div>
    )
  }

  // If still no profile after loading, something went wrong
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
        }}
      >
        <div className="text-center">
          <p style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}>
            Error loading profile. Check console for details.
          </p>
        </div>
      </div>
    )
  }

  // Mock data for tabs (to be replaced with actual data fetching)
  const mockProducts = Array.from({ length: 12 }, (_, i) => ({
    id: `product-${i + 1}`,
    title: `Beat Pack ${i + 1}`,
    price: 29.99,
    thumbnail: '',
    type: 'product'
  }))

  const mockServices = Array.from({ length: 6 }, (_, i) => ({
    id: `service-${i + 1}`,
    title: `Mixing Service ${i + 1}`,
    price: 199.99,
    thumbnail: '',
    type: 'service'
  }))

  const mockGroups = Array.from({ length: 8 }, (_, i) => ({
    id: `group-${i + 1}`,
    name: `Hip Hop Producers ${i + 1}`,
    memberCount: Math.floor(Math.random() * 500) + 50,
    category: 'Producer',
    coverImage: '',
    role: i === 0 ? 'Admin' : i === 1 ? 'Moderator' : 'Member'
  }))

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
      }}
    >
      {/* Banner - Full Width */}
      <div 
        className="w-full h-48 md:h-64 relative"
        style={{
          background: profile.banner_url 
            ? `url(${profile.banner_url})`
            : 'linear-gradient(to right, #009ae9, #e6f7ff)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col items-start -mt-20 relative z-10">
          {/* Avatar */}
          <div 
            className="w-40 h-40 rounded-full border-4 overflow-hidden bg-gradient-to-br from-primary to-secondary shadow-xl flex-shrink-0"
            style={{
              borderColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
            }}
          >
            {profile.avatar_url ? (
              <Image 
                src={profile.avatar_url} 
                alt={profile.display_name} 
                width={160} 
                height={160}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={64} style={{ color: '#666666' }} />
              </div>
            )}
          </div>

          {/* Info & Actions */}
          <div className="w-full mt-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              {/* Name */}
              <div className="flex-1">
                <h1 
                  className="text-2xl md:text-3xl font-bold"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  {profile.display_name}
                </h1>
                <p 
                  className="text-base mt-1"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#b3b3b3' : '#666666',
                  }}
                >
                  @{profile.username}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 flex-shrink-0">
                {isOwnProfile ? (
                  // Show Edit Profile button for owner
                  <Link href="/settings/profile">
                    <button
                      className="px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                      style={{
                        backgroundColor: '#009ae9',
                        color: 'white',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      <Settings size={18} />
                      Edit Profile
                    </button>
                  </Link>
                ) : (
                  // Show Follow and Message buttons for others
                  <>
                    <button
                      onClick={handleFollow}
                      className="px-6 py-2 rounded-lg font-semibold transition-all"
                      style={{
                        backgroundColor: isFollowing 
                          ? theme === 'dark' ? '#2a2a2a' : '#e5e5e5'
                          : '#009ae9',
                        color: isFollowing 
                          ? theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
                          : 'white',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>

                    <button
                      onClick={handleMessage}
                      className="px-6 py-2 rounded-lg font-semibold transition-all"
                      style={{
                        backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      <MessageCircle size={18} className="inline mr-2" />
                      Message
                    </button>
                  </>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="p-2 rounded-lg transition-all"
                    style={{
                      backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    }}
                  >
                    <MoreHorizontal size={20} />
                  </button>

                  {showMoreMenu && (
                    <div 
                      className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-10"
                      style={{
                        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                        border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e5e5'}`,
                      }}
                    >
                      <button 
                        onClick={handleShare}
                        className="w-full text-left px-4 py-3 hover:bg-opacity-80 transition-colors"
                        style={{
                          color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        Share Profile
                      </button>
                      {!isOwnProfile && (
                        <button 
                          onClick={handleReport}
                          className="w-full text-left px-4 py-3 hover:bg-opacity-80 transition-colors"
                          style={{
                            color: '#ef4444',
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          Report Profile
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p 
                className="mt-4 text-base leading-relaxed max-w-2xl"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                {profile.bio}
              </p>
            )}

            {/* Meta Info */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {profile.location && (
                <div className="flex items-center gap-2"
                  style={{
                    color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <MapPin size={16} />
                  {profile.location}
                </div>
              )}
              <div className="flex items-center gap-2"
                style={{
                  color: theme === 'dark' ? '#b3b3b3' : '#666666',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <Calendar size={16} />
                Joined {profile.joinedDate}
              </div>
            </div>

            {/* Categories */}
            {profile.categories.length > 0 && (
              <div ref={categoriesRef} className="mt-4 flex flex-wrap gap-2">
                {(showAllCategories ? profile.categories : profile.categories.slice(0, visibleCategoriesCount)).map((cat: string) => (
                  <span
                    key={cat}
                    className="px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {cat}
                  </span>
                ))}
                {profile.categories.length > visibleCategoriesCount && (
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(0, 154, 233, 0.15)' : 'rgba(0, 154, 233, 0.1)',
                      color: '#009ae9',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {showAllCategories ? 'See less' : `See all (${profile.categories.length})`}
                  </button>
                )}
              </div>
            )}

            {/* Skills */}
            {profile.skills.length > 0 && (
              <div ref={skillsRef} className="mt-3 flex flex-wrap gap-2">
                {(showAllSkills ? profile.skills : profile.skills.slice(0, visibleSkillsCount)).map((skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(0, 154, 233, 0.15)' : 'rgba(0, 154, 233, 0.1)',
                      color: '#009ae9',
                      fontFamily: 'var(--font-body)',
                      border: `1px solid ${theme === 'dark' ? 'rgba(0, 154, 233, 0.3)' : 'rgba(0, 154, 233, 0.2)'}`,
                    }}
                  >
                    {skill}
                  </span>
                ))}
                {profile.skills.length > visibleSkillsCount && (
                  <button
                    onClick={() => setShowAllSkills(!showAllSkills)}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(0, 154, 233, 0.15)' : 'rgba(0, 154, 233, 0.1)',
                      color: '#009ae9',
                      fontFamily: 'var(--font-body)',
                      border: `1px solid ${theme === 'dark' ? 'rgba(0, 154, 233, 0.3)' : 'rgba(0, 154, 233, 0.2)'}`,
                    }}
                  >
                    {showAllSkills ? 'See less' : `See all (${profile.skills.length})`}
                  </button>
                )}
              </div>
            )}

            {/* Genres */}
            {profile.genres.length > 0 && (
              <div ref={genresRef} className="mt-3 flex flex-wrap gap-2">
                {(showAllGenres ? profile.genres : profile.genres.slice(0, visibleGenresCount)).map((genre: string) => (
                  <span
                    key={genre}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: 'rgba(0, 154, 233, 0.1)',
                      color: '#009ae9',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {genre}
                  </span>
                ))}
                {profile.genres.length > visibleGenresCount && (
                  <button
                    onClick={() => setShowAllGenres(!showAllGenres)}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: 'rgba(0, 154, 233, 0.1)',
                      color: '#009ae9',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {showAllGenres ? 'See less' : `See all (${profile.genres.length})`}
                  </button>
                )}
              </div>
            )}

            {/* Action Buttons - Smart Link & Store */}
            <div className="mt-4 flex flex-wrap gap-3">
              {profile.smart_link && (
                <a
                  href={profile.smart_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all"
                  style={{
                    backgroundColor: '#009ae9',
                    color: 'white',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <LinkIcon size={18} />
                  View All My Links
                </a>
              )}
              
              <Link href={`/store/${profile.username}`}>
                <button
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all"
                  style={{
                    backgroundColor: '#009ae9',
                    color: 'white',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <ShoppingBag size={18} />
                  Store
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-6 pt-6 border-t"
              style={{
                borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
              }}
            >
              <div>
                <span 
                  className="text-xl font-bold mr-2"
                  style={{
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {profile.stats.products}
                </span>
                <span 
                  className="text-sm"
                  style={{
                    color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Products
                </span>
              </div>
              <div>
                <span 
                  className="text-xl font-bold mr-2"
                  style={{
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {profile.stats.services}
                </span>
                <span 
                  className="text-sm"
                  style={{
                    color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Services
                </span>
              </div>
              <div>
                <span 
                  className="text-xl font-bold mr-2"
                  style={{
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {profile.stats.followers}
                </span>
                <span 
                  className="text-sm"
                  style={{
                    color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Followers
                </span>
              </div>
              <div>
                <span 
                  className="text-xl font-bold mr-2"
                  style={{
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {profile.stats.following}
                </span>
                <span 
                  className="text-sm"
                  style={{
                    color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Following
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b" style={{ borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5' }}>
          <div className="flex gap-8">
            {['posts', 'groups'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className="pb-4 font-semibold text-sm uppercase tracking-wide transition-colors relative"
                style={{
                  color: activeTab === tab 
                    ? '#009ae9' 
                    : theme === 'dark' ? '#666666' : '#999999',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {tab === 'posts' && <Grid3x3 size={18} className="inline mr-2" />}
                {tab === 'groups' && <Users size={18} className="inline mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: '#009ae9' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8 pb-8">
          {activeTab === 'posts' && (
            <div className="text-center py-12">
              <Grid3x3 size={48} className="mx-auto mb-4" style={{ color: theme === 'dark' ? '#666666' : '#999999' }} />
              <p style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}>
                No posts yet
              </p>
            </div>
          )}
          
          {activeTab === 'groups' && (
            <div className="space-y-4">
              {mockGroups.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto mb-4" style={{ color: theme === 'dark' ? '#666666' : '#999999' }} />
                  <p style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}>
                    Not a member of any groups yet
                  </p>
                </div>
              ) : (
                mockGroups.map((group) => (
                  <div 
                    key={group.id}
                    className="p-4 rounded-lg flex items-center gap-4 cursor-pointer transition-all hover:shadow-lg"
                    style={{
                      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                      border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e5e5'}`,
                    }}
                  >
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#009ae9] to-[#5ac8fa]" />
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>
                        {group.name}
                      </h3>
                      <p className="text-sm mt-1" style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}>
                        {group.memberCount} members • {group.role}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
// File: page.tsx
// Path: /src/app/(protected)/store/[username]/page.tsx
// Store Page - Displays user's customized store with owner detection

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Settings as SettingsIcon, Plus, Edit, UserPlus, UserMinus } from 'lucide-react'
import Link from 'next/link'
import AddNewItemModal from '@/components/common/AddNewItemModal'

interface StoreSettings {
  layout_theme: 'classic' | 'modern' | 'minimal' | 'magazine'
  primary_color: string
  secondary_color: string
  text_color: string
  background_color: string
  background_style: 'solid' | 'image'
  background_image_url?: string
  background_blur: number
  background_opacity: number
  background_brightness: number
  banner_style: 'gradient' | 'solid' | 'image'
  banner_image_url?: string
  banner_blur: number
  banner_opacity: number
  banner_brightness: number
  profile_layout: 'centered' | 'left' | 'split'
  card_style: 'shadow' | 'border' | 'flat'
  card_size: 'small' | 'medium' | 'large'
  spacing: 'compact' | 'normal' | 'spacious'
  font_heading: 'inter' | 'playfair' | 'roboto' | 'poppins' | 'montserrat' | 'raleway' | 'bebas' | 'oswald'
  font_body: 'inter' | 'open-sans' | 'lato' | 'nunito' | 'source-sans' | 'work-sans' | 'karla' | 'pt-sans'
}

const DEFAULT_SETTINGS: StoreSettings = {
  layout_theme: 'classic',
  primary_color: '#009ae9',
  secondary_color: '#5ac8fa',
  text_color: '#1a1a1a',
  background_color: '#ffffff',
  background_style: 'solid',
  background_image_url: undefined,
  background_blur: 0,
  background_opacity: 100,
  background_brightness: 100,
  banner_style: 'gradient',
  banner_image_url: undefined,
  banner_blur: 0,
  banner_opacity: 100,
  banner_brightness: 100,
  profile_layout: 'left',
  card_style: 'shadow',
  card_size: 'medium',
  spacing: 'normal',
  font_heading: 'inter',
  font_body: 'inter',
}

export default function StorePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isOwnStore, setIsOwnStore] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)

  useEffect(() => {
    loadStoreData()
  }, [username])

  // Add Google Fonts dynamically
  useEffect(() => {
    const link = document.getElementById('google-fonts') as HTMLLinkElement
    if (!link) {
      const newLink = document.createElement('link')
      newLink.id = 'google-fonts'
      newLink.rel = 'stylesheet'
      newLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&family=Bebas+Neue&family=Oswald:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&family=Lato:wght@400;700&family=Nunito:wght@400;600;700&family=Source+Sans+Pro:wght@400;600;700&family=Work+Sans:wght@400;500;600;700&family=Karla:wght@400;500;600;700&family=PT+Sans:wght@400;700&display=swap'
      document.head.appendChild(newLink)
    }
  }, [])

  const loadStoreData = async () => {
    try {
      const supabase = createClient()
      
      // Get current logged-in user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Fetch profile by username
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !profileData) {
        console.error('Error fetching profile:', error)
        router.push('/404')
        return
      }

      setProfile(profileData)

      // Check if viewing own store
      const isOwn = user?.id === profileData?.user_id
      setIsOwnStore(isOwn)

      // Check if current user follows this store owner
      if (user && !isOwn) {
        const { data: followData } = await supabase
          .from('followers')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profileData.user_id)
          .single()
        
        setIsFollowing(!!followData)
      }

      // Load store settings
      if (profileData?.store_settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...profileData.store_settings })
      }

      // Load products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', profileData.user_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      setProducts(productsData || [])

      // Load services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('seller_id', profileData.user_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      setServices(servicesData || [])
    } catch (error) {
      console.error('Error loading store:', error)
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
      } else {
        // Follow
        await supabase
          .from('followers')
          .insert({
            follower_id: currentUser.id,
            following_id: profile.user_id
          })
        
        setIsFollowing(true)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  const getFontFamily = (fontKey: string) => {
    const fontMap: Record<string, string> = {
      'inter': "'Inter', sans-serif",
      'playfair': "'Playfair Display', serif",
      'roboto': "'Roboto', sans-serif",
      'poppins': "'Poppins', sans-serif",
      'montserrat': "'Montserrat', sans-serif",
      'raleway': "'Raleway', sans-serif",
      'bebas': "'Bebas Neue', cursive",
      'oswald': "'Oswald', sans-serif",
      'open-sans': "'Open Sans', sans-serif",
      'lato': "'Lato', sans-serif",
      'nunito': "'Nunito', sans-serif",
      'source-sans': "'Source Sans Pro', sans-serif",
      'work-sans': "'Work Sans', sans-serif",
      'karla': "'Karla', sans-serif",
      'pt-sans': "'PT Sans', sans-serif",
    }
    return fontMap[fontKey] || "'Inter', sans-serif"
  }

  const getSpacingClass = () => {
    switch (settings.spacing) {
      case 'compact': return 'py-4'
      case 'spacious': return 'py-12'
      default: return 'py-8'
    }
  }

  const getCardSizeClass = () => {
    switch (settings.card_size) {
      case 'small': return 'lg:grid-cols-4'
      case 'large': return 'lg:grid-cols-2'
      default: return 'lg:grid-cols-3'
    }
  }

  const getCardStyleClass = () => {
    switch (settings.card_style) {
      case 'border': return 'border-2'
      case 'flat': return 'border border-gray-200 dark:border-gray-800'
      default: return 'shadow-[0_0_8px_0_rgba(0,154,233,0.5)] border'
    }
  }

  const getBannerStyle = () => {
    const baseStyle: React.CSSProperties = {}

    if (settings.banner_style === 'image' && settings.banner_image_url) {
      baseStyle.backgroundImage = `url(${settings.banner_image_url})`
      baseStyle.backgroundSize = 'cover'
      baseStyle.backgroundPosition = 'center'
    } else if (settings.banner_style === 'gradient') {
      baseStyle.background = `linear-gradient(to right, ${settings.primary_color}, ${settings.secondary_color})`
    } else {
      baseStyle.background = settings.primary_color
    }

    // Apply effects
    const filters = []
    if (settings.banner_blur > 0) {
      filters.push(`blur(${settings.banner_blur}px)`)
    }
    if (settings.banner_brightness !== 100) {
      filters.push(`brightness(${settings.banner_brightness}%)`)
    }
    if (filters.length > 0) {
      baseStyle.filter = filters.join(' ')
    }

    return baseStyle
  }

  const getBackgroundStyle = () => {
    const baseStyle: React.CSSProperties = {}

    if (settings.background_style === 'image' && settings.background_image_url) {
      baseStyle.backgroundImage = `url(${settings.background_image_url})`
      baseStyle.backgroundSize = 'cover'
      baseStyle.backgroundPosition = 'center'
      baseStyle.backgroundAttachment = 'fixed'
    } else {
      baseStyle.backgroundColor = settings.background_color
    }

    // Apply effects
    const filters = []
    if (settings.background_blur > 0) {
      filters.push(`blur(${settings.background_blur}px)`)
    }
    if (settings.background_brightness !== 100) {
      filters.push(`brightness(${settings.background_brightness}%)`)
    }
    if (filters.length > 0) {
      baseStyle.filter = filters.join(' ')
    }

    return baseStyle
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Store not found</h2>
          <p className="text-gray-600 dark:text-gray-400">This store doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const allItems = [...products, ...services]

  return (
    <div className="min-h-screen relative">
      {/* AddNewItemModal */}
      <AddNewItemModal 
        isOpen={isAddItemModalOpen} 
        onClose={() => setIsAddItemModalOpen(false)} 
      />

      {/* Background Layer */}
      <div 
        className="fixed inset-0 z-0"
        style={getBackgroundStyle()}
      />
      
      {/* Opacity overlay for background image */}
      {settings.background_style === 'image' && settings.background_image_url && (
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundColor: settings.background_color,
            opacity: (100 - settings.background_opacity) / 100,
          }}
        />
      )}

      {/* Content Layer */}
      <div className="relative z-10">
        {/* Banner Section */}
        <div className="relative">
          <div 
            className="w-full h-48 md:h-64 relative"
            style={getBannerStyle()}
          >
            {/* Opacity overlay for banner image */}
            {settings.banner_style === 'image' && settings.banner_image_url && (
              <div 
                className="absolute inset-0"
                style={{
                  backgroundColor: settings.primary_color,
                  opacity: (100 - settings.banner_opacity) / 100,
                }}
              />
            )}

            {/* Edit Button - Only show for owner */}
            {isOwnStore && (
              <Link
                href="/store/settings"
                className="absolute top-4 right-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all z-10"
              >
                <SettingsIcon size={20} className="text-gray-700 dark:text-gray-300" />
              </Link>
            )}
          </div>

          {/* Profile Section */}
          <div className="max-w-5xl mx-auto px-4 relative">
            <div className={`flex ${settings.profile_layout === 'centered' ? 'flex-col items-center text-center' : 'flex-col md:flex-row items-start'} gap-6 -mt-20 relative z-10`}>
              {/* Avatar */}
              <div className="w-40 h-40 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-gradient-to-br shadow-xl flex-shrink-0"
                style={{
                  background: `linear-gradient(to bottom right, ${settings.primary_color}, ${settings.secondary_color})`
                }}
              >
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name || profile.username}
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold">
                    {profile?.display_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>

              {/* Info & Actions */}
              <div className={`flex-1 ${settings.profile_layout === 'centered' ? '' : 'mt-0 md:mt-24'}`}>
                <div className={`flex ${settings.profile_layout === 'centered' ? 'flex-col items-center' : 'flex-col md:flex-row md:items-start md:justify-between'} gap-4`}>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold"
                      style={{ 
                        fontFamily: getFontFamily(settings.font_heading),
                        color: settings.text_color
                      }}
                    >
                      {profile?.display_name || profile?.username || 'Store'}
                    </h1>
                    <p className="text-base mt-1"
                      style={{ 
                        fontFamily: getFontFamily(settings.font_body),
                        color: settings.text_color,
                        opacity: 0.7
                      }}
                    >
                      @{profile.username}
                    </p>
                    {profile?.bio && (
                      <p className="mt-2"
                        style={{ 
                          fontFamily: getFontFamily(settings.font_body),
                          color: settings.text_color,
                          opacity: 0.7
                        }}
                      >
                        {profile.bio}
                      </p>
                    )}
                  </div>
                  
                  {/* Action Buttons - Edit for owner, Follow for visitors */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {isOwnStore ? (
                      <>
                        <Link
                          href={`/member/${profile?.username}`}
                          className="px-6 py-2 border rounded-lg font-medium transition-colors"
                          style={{
                            borderColor: settings.text_color,
                            color: settings.text_color,
                            opacity: 0.8
                          }}
                        >
                          View Profile
                        </Link>
                        <Link
                          href="/store/settings"
                          className="px-6 py-2 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                          style={{ backgroundColor: settings.primary_color }}
                        >
                          <Edit size={18} />
                          Edit Store
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href={`/member/${profile?.username}`}
                          className="px-6 py-2 border rounded-lg font-medium transition-colors"
                          style={{
                            borderColor: settings.text_color,
                            color: settings.text_color,
                            opacity: 0.8
                          }}
                        >
                          View Profile
                        </Link>
                        <button
                          onClick={handleFollow}
                          className="px-6 py-2 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                          style={{ 
                            backgroundColor: isFollowing ? settings.text_color : settings.primary_color,
                            opacity: isFollowing ? 0.7 : 1
                          }}
                        >
                          {isFollowing ? (
                            <>
                              <UserMinus size={18} />
                              Following
                            </>
                          ) : (
                            <>
                              <UserPlus size={18} />
                              Follow
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-4 text-sm"
                  style={{ 
                    color: settings.text_color,
                    opacity: 0.7
                  }}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>
                      <strong>{allItems.length}</strong> Items
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>
                      <strong>{profile?.followers_count || 0}</strong> Followers
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products/Services Section */}
        <div className={`max-w-5xl mx-auto px-4 ${getSpacingClass()} relative`}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2"
              style={{ 
                fontFamily: getFontFamily(settings.font_heading),
                color: settings.text_color
              }}
            >
              {isOwnStore ? 'My Products & Services' : 'Products & Services'}
            </h2>
            <p style={{ 
              fontFamily: getFontFamily(settings.font_body),
              color: settings.text_color,
              opacity: 0.7
            }}
            >
              {allItems.length} item{allItems.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {allItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2"
                style={{ 
                  fontFamily: getFontFamily(settings.font_heading),
                  color: settings.text_color
                }}
              >
                {isOwnStore ? 'No items yet' : 'No items available'}
              </h3>
              {isOwnStore && (
                <>
                  <p className="mb-6"
                    style={{ 
                      fontFamily: getFontFamily(settings.font_body),
                      color: settings.text_color,
                      opacity: 0.7
                    }}
                  >
                    Start by adding your first product or service
                  </p>
                  <button
                    onClick={() => setIsAddItemModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: settings.primary_color }}
                  >
                    <Plus size={18} />
                    Add Item
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 ${getCardSizeClass()} gap-6`}>
              {allItems.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer ${getCardStyleClass()}`}
                  style={{
                    backgroundColor: settings.background_style === 'image' ? 'rgba(255, 255, 255, 0.95)' : settings.background_color,
                    borderColor: settings.card_style === 'border' ? settings.primary_color : undefined,
                  }}
                >
                  <div className="aspect-video relative"
                    style={{
                      background: item.thumbnail_url 
                        ? `url(${item.thumbnail_url})` 
                        : `linear-gradient(135deg, ${settings.primary_color}, ${settings.secondary_color})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2"
                      style={{ 
                        fontFamily: getFontFamily(settings.font_heading),
                        color: settings.text_color
                      }}
                    >
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-3 mb-3 text-sm"
                      style={{ 
                        fontFamily: getFontFamily(settings.font_body),
                        color: settings.text_color,
                        opacity: 0.7
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 fill-current" style={{ color: settings.primary_color }} viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                        <span>{item.rating || 5.0}</span>
                      </div>
                      <span>·</span>
                      <span>{item.sales_count || 0} sales</span>
                    </div>
                    <div className="text-xl font-bold"
                      style={{ 
                        color: settings.primary_color,
                        fontFamily: getFontFamily(settings.font_heading)
                      }}
                    >
                      ${item.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
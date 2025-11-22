// File: page.tsx
// Path: /src/app/(protected)/store/settings/page.tsx
// Store Settings - Live customization with collapsible sidebar

'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Settings, Save, X, Palette, Type, Upload, RotateCcw, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react'

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

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes

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

type EditingElement = 'banner' | 'profile' | 'cards' | 'colors' | 'fonts' | null

const FONT_STYLES = {
  heading: {
    inter: { name: 'Inter', style: 'Modern Sans-Serif' },
    playfair: { name: 'Playfair Display', style: 'Elegant Serif' },
    roboto: { name: 'Roboto', style: 'Clean Sans-Serif' },
    poppins: { name: 'Poppins', style: 'Rounded Sans-Serif' },
    montserrat: { name: 'Montserrat', style: 'Geometric Sans-Serif' },
    raleway: { name: 'Raleway', style: 'Thin Elegant' },
    bebas: { name: 'Bebas Neue', style: 'Bold Condensed' },
    oswald: { name: 'Oswald', style: 'Strong Sans-Serif' },
  },
  body: {
    inter: { name: 'Inter', style: 'Modern Sans-Serif' },
    'open-sans': { name: 'Open Sans', style: 'Humanist Sans-Serif' },
    lato: { name: 'Lato', style: 'Rounded Sans-Serif' },
    nunito: { name: 'Nunito', style: 'Soft Rounded' },
    'source-sans': { name: 'Source Sans Pro', style: 'Technical Sans-Serif' },
    'work-sans': { name: 'Work Sans', style: 'Modern Grotesque' },
    karla: { name: 'Karla', style: 'Simple Sans-Serif' },
    'pt-sans': { name: 'PT Sans', style: 'Universal Sans-Serif' },
  },
}

export default function StoreSettingsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bgFileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [editingElement, setEditingElement] = useState<EditingElement>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS)

  // Check if user is on mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768 // md breakpoint
      setIsMobile(isMobileDevice)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  // Get font family CSS
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

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setProfile(profileData)

      // Enable for everyone for now (no premium check)
      setIsPremium(true)

      if (profileData?.store_settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...profileData.store_settings })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      console.log('No file selected')
      return
    }

    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type)
    setUploadError(null)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const error = 'Please upload an image file'
      setUploadError(error)
      console.error(error, 'File type:', file.type)
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const error = 'Image size must be less than 5MB'
      setUploadError(error)
      console.error(error, 'File size:', file.size)
      return
    }

    try {
      setUploading(true)
      console.log('Starting upload...')
      
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        const error = 'You must be logged in to upload images'
        setUploadError(error)
        console.error(error)
        return
      }

      console.log('User authenticated:', user.id)

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/banner-${Date.now()}.${fileExt}`
      console.log('Uploading to:', fileName)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('banners')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        throw error
      }

      console.log('Upload successful:', data)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(fileName)

      console.log('Public URL:', publicUrl)

      // Update settings with new image URL
      setSettings({
        ...settings,
        banner_style: 'image',
        banner_image_url: publicUrl,
      })
      
      console.log('Settings updated successfully')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      setUploadError(error.message || 'Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveBannerImage = () => {
    console.log('Removing banner image')
    setSettings({
      ...settings,
      banner_style: 'gradient',
      banner_image_url: undefined,
    })
  }

  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      console.log('No file selected')
      return
    }

    console.log('Background file selected:', file.name, 'Size:', file.size, 'Type:', file.type)
    setUploadError(null)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const error = 'Please upload an image file'
      setUploadError(error)
      console.error(error, 'File type:', file.type)
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const error = 'Image size must be less than 5MB'
      setUploadError(error)
      console.error(error, 'File size:', file.size)
      return
    }

    try {
      setUploading(true)
      console.log('Starting background upload...')
      
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        const error = 'You must be logged in to upload images'
        setUploadError(error)
        console.error(error)
        return
      }

      console.log('User authenticated:', user.id)

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/background-${Date.now()}.${fileExt}`
      console.log('Uploading to:', fileName)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('backgrounds')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        throw error
      }

      console.log('Upload successful:', data)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('backgrounds')
        .getPublicUrl(fileName)

      console.log('Public URL:', publicUrl)

      // Update settings with new image URL
      setSettings({
        ...settings,
        background_style: 'image',
        background_image_url: publicUrl,
      })
      
      console.log('Background settings updated successfully')
    } catch (error: any) {
      console.error('Error uploading background image:', error)
      setUploadError(error.message || 'Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
      // Reset file input
      if (bgFileInputRef.current) {
        bgFileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveBackgroundImage = () => {
    console.log('Removing background image')
    setSettings({
      ...settings,
      background_style: 'solid',
      background_image_url: undefined,
    })
  }

  const handleRestoreDefaults = async () => {
    try {
      setSaving(true)
      const supabase = createClient()

      // Delete banner image from storage if it exists
      if (settings.banner_image_url) {
        try {
          // Extract file path from URL
          const urlParts = settings.banner_image_url.split('/banners/')
          if (urlParts.length > 1) {
            const filePath = urlParts[1]
            console.log('Deleting banner image:', filePath)
            const { error: deleteError } = await supabase.storage
              .from('banners')
              .remove([filePath])
            
            if (deleteError) {
              console.error('Error deleting banner:', deleteError)
            } else {
              console.log('Banner image deleted successfully')
            }
          }
        } catch (err) {
          console.error('Error parsing banner URL:', err)
        }
      }

      // Delete background image from storage if it exists
      if (settings.background_image_url) {
        try {
          // Extract file path from URL
          const urlParts = settings.background_image_url.split('/backgrounds/')
          if (urlParts.length > 1) {
            const filePath = urlParts[1]
            console.log('Deleting background image:', filePath)
            const { error: deleteError } = await supabase.storage
              .from('backgrounds')
              .remove([filePath])
            
            if (deleteError) {
              console.error('Error deleting background:', deleteError)
            } else {
              console.log('Background image deleted successfully')
            }
          }
        } catch (err) {
          console.error('Error parsing background URL:', err)
        }
      }

      // Update database with default settings (this removes all custom data)
      const { error } = await supabase
        .from('user_profiles')
        .update({
          store_settings: DEFAULT_SETTINGS,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', profile.user_id)

      if (error) throw error

      setSettings(DEFAULT_SETTINGS)
      setShowRestoreConfirm(false)
      alert('Settings restored to defaults and all custom images deleted!')
    } catch (error) {
      console.error('Error restoring defaults:', error)
      alert('Failed to restore defaults')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const supabase = createClient()

      const { error } = await supabase
        .from('user_profiles')
        .update({
          store_settings: settings,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', profile.user_id)

      if (error) throw error

      router.push('/store')
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
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

  // Show mobile blocking message
  if (isMobile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#1a1a1a] p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Desktop or Tablet Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Store customization is only available on desktop and tablet devices for the best editing experience.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/store')}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              View My Store
            </button>
            <button
              onClick={() => router.back()}
              className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Mock products for preview
  const mockProducts = [
    { id: 1, title: 'Beat Pack Vol. 1', price: 29.99, rating: 4.8, sales: 45 },
    { id: 2, title: 'Sample Library', price: 19.99, rating: 4.9, sales: 89 },
    { id: 3, title: 'Mixing Service', price: 149.99, rating: 5.0, sales: 23 },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a]">
      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={24} className="text-yellow-500" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Restore Default Settings?</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will reset all your customizations including colors, fonts, layouts, and banner settings to their default values. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRestoreConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreDefaults}
                disabled={saving}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {saving ? 'Restoring...' : 'Restore Defaults'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'mr-0' : 'mr-0 lg:mr-96'}`}>
        {/* Store Preview with Inline Editing */}
        <div className="min-h-screen pt-16 relative">
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
            {/* Banner Section - Editable */}
            <div className="relative group">
              <div 
                className="w-full h-48 md:h-64 relative"
                style={getBannerStyle()}
              >
                {/* Opacity overlay */}
                {settings.banner_style === 'image' && settings.banner_image_url && (
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundColor: settings.primary_color,
                      opacity: (100 - settings.banner_opacity) / 100,
                    }}
                  />
                )}

                {/* Edit Button */}
                <button
                  onClick={() => setEditingElement(editingElement === 'banner' ? null : 'banner')}
                  className="absolute top-4 right-4 p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100 z-10"
                >
                  <Settings size={20} className="text-gray-700" />
                </button>

                {/* Edit Menu */}
                {editingElement === 'banner' && (
                  <div className="absolute top-20 right-4 bg-white rounded-lg shadow-xl p-4 w-80 z-20 max-h-[500px] overflow-y-auto">
                    <h3 className="font-semibold text-gray-900 mb-3">Banner Settings</h3>
                    
                    {/* Banner Style */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Banner Style</label>
                      <div className="space-y-2">
                        {['gradient', 'solid', 'image'].map((style) => (
                          <button
                            key={style}
                            onClick={() => setSettings({ ...settings, banner_style: style as any })}
                            className={`w-full px-3 py-2 rounded text-sm text-left transition-colors ${
                              settings.banner_style === style
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Upload */}
                    {settings.banner_style === 'image' && (
                      <div className="mb-4 border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Banner Image
                          <span className="text-xs text-gray-500 ml-2">(Max 5MB)</span>
                        </label>
                        
                        {uploadError && (
                          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs flex items-center gap-2">
                            <AlertCircle size={14} />
                            {uploadError}
                          </div>
                        )}

                        {settings.banner_image_url ? (
                          <div className="space-y-2">
                            <div className="relative w-full h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                              <Image
                                src={settings.banner_image_url}
                                alt="Banner preview"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <button
                              onClick={handleRemoveBannerImage}
                              className="w-full px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="banner-upload"
                            />
                            <button
                              onClick={() => {
                                console.log('Upload button clicked')
                                fileInputRef.current?.click()
                              }}
                              disabled={uploading}
                              className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <Upload size={16} />
                              {uploading ? 'Uploading...' : 'Choose Image'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Image Effects */}
                    {settings.banner_style === 'image' && settings.banner_image_url && (
                      <div className="border-t pt-4 space-y-4">
                        <h4 className="font-medium text-gray-900 text-sm">Image Effects</h4>
                        
                        {/* Blur */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Blur: {settings.banner_blur}px
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={settings.banner_blur}
                            onChange={(e) => setSettings({ ...settings, banner_blur: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        {/* Opacity */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Image Opacity: {settings.banner_opacity}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings.banner_opacity}
                            onChange={(e) => setSettings({ ...settings, banner_opacity: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Lower opacity adds a color overlay
                          </p>
                        </div>

                        {/* Brightness */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Brightness: {settings.banner_brightness}%
                          </label>
                          <input
                            type="range"
                            min="50"
                            max="150"
                            value={settings.banner_brightness}
                            onChange={(e) => setSettings({ ...settings, banner_brightness: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Section - Editable */}
              <div className="max-w-5xl mx-auto px-4 relative group">
                <div className={`flex ${settings.profile_layout === 'centered' ? 'flex-col items-center text-center' : 'flex-col md:flex-row items-start'} gap-6 -mt-20 relative z-10`}>
                  {/* Avatar */}
                  <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden bg-gradient-to-br shadow-xl flex-shrink-0"
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
                          {profile?.display_name || profile?.username || 'Your Name'}
                        </h1>
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
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button className="px-6 py-2 border rounded-lg font-medium"
                          style={{
                            borderColor: settings.text_color,
                            color: settings.text_color,
                            opacity: 0.8
                          }}
                        >
                          View Profile
                        </button>
                        <button className="px-6 py-2 text-white rounded-lg font-medium"
                          style={{ backgroundColor: settings.primary_color }}
                        >
                          Contact
                        </button>
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
                          <strong>12</strong> Items
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

                  {/* Edit Button for Profile */}
                  <button
                    onClick={() => setEditingElement(editingElement === 'profile' ? null : 'profile')}
                    className="absolute -bottom-4 right-4 p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Settings size={20} className="text-gray-700" />
                  </button>

                  {/* Edit Menu for Profile */}
                  {editingElement === 'profile' && (
                    <div className="absolute top-0 right-4 bg-white rounded-lg shadow-xl p-4 w-64 z-10">
                      <h3 className="font-semibold text-gray-900 mb-3">Profile Layout</h3>
                      <div className="space-y-2">
                        {['left', 'centered', 'split'].map((layout) => (
                          <button
                            key={layout}
                            onClick={() => setSettings({ ...settings, profile_layout: layout as any })}
                            className={`w-full px-3 py-2 rounded text-sm text-left transition-colors ${
                              settings.profile_layout === layout
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {layout.charAt(0).toUpperCase() + layout.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Products Section - Editable */}
            <div className={`max-w-5xl mx-auto px-4 ${getSpacingClass()} relative group`}>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2"
                  style={{ 
                    fontFamily: getFontFamily(settings.font_heading),
                    color: settings.text_color
                  }}
                >
                  Products
                </h2>
                <p style={{ 
                  fontFamily: getFontFamily(settings.font_body),
                  color: settings.text_color,
                  opacity: 0.7
                }}
                >
                  Browse available products
                </p>
              </div>

              {/* Edit Button for Cards */}
              <button
                onClick={() => setEditingElement(editingElement === 'cards' ? null : 'cards')}
                className="absolute top-8 right-8 p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <Settings size={20} className="text-gray-700" />
              </button>

              {/* Edit Menu for Cards */}
              {editingElement === 'cards' && (
                <div className="absolute top-20 right-8 bg-white rounded-lg shadow-xl p-4 w-64 z-20">
                  <h3 className="font-semibold text-gray-900 mb-3">Card Style</h3>
                  <div className="space-y-2 mb-4">
                    {['shadow', 'border', 'flat'].map((style) => (
                      <button
                        key={style}
                        onClick={() => setSettings({ ...settings, card_style: style as any })}
                        className={`w-full px-3 py-2 rounded text-sm text-left transition-colors ${
                          settings.card_style === style
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </button>
                    ))}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-3 mt-4">Card Size</h3>
                  <div className="space-y-2 mb-4">
                    {['small', 'medium', 'large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSettings({ ...settings, card_size: size as any })}
                        className={`w-full px-3 py-2 rounded text-sm text-left transition-colors ${
                          settings.card_size === size
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)} ({size === 'small' ? '4 per row' : size === 'large' ? '2 per row' : '3 per row'})
                      </button>
                    ))}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-3 mt-4">Spacing</h3>
                  <div className="space-y-2">
                    {['compact', 'normal', 'spacious'].map((space) => (
                      <button
                        key={space}
                        onClick={() => setSettings({ ...settings, spacing: space as any })}
                        className={`w-full px-3 py-2 rounded text-sm text-left transition-colors ${
                          settings.spacing === space
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {space.charAt(0).toUpperCase() + space.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={`grid grid-cols-1 md:grid-cols-2 ${getCardSizeClass()} gap-6`}>
                {mockProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 ${getCardStyleClass()}`}
                    style={{
                      backgroundColor: settings.background_style === 'image' ? 'rgba(255, 255, 255, 0.95)' : settings.background_color,
                      borderColor: settings.card_style === 'border' ? settings.primary_color : undefined,
                    }}
                  >
                    <div className="aspect-video relative"
                      style={{
                        background: `linear-gradient(135deg, ${settings.primary_color}, ${settings.secondary_color})`,
                      }}
                    />
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2"
                        style={{ 
                          fontFamily: getFontFamily(settings.font_heading),
                          color: settings.text_color
                        }}
                      >
                        {product.title}
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
                          <span>{product.rating}</span>
                        </div>
                        <span>·</span>
                        <span>{product.sales} sales</span>
                      </div>
                      <div className="text-xl font-bold"
                        style={{ 
                          color: settings.primary_color,
                          fontFamily: getFontFamily(settings.font_heading)
                        }}
                      >
                        ${product.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div> {/* Close content layer */}
        </div>
      </div>

      {/* Collapsible Settings Sidebar - Starts below header */}
      <div 
        className={`fixed top-16 right-0 bottom-0 bg-white dark:bg-[#1a1a1a] border-l border-gray-200 dark:border-gray-800 shadow-2xl transition-all duration-300 z-40 overflow-y-auto ${
          sidebarCollapsed ? 'w-0' : 'w-96'
        }`}
      >
        <div className={`p-6 ${sidebarCollapsed ? 'hidden' : 'block'}`}>
          <div className="space-y-6">
            {/* Colors Section */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg flex items-center gap-2 mb-4">
                <Palette size={20} className="text-primary" />
                Global Colors
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Primary Color</label>
                  <input
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Secondary Color</label>
                  <input
                    type="color"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Text Color</label>
                  <input
                    type="color"
                    value={settings.text_color}
                    onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                    className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Background Color</label>
                  <input
                    type="color"
                    value={settings.background_color}
                    onChange={(e) => setSettings({ ...settings, background_color: e.target.value })}
                    className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Background Settings */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                <Settings size={20} className="text-primary" />
                Background
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Background Style</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSettings({ ...settings, background_style: 'solid' })}
                      className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                        settings.background_style === 'solid'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      Solid
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, background_style: 'image' })}
                      className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                        settings.background_style === 'image'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      Image
                    </button>
                  </div>
                </div>

                {settings.background_style === 'image' && (
                  <div className="space-y-4">
                    {settings.background_image_url ? (
                      <div className="space-y-2">
                        <div className="relative w-full h-20 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                          <Image
                            src={settings.background_image_url}
                            alt="Background preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          onClick={handleRemoveBackgroundImage}
                          className="w-full px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          Remove Background
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          ref={bgFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleBackgroundImageUpload}
                          className="hidden"
                          id="bg-upload"
                        />
                        <button
                          onClick={() => {
                            console.log('Background upload button clicked')
                            bgFileInputRef.current?.click()
                          }}
                          disabled={uploading}
                          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Upload size={16} />
                          {uploading ? 'Uploading...' : 'Upload Background'}
                        </button>
                      </div>
                    )}

                    {settings.background_image_url && (
                      <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Background Effects</h4>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Blur: {settings.background_blur}px
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={settings.background_blur}
                            onChange={(e) => setSettings({ ...settings, background_blur: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Image Opacity: {settings.background_opacity}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings.background_opacity}
                            onChange={(e) => setSettings({ ...settings, background_opacity: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Brightness: {settings.background_brightness}%
                          </label>
                          <input
                            type="range"
                            min="50"
                            max="150"
                            value={settings.background_brightness}
                            onChange={(e) => setSettings({ ...settings, background_brightness: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Fonts Section */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg flex items-center gap-2 mb-4">
                <Type size={20} className="text-primary" />
                Fonts
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Heading Font</label>
                  <select
                    value={settings.font_heading}
                    onChange={(e) => setSettings({ ...settings, font_heading: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  >
                    {Object.entries(FONT_STYLES.heading).map(([key, font]) => (
                      <option key={key} value={key}>
                        {font.name} - {font.style}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Body Font</label>
                  <select
                    value={settings.font_body}
                    onChange={(e) => setSettings({ ...settings, font_body: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  >
                    {Object.entries(FONT_STYLES.body).map(([key, font]) => (
                      <option key={key} value={key}>
                        {font.name} - {font.style}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Toggle Button - Aligned with sidebar */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={`fixed top-1/2 -translate-y-1/2 bg-primary text-white p-3 rounded-l-lg shadow-lg hover:bg-primary/90 transition-all z-50 ${
          sidebarCollapsed ? 'right-0' : 'right-96'
        }`}
      >
        {sidebarCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      {/* Floating Action Buttons - Bottom Right */}
      <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 transition-all duration-300 ${
        sidebarCollapsed ? '' : 'lg:right-[408px]'
      }`}>
        <button
          onClick={() => setShowRestoreConfirm(true)}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium shadow-lg"
        >
          <RotateCcw size={18} className="inline mr-2" />
          Restore Defaults
        </button>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium shadow-lg"
        >
          <X size={18} className="inline mr-2" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          <Save size={18} className="inline mr-2" />
          {saving ? 'Saving...' : 'Save & Publish'}
        </button>
      </div>
    </div>
  )
}
// File: page.tsx
// Path: /src/app/(protected)/settings/profile/page.tsx
// Edit Profile Page - Matches registration exactly

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { Camera, Save, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface RoleCategory {
  id: string
  name: string
  slug: string
  description: string
}

interface Skill {
  id: string
  role_category_id: string
  name: string
  slug: string
}

interface Genre {
  id: string
  name: string
  slug: string
  parent_genre_id: string | null
}

export default function EditProfilePage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    location_city: '',
    location_country: '',
    smart_link: '',
  })
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string>('')
  
  // Data from database (ALL available options)
  const [roleCategories, setRoleCategories] = useState<RoleCategory[]>([])
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  
  // User selections (IDs that user has selected - will be highlighted in blue)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  // Custom inputs
  const [showCustomSkillInput, setShowCustomSkillInput] = useState(false)
  const [customSkill, setCustomSkill] = useState('')
  const [currentRoleForCustomSkill, setCurrentRoleForCustomSkill] = useState<string>('')
  const [showCustomGenreInput, setShowCustomGenreInput] = useState(false)
  const [customGenre, setCustomGenre] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }
    
    setUser(user)

    // Load profile data
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        location_city: profile.location_city || '',
        location_country: profile.location_country || '',
        smart_link: profile.smart_link || '',
      })
      
      if (profile.avatar_url) setAvatarPreview(profile.avatar_url)
      if (profile.banner_url) setBannerPreview(profile.banner_url)
    }

    // Load ALL available role categories
    const { data: categoriesData } = await supabase
      .from('user_role_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (categoriesData) setRoleCategories(categoriesData)

    // Load ALL available skills (not just for selected roles!)
    const { data: allSkillsData } = await supabase
      .from('user_role_skills')
      .select('*')
      .eq('is_active', true)
      .eq('is_admin_approved', true)
      .order('name')

    if (allSkillsData) setAllSkills(allSkillsData)

    // Load ALL available genres
    const { data: genresData } = await supabase
      .from('genres')
      .select('*')
      .eq('is_active', true)
      .is('parent_genre_id', null)
      .order('name')

    if (genresData) setGenres(genresData)

    // Load user's SELECTED categories/roles (get the IDs to highlight them)
    const { data: userRoles } = await supabase
      .from('user_selected_categories')
      .select('role_category_id')
      .eq('user_id', user.id)

    const userRoleIdsList = userRoles?.map(r => r.role_category_id).filter(Boolean) || []
    setSelectedRoles(userRoleIdsList)

    // Load user's SELECTED skills (get the IDs to highlight them)
    const { data: userSkills } = await supabase
      .from('user_selected_skills')
      .select('skill_id')
      .eq('user_id', user.id)

    const userSkillIdsList = userSkills?.map(s => s.skill_id).filter(Boolean) || []
    setSelectedSkills(userSkillIdsList)

    // Load user's SELECTED genres (get the IDs to highlight them)
    const { data: userGenres } = await supabase
      .from('user_selected_genres')
      .select('genre_id')
      .eq('user_id', user.id)

    const userGenreIdsList = userGenres?.map(g => g.genre_id).filter(Boolean) || []
    setSelectedGenres(userGenreIdsList)

    setLoading(false)
  }

  const getSkillsForRole = (roleCategoryId: string) => {
    return allSkills.filter(skill => skill.role_category_id === roleCategoryId)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBannerFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File, path: string) => {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleRoleToggle = (roleCategoryId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleCategoryId) 
        ? prev.filter(r => r !== roleCategoryId)
        : [...prev, roleCategoryId]
    )
    
    // Clear skills for deselected roles
    if (selectedRoles.includes(roleCategoryId)) {
      setSelectedSkills(prev => 
        prev.filter(skillId => {
          const skill = allSkills.find(s => s.id === skillId)
          return skill?.role_category_id !== roleCategoryId
        })
      )
    }
  }

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillId)
        ? prev.filter(s => s !== skillId)
        : [...prev, skillId]
    )
  }

  const handleGenreToggle = (genreId: string) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(g => g !== genreId)
        : [...prev, genreId]
    )
  }

  const handleCustomSkillSubmit = async () => {
    if (!customSkill.trim() || !currentRoleForCustomSkill) return

    const supabase = createClient()

    try {
      // Create custom field request
      const { error } = await supabase
        .from('custom_field_requests')
        .insert({
          field_type: 'skill',
          field_value: customSkill.trim(),
          category_id: currentRoleForCustomSkill,
          requested_by: [user.id],
          request_count: 1,
          status: 'pending'
        })

      if (error) throw error

      alert('Skill submitted for review! You\'ll be notified when it\'s approved.')
      setCustomSkill('')
      setShowCustomSkillInput(false)
      setCurrentRoleForCustomSkill('')
    } catch (error) {
      console.error('Error submitting skill:', error)
      alert('Error submitting skill. Please try again.')
    }
  }

  const handleCustomGenreSubmit = async () => {
    if (!customGenre.trim()) return

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('custom_field_requests')
        .insert({
          field_type: 'genre',
          field_value: customGenre.trim(),
          requested_by: [user.id],
          request_count: 1,
          status: 'pending'
        })

      if (error) throw error

      alert('Genre submitted for review! You\'ll be notified when it\'s approved.')
      setCustomGenre('')
      setShowCustomGenreInput(false)
    } catch (error) {
      console.error('Error submitting genre:', error)
      alert('Error submitting genre. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const supabase = createClient()
      let avatarUrl = avatarPreview
      let bannerUrl = bannerPreview

      // Upload new images if selected
      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile, 'avatars')
      }
      if (bannerFile) {
        bannerUrl = await uploadImage(bannerFile, 'banners')
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          display_name: formData.display_name || null,
          bio: formData.bio || null,
          location_city: formData.location_city || null,
          location_country: formData.location_country || null,
          smart_link: formData.smart_link || null,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (profileError) throw profileError

      // Update categories (storing role_category_id foreign keys as UUIDs)
      await supabase.from('user_selected_categories').delete().eq('user_id', user.id)
      if (selectedRoles.length > 0) {
        const { error: categoriesError } = await supabase
          .from('user_selected_categories')
          .insert(
            selectedRoles.map(roleCategoryId => ({ 
              user_id: user.id, 
              role_category_id: roleCategoryId 
            }))
          )
        
        if (categoriesError) {
          console.error('Categories error:', categoriesError)
          throw categoriesError
        }
      }

      // Update skills (storing skill_id foreign keys as UUIDs)
      await supabase.from('user_selected_skills').delete().eq('user_id', user.id)
      if (selectedSkills.length > 0) {
        const { error: skillsError } = await supabase
          .from('user_selected_skills')
          .insert(
            selectedSkills.map(skillId => ({ 
              user_id: user.id, 
              skill_id: skillId 
            }))
          )
        
        if (skillsError) {
          console.error('Skills error:', skillsError)
          throw skillsError
        }
      }

      // Update genres (storing genre_id foreign keys as UUIDs)
      await supabase.from('user_selected_genres').delete().eq('user_id', user.id)
      if (selectedGenres.length > 0) {
        const { error: genresError } = await supabase
          .from('user_selected_genres')
          .insert(
            selectedGenres.map(genreId => ({ 
              user_id: user.id, 
              genre_id: genreId 
            }))
          )
        
        if (genresError) {
          console.error('Genres error:', genresError)
          throw genresError
        }
      }

      alert('Profile updated successfully!')
      router.push(`/member/${user.user_metadata?.username || 'profile'}`)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
        }}
      >
        <Loader2 className="animate-spin text-[#009ae9]" size={48} />
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen py-8"
      style={{
        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
      }}
    >
      <div className="max-w-4xl mx-auto px-4">
        <div 
          className="rounded-xl shadow-sm border"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
            borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
          }}
        >
          {/* Header */}
          <div 
            className="p-6 border-b"
            style={{
              borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
            }}
          >
            <h1 
              className="text-2xl font-bold"
              style={{
                fontFamily: 'var(--font-heading)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
            >
              Edit Profile
            </h1>
            <p 
              className="mt-1"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#b3b3b3' : '#666666',
              }}
            >
              Update your profile information and preferences
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Banner Image */}
            <div 
              className="p-6 border-b"
              style={{
                borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
              }}
            >
              <label 
                className="block text-sm font-semibold mb-3"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                Banner Image
              </label>
              <div className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-r from-[#009ae9] to-[#e6f7ff] group cursor-pointer">
                {bannerPreview && (
                  <Image 
                    src={bannerPreview} 
                    alt="Banner" 
                    fill
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                      className="hidden"
                    />
                    <div 
                      className="rounded-lg px-4 py-2 flex items-center gap-2"
                      style={{
                        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      }}
                    >
                      <Camera size={20} />
                      <span className="font-medium">Change Banner</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Avatar & Basic Info */}
            <div 
              className="p-6 border-b"
              style={{
                borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
              }}
            >
              {/* Avatar */}
              <div className="mb-6">
                <label 
                  className="block text-sm font-semibold mb-3"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  Profile Picture
                </label>
                <div className="flex items-center gap-6">
                  <div 
                    className="relative w-32 h-32 rounded-full overflow-hidden group cursor-pointer"
                    style={{
                      backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
                    }}
                  >
                    {avatarPreview ? (
                      <Image 
                        src={avatarPreview} 
                        alt="Avatar" 
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-4xl"
                        style={{
                          color: theme === 'dark' ? '#666666' : '#999999',
                        }}
                      >
                        ?
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <Camera size={24} className="text-white" />
                      </label>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p 
                      className="text-sm"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#b3b3b3' : '#666666',
                      }}
                    >
                      Recommended: Square image, at least 400x400px
                    </p>
                    <p 
                      className="text-xs mt-1"
                      style={{
                        color: theme === 'dark' ? '#666666' : '#999999',
                      }}
                    >
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div className="mb-6">
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)',
                  }}
                  placeholder="Your display name"
                />
              </div>

              {/* Bio */}
              <div className="mb-6">
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 rounded-lg border transition-colors resize-none"
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)',
                  }}
                  placeholder="Tell us about yourself..."
                />
                <p 
                  className="text-xs mt-1"
                  style={{
                    color: theme === 'dark' ? '#666666' : '#999999',
                  }}
                >
                  {formData.bio.length}/500 characters
                </p>
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label 
                    className="block text-sm font-semibold mb-2"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    }}
                  >
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.location_city}
                    onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border transition-colors"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                      borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      fontFamily: 'var(--font-body)',
                    }}
                    placeholder="Los Angeles"
                  />
                </div>
                <div>
                  <label 
                    className="block text-sm font-semibold mb-2"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    }}
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.location_country}
                    onChange={(e) => setFormData({ ...formData, location_country: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border transition-colors"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                      borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      fontFamily: 'var(--font-body)',
                    }}
                    placeholder="United States"
                  />
                </div>
              </div>

              {/* Smart Link */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  Smart Link (rolink.me only)
                </label>
                <input
                  type="url"
                  value={formData.smart_link}
                  onChange={(e) => setFormData({ ...formData, smart_link: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)',
                  }}
                  placeholder="https://rolink.me/yourusername"
                />
                <p 
                  className="text-xs mt-1"
                  style={{
                    color: theme === 'dark' ? '#666666' : '#999999',
                  }}
                >
                  Only rolink.me URLs are accepted
                </p>
              </div>
            </div>

            {/* Roles & Skills */}
            <div 
              className="p-6 border-b"
              style={{
                borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
              }}
            >
              <h3 
                className="text-lg font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                Roles & Skills
              </h3>
              <p 
                className="text-sm mb-6"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#b3b3b3' : '#666666',
                }}
              >
                Select your roles and related skills
              </p>

              {roleCategories.length === 0 ? (
                <div className="text-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" style={{ color: '#009ae9' }} />
                  <p className="text-sm" style={{ color: theme === 'dark' ? '#666666' : '#999999' }}>
                    Loading roles...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {roleCategories.map((category) => {
                    const roleSkills = getSkillsForRole(category.id)
                    const isRoleSelected = selectedRoles.includes(category.id)
                    
                    return (
                      <div 
                        key={category.id} 
                        className="border rounded-lg p-4"
                        style={{
                          borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                        }}
                      >
                        {/* Role Checkbox */}
                        <label className="flex items-start cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isRoleSelected}
                            onChange={() => handleRoleToggle(category.id)}
                            className="h-5 w-5 rounded mt-0.5"
                            style={{ accentColor: '#009ae9' }}
                          />
                          <div className="ml-3 flex-1">
                            <div 
                              className="text-sm font-medium"
                              style={{
                                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                              }}
                            >
                              {category.name}
                            </div>
                            <div 
                              className="text-xs mt-0.5"
                              style={{
                                color: theme === 'dark' ? '#666666' : '#999999',
                              }}
                            >
                              {category.description}
                            </div>
                          </div>
                        </label>

                        {/* Skills for this role - shown directly below when role is selected */}
                        {isRoleSelected && roleSkills.length > 0 && (
                          <div 
                            className="mt-4 pl-8 border-l-2"
                            style={{
                              borderColor: 'rgba(0, 154, 233, 0.2)',
                            }}
                          >
                            <h5 
                              className="text-xs font-medium mb-2"
                              style={{
                                color: theme === 'dark' ? '#b3b3b3' : '#666666',
                              }}
                            >
                              Select skills for {category.name}:
                            </h5>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {roleSkills.map((skill) => {
                                const isSkillSelected = selectedSkills.includes(skill.id)
                                return (
                                  <label
                                    key={skill.id}
                                    className="flex items-center p-2 border rounded-lg cursor-pointer text-sm transition-all"
                                    style={{
                                      borderColor: isSkillSelected ? '#009ae9' : theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                                      backgroundColor: isSkillSelected ? 'rgba(0, 154, 233, 0.1)' : 'transparent',
                                      color: isSkillSelected ? '#009ae9' : theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSkillSelected}
                                      onChange={() => handleSkillToggle(skill.id)}
                                      className="h-4 w-4 rounded"
                                      style={{ accentColor: '#009ae9' }}
                                    />
                                    <span className="ml-2 text-xs">{skill.name}</span>
                                  </label>
                                )
                              })}
                            </div>

                            {/* Add Skill button for this role */}
                            {!showCustomSkillInput || currentRoleForCustomSkill !== category.id ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setShowCustomSkillInput(true)
                                  setCurrentRoleForCustomSkill(category.id)
                                }}
                                className="mt-3 text-sm px-4 py-2 rounded-lg border-2 border-dashed transition-all"
                                style={{
                                  borderColor: '#009ae9',
                                  color: '#009ae9',
                                  backgroundColor: theme === 'dark' ? 'rgba(0, 154, 233, 0.05)' : 'rgba(0, 154, 233, 0.02)',
                                }}
                              >
                                + Add Skill
                              </button>
                            ) : (
                              currentRoleForCustomSkill === category.id && (
                                <div className="flex gap-2 mt-3">
                                  <input
                                    type="text"
                                    value={customSkill}
                                    onChange={(e) => setCustomSkill(e.target.value)}
                                    placeholder="Enter skill..."
                                    className="flex-1 px-4 py-2 rounded-lg border"
                                    style={{
                                      backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                                      borderColor: '#009ae9',
                                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                                    }}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleCustomSkillSubmit()
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={handleCustomSkillSubmit}
                                    className="px-6 py-2 rounded-lg font-medium"
                                    style={{ backgroundColor: '#009ae9', color: 'white' }}
                                  >
                                    Submit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowCustomSkillInput(false)
                                      setCustomSkill('')
                                      setCurrentRoleForCustomSkill('')
                                    }}
                                    className="px-6 py-2 rounded-lg font-medium"
                                    style={{
                                      backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
                                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Genres */}
            <div 
              className="p-6 border-b"
              style={{
                borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
              }}
            >
              <h3 
                className="text-lg font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                Music Genres
              </h3>
              <p 
                className="text-sm mb-6"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#b3b3b3' : '#666666',
                }}
              >
                Select the genres you work with
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-2">
                {genres.map((genre) => {
                  const isGenreSelected = selectedGenres.includes(genre.id)
                  return (
                    <label
                      key={genre.id}
                      className="flex items-center p-3 border rounded-lg cursor-pointer text-sm transition-all"
                      style={{
                        borderColor: isGenreSelected ? '#009ae9' : theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                        backgroundColor: isGenreSelected ? 'rgba(0, 154, 233, 0.1)' : 'transparent',
                        color: isGenreSelected ? '#009ae9' : theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isGenreSelected}
                        onChange={() => handleGenreToggle(genre.id)}
                        className="h-4 w-4 rounded"
                        style={{ accentColor: '#009ae9' }}
                      />
                      <span className="ml-2">{genre.name}</span>
                    </label>
                  )
                })}
              </div>

              {/* Add Genre */}
              {!showCustomGenreInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomGenreInput(true)}
                  className="mt-4 text-sm px-4 py-2 rounded-lg border-2 border-dashed transition-all"
                  style={{
                    borderColor: '#009ae9',
                    color: '#009ae9',
                    backgroundColor: theme === 'dark' ? 'rgba(0, 154, 233, 0.05)' : 'rgba(0, 154, 233, 0.02)',
                  }}
                >
                  + Add Genre
                </button>
              ) : (
                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    placeholder="Enter genre..."
                    className="flex-1 px-4 py-2 rounded-lg border"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                      borderColor: '#009ae9',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCustomGenreSubmit()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCustomGenreSubmit}
                    className="px-6 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: '#009ae9', color: 'white' }}
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomGenreInput(false)
                      setCustomGenre('')
                    }}
                    className="px-6 py-2 rounded-lg font-medium"
                    style={{
                      backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 flex justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 rounded-lg font-semibold transition-colors"
                style={{
                  color: theme === 'dark' ? '#b3b3b3' : '#666666',
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#009ae9] to-[#5ac8fa] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
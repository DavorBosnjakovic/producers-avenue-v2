// File: page.tsx
// Path: /src/app/(auth)/register/page.tsx
// Multi-step registration with roles, skills, and genres
// STYLED TO MATCH LOGIN PAGE - Only background, form, inputs, and CTA button changed

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { validateEmail, validateUsername, validatePassword } from '@/lib/utils/validation'

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

export default function RegisterPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const supabase = createClient()
  
  // Current step (1, 2, or 3)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  // Step 1: Account Basics
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)

  // Step 2: Roles & Skills
  const [roleCategories, setRoleCategories] = useState<RoleCategory[]>([])
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  // Step 3: Genres
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  // Custom inputs
  const [showCustomSkillInput, setShowCustomSkillInput] = useState(false)
  const [customSkill, setCustomSkill] = useState('')
  const [currentRoleForCustomSkill, setCurrentRoleForCustomSkill] = useState<string>('')
  const [showCustomGenreInput, setShowCustomGenreInput] = useState(false)
  const [customGenre, setCustomGenre] = useState('')
  const [tempUserId, setTempUserId] = useState<string>('')

  // UI State
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Refs for scrolling
  const errorRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  // Load role categories on mount
  useEffect(() => {
    loadRoleCategories()
    loadGenres()
  }, [])

  // Load skills when roles change
  useEffect(() => {
    if (selectedRoles.length > 0) {
      loadSkills()
    }
  }, [selectedRoles])

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (username.length < 3) {
        setUsernameAvailable(null)
        return
      }

      setUsernameChecking(true)
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('username', username.toLowerCase())
          .maybeSingle()

        console.log('Username check:', { username, data, error })
        setUsernameAvailable(!data)
      } catch (err) {
        console.error('Username check error:', err)
        setUsernameAvailable(null)
      } finally {
        setUsernameChecking(false)
      }
    }

    const debounce = setTimeout(checkUsername, 500)
    return () => clearTimeout(debounce)
  }, [username])

  // Scroll to error when it changes
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [error])

  const loadRoleCategories = async () => {
    const { data, error } = await supabase
      .from('user_role_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    console.log('Role categories loaded:', data, error)
    if (data) setRoleCategories(data)
    if (error) console.error('Error loading role categories:', error)
  }

  const loadSkills = async () => {
    const { data, error } = await supabase
      .from('user_role_skills')
      .select('*')
      .in('role_category_id', selectedRoles)
      .eq('is_active', true)
      .eq('is_admin_approved', true)
      .order('name')

    console.log('Skills loaded:', data, error)
    if (data) setAllSkills(data)
    if (error) console.error('Error loading skills:', error)
  }

  const loadGenres = async () => {
    const { data, error } = await supabase
      .from('genres')
      .select('*')
      .eq('is_active', true)
      .is('parent_genre_id', null)
      .order('name')

    console.log('Genres loaded:', data, error)
    if (data) setGenres(data)
    if (error) console.error('Error loading genres:', error)
  }

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    )
    
    if (selectedRoles.includes(roleId)) {
      setSelectedSkills(prev => 
        prev.filter(skillId => {
          const skill = allSkills.find(s => s.id === skillId)
          return skill?.role_category_id !== roleId
        })
      )
    }
  }

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    )
  }

  const handleGenreToggle = (genreId: string) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    )
  }

  const handleCustomSkillSubmit = async () => {
    if (!customSkill.trim() || !currentRoleForCustomSkill) return

    try {
      const { error } = await supabase
        .from('custom_field_requests')
        .insert({
          field_type: 'skill',
          field_value: customSkill.trim(),
          category_id: currentRoleForCustomSkill,
          requested_by: tempUserId ? [tempUserId] : [],
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

    try {
      const { error } = await supabase
        .from('custom_field_requests')
        .insert({
          field_type: 'genre',
          field_value: customGenre.trim(),
          requested_by: tempUserId ? [tempUserId] : [],
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

  const validateStep1 = () => {
    if (!fullName.trim()) {
      setError('Please enter your full name')
      return false
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return false
    }

    if (!validateUsername(username)) {
      setError('Username must be 3-20 characters (letters, numbers, _ or -)')
      return false
    }

    if (usernameAvailable === false) {
      setError('Username is already taken')
      return false
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and number')
      return false
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy')
      return false
    }

    return true
  }

  const validateStep2 = () => {
    if (selectedRoles.length === 0) {
      setError('Please select at least one role')
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (selectedGenres.length === 0) {
      setError('Please select at least one genre')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError('')
    
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    
    setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleBack = () => {
    setError('')
    setCurrentStep(prev => Math.max(prev - 1, 1))
    
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleRegister = async () => {
    setError('')
    
    if (!validateStep3()) return

    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username.toLowerCase(),
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No user returned from signup')

      const userId = authData.user.id
      setTempUserId(userId)

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          username: username.toLowerCase(),
          display_name: fullName,
          email: email,
        })

      if (profileError) throw profileError

      if (selectedRoles.length > 0) {
        const { error: categoriesError } = await supabase
          .from('user_selected_categories')
          .insert(
            selectedRoles.map(roleId => ({
              user_id: userId,
              role_category_id: roleId
            }))
          )

        if (categoriesError) {
          console.error('Categories error:', categoriesError)
          throw categoriesError
        }
      }

      if (selectedSkills.length > 0) {
        const { error: skillsError } = await supabase
          .from('user_selected_skills')
          .insert(
            selectedSkills.map(skillId => ({
              user_id: userId,
              skill_id: skillId
            }))
          )

        if (skillsError) {
          console.error('Skills error:', skillsError)
          throw skillsError
        }
      }

      if (selectedGenres.length > 0) {
        const { error: genresError } = await supabase
          .from('user_selected_genres')
          .insert(
            selectedGenres.map(genreId => ({
              user_id: userId,
              genre_id: genreId
            }))
          )

        if (genresError) {
          console.error('Genres error:', genresError)
          throw genresError
        }
      }

      router.push('/welcome')

    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  const getSkillsForRole = (roleId: string) => {
    return allSkills.filter(skill => skill.role_category_id === roleId)
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
        paddingTop: 'calc(3rem - 48px)',
        paddingBottom: '3rem',
      }}
    >
      <div className="max-w-2xl w-full space-y-8" ref={formRef}>
        <div>
          <h2 
            className="mt-6 text-center text-3xl font-bold"
            style={{
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
            }}
          >
            Create your account
          </h2>
          <p 
            className="mt-2 text-center text-sm"
            style={{
              fontFamily: 'var(--font-body)',
              color: theme === 'dark' ? '#b3b3b3' : '#666666',
            }}
          >
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {error && (
          <div 
            ref={errorRef}
            className="px-4 py-3 rounded-lg text-sm border"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fee',
              borderColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : '#fcc',
              color: theme === 'dark' ? '#fca5a5' : '#dc2626',
            }}
          >
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-[#1a1a1a] shadow-[0_0_8px_0_rgba(0,154,233,0.5)] border border-[#009ae9] rounded-lg px-8 py-10">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label 
                  htmlFor="fullName" 
                  className="block text-sm font-medium mb-1"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 rounded-xl border transition-colors"
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)',
                  }}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label 
                  htmlFor="username" 
                  className="block text-sm font-medium mb-1"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  Username *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    className="appearance-none relative block w-full px-4 py-3 rounded-xl border transition-colors"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                      borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      fontFamily: 'var(--font-body)',
                    }}
                    placeholder="johndoe"
                  />
                  {usernameChecking && (
                    <div className="absolute right-3 top-2.5">
                      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  {!usernameChecking && usernameAvailable === true && username.length >= 3 && (
                    <div className="absolute right-3 top-2.5 text-green-500">✓</div>
                  )}
                  {!usernameChecking && usernameAvailable === false && (
                    <div className="absolute right-3 top-2.5 text-red-500">✗</div>
                  )}
                </div>
                {usernameAvailable === false && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">Username is already taken</p>
                )}
                {usernameAvailable === true && username.length >= 3 && (
                  <p className="mt-1 text-sm text-green-600 dark:text-green-400">Username is available</p>
                )}
              </div>

              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium mb-1"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 rounded-xl border transition-colors"
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)',
                  }}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium mb-1"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 rounded-xl border transition-colors"
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)',
                  }}
                  placeholder="••••••••"
                />
                <p 
                  className="mt-1 text-xs"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#b3b3b3' : '#666666',
                  }}
                >
                  At least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-medium mb-1"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 rounded-xl border transition-colors"
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)',
                  }}
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 rounded"
                  style={{
                    accentColor: '#009ae9',
                  }}
                />
                <label 
                  htmlFor="terms" 
                  className="ml-2 block text-sm"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  I agree to the{' '}
                  <Link href="/terms" className="font-semibold" style={{ color: '#009ae9' }}>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="font-semibold" style={{ color: '#009ae9' }}>
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Select your roles (check all that apply)
                </h4>
                
                {roleCategories.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading roles...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {roleCategories.map((category) => {
                      const roleSkills = getSkillsForRole(category.id)
                      const isRoleSelected = selectedRoles.includes(category.id)
                      
                      return (
                        <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <label className="flex items-start cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isRoleSelected}
                              onChange={() => handleRoleToggle(category.id)}
                              className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded mt-0.5"
                            />
                            <div className="ml-3 flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {category.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {category.description}
                              </div>
                            </div>
                          </label>

                          {isRoleSelected && roleSkills.length > 0 && (
                            <div className="mt-4 pl-8 border-l-2 border-primary/20">
                              <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select skills for {category.name}:
                              </h5>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {roleSkills.map((skill) => (
                                  <label
                                    key={skill.id}
                                    className={`flex items-center p-2 border rounded-lg cursor-pointer text-sm transition-all ${
                                      selectedSkills.includes(skill.id)
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedSkills.includes(skill.id)}
                                      onChange={() => handleSkillToggle(skill.id)}
                                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-xs">{skill.name}</span>
                                  </label>
                                ))}
                              </div>

                              {!showCustomSkillInput || currentRoleForCustomSkill !== category.id ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowCustomSkillInput(true)
                                    setCurrentRoleForCustomSkill(category.id)
                                  }}
                                  className="mt-3 text-sm px-4 py-2 rounded-lg border-2 border-dashed transition-all border-primary text-primary bg-primary/5 hover:bg-primary/10"
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
                                      className="flex-1 px-4 py-2 rounded-lg border border-primary focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
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
                                      className="px-6 py-2 rounded-lg font-medium bg-primary text-white hover:opacity-90"
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
                                      className="px-6 py-2 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
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
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Select genres you work with *
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-2">
                  {genres.map((genre) => (
                    <label
                      key={genre.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer text-sm transition-all ${
                        selectedGenres.includes(genre.id)
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedGenres.includes(genre.id)}
                        onChange={() => handleGenreToggle(genre.id)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="ml-2">{genre.name}</span>
                    </label>
                  ))}
                </div>

                {!showCustomGenreInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomGenreInput(true)}
                    className="mt-4 text-sm px-4 py-2 rounded-lg border-2 border-dashed transition-all border-primary text-primary bg-primary/5 hover:bg-primary/10"
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
                      className="flex-1 px-4 py-2 rounded-lg border border-primary focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
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
                      className="px-6 py-2 rounded-lg font-medium bg-primary text-white hover:opacity-90"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomGenreInput(false)
                        setCustomGenre('')
                      }}
                      className="px-6 py-2 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Back
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 btn btn-cta py-3"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                className="flex-1 btn btn-cta py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Complete Registration'}
              </button>
            )}
          </div>

          <div className="text-center mt-6">
            <p 
              className="text-sm"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#b3b3b3' : '#666666',
              }}
            >
              Already have an account?{' '}
              <Link href="/login" className="font-semibold" style={{ color: '#009ae9' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
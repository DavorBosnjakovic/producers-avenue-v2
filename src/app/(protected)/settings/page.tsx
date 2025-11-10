// File: page.tsx
// Path: /src/app/(protected)/settings/page.tsx
// Settings page - user preferences and account management

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { validateEmail, validateUsername } from '@/lib/utils/validation'

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Profile state
  const [profile, setProfile] = useState({
    username: '',
    display_name: '',
    bio: '',
    location: '',
    website: '',
    avatar_url: '',
  })

  // Account state
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Notification state
  const [notifications, setNotifications] = useState({
    email_messages: true,
    email_orders: true,
    email_marketing: false,
    push_messages: true,
    push_orders: true,
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setEmail(user.email || '')

      // Load profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      // Load notification preferences
      const { data: notifData } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (notifData) {
        setNotifications(notifData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      if (!validateUsername(profile.username)) {
        setMessage({ type: 'error', text: 'Invalid username format' })
        return
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase
        .from('user_profiles')
        .update({
          username: profile.username,
          display_name: profile.display_name,
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
        })
        .eq('user_id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match' })
        return
      }

      if (newPassword.length < 8) {
        setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
        return
      }

      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password' })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...notifications,
        })

      if (error) throw error

      setMessage({ type: 'success', text: 'Notification preferences updated!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update preferences' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      const supabase = createClient()
      // Implement account deletion logic
      // This typically involves soft-deleting the user and their data
      console.log('Deleting account...')
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                  activeTab === 'profile'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                  activeTab === 'account'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Account
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                  activeTab === 'notifications'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                  activeTab === 'privacy'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Privacy
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              
              {/* Message */}
              {message.text && (
                <div className={`mb-6 px-4 py-3 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile}>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Profile Information
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={profile.username}
                        onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase() })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={profile.display_name}
                        onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                        placeholder="City, Country"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={profile.website}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                        placeholder="https://example.com"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      Account Settings
                    </h2>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white cursor-not-allowed"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Contact support to change your email address
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                      Change Password
                    </h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
                    <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
                      Danger Zone
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <form onSubmit={handleSaveNotifications}>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Notification Preferences
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Email Notifications
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                          <span className="text-gray-900 dark:text-white">New messages</span>
                          <input
                            type="checkbox"
                            checked={notifications.email_messages}
                            onChange={(e) => setNotifications({ ...notifications, email_messages: e.target.checked })}
                            className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                          <span className="text-gray-900 dark:text-white">Order updates</span>
                          <input
                            type="checkbox"
                            checked={notifications.email_orders}
                            onChange={(e) => setNotifications({ ...notifications, email_orders: e.target.checked })}
                            className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                          <span className="text-gray-900 dark:text-white">Marketing emails</span>
                          <input
                            type="checkbox"
                            checked={notifications.email_marketing}
                            onChange={(e) => setNotifications({ ...notifications, email_marketing: e.target.checked })}
                            className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Push Notifications
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                          <span className="text-gray-900 dark:text-white">New messages</span>
                          <input
                            type="checkbox"
                            checked={notifications.push_messages}
                            onChange={(e) => setNotifications({ ...notifications, push_messages: e.target.checked })}
                            className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                          <span className="text-gray-900 dark:text-white">Order updates</span>
                          <input
                            type="checkbox"
                            checked={notifications.push_orders}
                            onChange={(e) => setNotifications({ ...notifications, push_orders: e.target.checked })}
                            className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Privacy Settings
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Control who can see your information and activity.
                  </p>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Show profile in search results</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Allow others to find your profile</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Show online status</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Let others see when you're online</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Allow messages from anyone</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Anyone can send you messages</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </label>
                  </div>

                  <button className="btn-primary px-6 py-3 mt-6">
                    Save Privacy Settings
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
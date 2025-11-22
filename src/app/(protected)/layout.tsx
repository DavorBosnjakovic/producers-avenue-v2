// File: layout.tsx
// Path: /src/app/(protected)/layout.tsx
// Layout for protected pages with collapsible sidebar - UPDATED with Create button

'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import CreateChoiceModal from '@/components/feed/CreateChoiceModal'
import CreatePostModal from '@/components/feed/CreatePostModal'
import AddStoryModal from '@/components/feed/AddStoryModal'

// User profile type
interface UserProfile {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  
  // Modal states
  const [showCreateChoiceModal, setShowCreateChoiceModal] = useState(false)
  const [showCreatePostModal, setShowCreatePostModal] = useState(false)
  const [showAddStoryModal, setShowAddStoryModal] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }
    
    setUser(user)
    
    // Fetch user profile with avatar
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id, username, display_name, avatar_url')
      .eq('user_id', user.id)
      .single()

    if (profile) {
      setUserProfile(profile)
    }
    
    setLoading(false)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: '/feed', label: 'Feed', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/profile', label: 'My Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { href: userProfile?.username ? `/store/${userProfile.username}` : '/store', label: 'My Store', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { href: '/orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { href: '#create', label: 'Create', icon: 'M12 4v16m8-8H4', isAction: true },
    { href: '/messages', label: 'Messages', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { href: '/notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { href: '/groups', label: 'Groups', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { href: '/wallet', label: 'Wallet', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { href: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ]

  // Helper function to check if a nav item is active
  const isNavItemActive = (href: string) => {
    if (href === '/profile') {
      const isOwnMemberProfile = userProfile?.username && pathname === `/member/${userProfile.username}`
      const isProfileSettings = pathname.startsWith('/settings/profile')
      return pathname === '/profile' || isOwnMemberProfile || isProfileSettings
    }
    if (href === '/store') {
      return pathname.startsWith('/store')
    }
    return pathname === href
  }

  return (
    <>
      <div className="flex">
        {/* Sidebar - Desktop (Collapsible) */}
        <aside 
          className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 border-r border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] transition-all duration-300 ease-in-out z-30 ${
            sidebarExpanded ? 'lg:w-64 shadow-xl' : 'lg:w-16'
          }`}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
        >
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto py-6">
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const isActive = isNavItemActive(item.href)
                
                // Handle Create button differently (it's an action, not a link)
                if (item.isAction) {
                  return (
                    <button
                      key={item.href}
                      onClick={() => setShowCreateChoiceModal(true)}
                      className="w-full flex items-center py-3 text-sm font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-white dark:hover:from-gray-800 dark:hover:to-[#1a1a1a] pl-5 pr-3"
                    >
                      <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      <span className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                        sidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                      }`}>
                        {item.label}
                      </span>
                    </button>
                  )
                }
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#009ae9] to-white dark:to-[#1a1a1a] text-white shadow-lg pl-5 pr-3'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-white dark:hover:from-gray-800 dark:hover:to-[#1a1a1a] pl-5 pr-3'
                    }`}
                  >
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                      sidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </nav>

            {/* User Section */}
            {sidebarExpanded && (
              <div className="px-3 py-4 border-t border-[#e0e0e0] dark:border-[#2a2a2a]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#009ae9] to-[#5ac8fa] flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {userProfile?.avatar_url ? (
                      <img 
                        src={userProfile.avatar_url} 
                        alt={userProfile.display_name || userProfile.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.email?.[0].toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {userProfile?.display_name || userProfile?.username || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-[#e0e0e0] dark:border-[#2a2a2a] z-50">
          <div className="flex justify-around items-stretch h-16">
            {navItems.slice(0, 5).map((item) => {
              const isActive = isNavItemActive(item.href)
              
              // Handle Create button on mobile
              if (item.isAction) {
                return (
                  <button
                    key={item.href}
                    onClick={() => setShowCreateChoiceModal(true)}
                    className="flex flex-col items-center justify-center flex-1 transition-all text-gray-600 dark:text-gray-400 hover:bg-gradient-to-t hover:from-gray-100 hover:to-white dark:hover:from-gray-800 dark:hover:to-[#1a1a1a]"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span className="text-xs mt-1">{item.label}</span>
                  </button>
                )
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center flex-1 transition-all ${
                    isActive
                      ? 'bg-gradient-to-t from-[#009ae9] to-white dark:to-[#1a1a1a] text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gradient-to-t hover:from-gray-100 hover:to-white dark:hover:from-gray-800 dark:hover:to-[#1a1a1a]'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
                </Link>
              )
            })}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center justify-center flex-1 text-gray-600 dark:text-gray-400 hover:bg-gradient-to-t hover:from-gray-100 hover:to-white dark:hover:from-gray-800 dark:hover:to-[#1a1a1a] transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-xs mt-1">More</span>
            </button>
          </div>
        </nav>

        {/* Mobile Slide-out Menu */}
        {sidebarOpen && (
          <>
            <div 
              className="lg:hidden fixed inset-0 z-40 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <aside 
              className="lg:hidden fixed inset-y-0 left-0 w-80 bg-white dark:bg-[#1a1a1a] z-50 transform transition-transform duration-300 ease-in-out shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#e0e0e0] dark:border-[#2a2a2a]">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Menu</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-[#e0e0e0] dark:border-[#2a2a2a]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#009ae9] to-[#5ac8fa] flex items-center justify-center text-white font-semibold text-lg">
                      {userProfile?.avatar_url ? (
                        <img 
                          src={userProfile.avatar_url} 
                          alt={userProfile.display_name || userProfile.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user?.email?.[0].toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-gray-900 dark:text-white truncate">
                        {userProfile?.display_name || userProfile?.username || user?.email?.split('@')[0]}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                  <div className="px-4 space-y-1">
                    {navItems.map((item) => {
                      const isActive = isNavItemActive(item.href)
                      
                      // Handle Create button in mobile menu
                      if (item.isAction) {
                        return (
                          <button
                            key={item.href}
                            onClick={() => {
                              setSidebarOpen(false)
                              setShowCreateChoiceModal(true)
                            }}
                            className="w-full flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-white dark:hover:from-gray-800 dark:hover:to-[#1a1a1a]"
                          >
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                            {item.label}
                          </button>
                        )
                      }
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-[#009ae9] to-white dark:to-[#1a1a1a] text-white'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-white dark:hover:from-gray-800 dark:hover:to-[#1a1a1a]'
                          }`}
                        >
                          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                          </svg>
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                </nav>

                {/* Sign Out */}
                <div className="p-4 border-t border-[#e0e0e0] dark:border-[#2a2a2a] mt-auto">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center px-4 py-3 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:pl-16 pb-16 lg:pb-0 bg-white dark:bg-[#1a1a1a] min-h-screen">
          {children}
        </main>
      </div>

      {/* Modals */}
      <CreateChoiceModal
        isOpen={showCreateChoiceModal}
        onClose={() => setShowCreateChoiceModal(false)}
        onSelectPost={() => {
          setShowCreateChoiceModal(false)
          setShowCreatePostModal(true)
        }}
        onSelectStory={() => {
          setShowCreateChoiceModal(false)
          setShowAddStoryModal(true)
        }}
      />

      {showCreatePostModal && (
        <CreatePostModal
          isOpen={showCreatePostModal}
          onClose={() => setShowCreatePostModal(false)}
          onPostCreated={() => {
            setShowCreatePostModal(false)
            // Reload page to show new post
            if (typeof window !== 'undefined') {
              window.location.reload()
            }
          }}
        />
      )}

      {showAddStoryModal && user && (
        <AddStoryModal
          onClose={() => setShowAddStoryModal(false)}
          currentUserId={user.id}
          onStoryCreated={() => {
            setShowAddStoryModal(false)
          }}
        />
      )}
    </>
  )
}
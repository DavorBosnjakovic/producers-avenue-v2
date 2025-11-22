// File: Header.tsx
// Path: /src/components/layout/Header.tsx
// Global header component with navigation

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/contexts/ThemeContext'
import ThemeToggle from '@/components/common/ThemeToggle'
import { useState, useEffect } from 'react'
import SearchModal from '@/components/common/SearchModal'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'

// User profile type
interface UserProfile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export default function Header() {
  const { theme } = useTheme()
  const router = useRouter()
  const { itemCount } = useCart()
  const { itemCount: wishlistCount } = useWishlist()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isCommunityOpen, setIsCommunityOpen] = useState(false)
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileCommunityOpen, setIsMobileCommunityOpen] = useState(false)
  const [isMobileMarketplaceOpen, setIsMobileMarketplaceOpen] = useState(false)
  const [dropdownTimer, setDropdownTimer] = useState<NodeJS.Timeout | null>(null)
  const [communityTimer, setCommunityTimer] = useState<NodeJS.Timeout | null>(null)
  const [marketplaceTimer, setMarketplaceTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadUser()

    // Listen for auth state changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        loadUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isDropdownOpen && !target.closest('.avatar-dropdown-container')) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const loadUser = async () => {
    try {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (authUser) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id, username, display_name, avatar_url')
          .eq('user_id', authUser.id)
          .single()

        if (profile) {
          setUser(profile)
        }
      }
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null)
      setIsDropdownOpen(false)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
          borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side: Logo + Hamburger (mobile) */}
            <div className="flex items-center gap-4">
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <Image
                  src={theme === 'dark' ? '/images/logo-dark-header.png' : '/images/logo-light-header.png'}
                  alt="Producers Avenue"
                  width={200}
                  height={45}
                  className="h-11 w-auto mt-1"
                />
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg"
                style={{
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {/* Community Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => {
                  if (communityTimer) clearTimeout(communityTimer)
                  setIsCommunityOpen(true)
                }}
                onMouseLeave={() => {
                  const timer = setTimeout(() => setIsCommunityOpen(false), 300)
                  setCommunityTimer(timer)
                }}
              >
                <button
                  className="transition-colors flex items-center gap-1"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: isCommunityOpen ? '#009ae9' : (theme === 'dark' ? '#b3b3b3' : '#666666'),
                  }}
                >
                  Community
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isCommunityOpen && (
                  <div
                    className="absolute left-0 mt-2 w-48 rounded-lg shadow-lg py-2 z-50"
                    style={{
                      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                      border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'}`,
                    }}
                  >
                    <Link
                      href="/community"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      }}
                    >
                      Browse Members
                    </Link>
                    <Link
                      href="/groups"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      }}
                    >
                      Groups
                    </Link>
                    <Link
                      href="/feed"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      }}
                    >
                      Feed
                    </Link>
                  </div>
                )}
              </div>

              {/* Marketplace Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => {
                  if (marketplaceTimer) clearTimeout(marketplaceTimer)
                  setIsMarketplaceOpen(true)
                }}
                onMouseLeave={() => {
                  const timer = setTimeout(() => setIsMarketplaceOpen(false), 300)
                  setMarketplaceTimer(timer)
                }}
              >
                <button
                  className="transition-colors flex items-center gap-1"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: isMarketplaceOpen ? '#009ae9' : (theme === 'dark' ? '#b3b3b3' : '#666666'),
                  }}
                >
                  Marketplace
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isMarketplaceOpen && (
                  <div
                    className="absolute left-0 mt-2 w-48 rounded-lg shadow-lg py-2 z-50"
                    style={{
                      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                      border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'}`,
                    }}
                  >
                    <Link
                      href="/marketplace"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      }}
                    >
                      Browse All
                    </Link>
                    <Link
                      href="/marketplace/products"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      }}
                    >
                      Products
                    </Link>
                    <Link
                      href="/marketplace/services"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      }}
                    >
                      Services
                    </Link>
                    <Link
                      href="/marketplace/webinars"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      }}
                    >
                      Webinars
                    </Link>
                  </div>
                )}
              </div>

              {/* Tools - Regular Link */}
              <Link
                href="/tools"
                className="transition-colors"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#b3b3b3' : '#666666',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#009ae9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme === 'dark' ? '#b3b3b3' : '#666666'
                }}
              >
                Tools
              </Link>

              {/* Pricing - Regular Link */}
              <Link
                href="/pricing"
                className="transition-colors"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#b3b3b3' : '#666666',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#009ae9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme === 'dark' ? '#b3b3b3' : '#666666'
                }}
              >
                Pricing
              </Link>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Search"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{
                    color: theme === 'dark' ? '#b3b3b3' : '#666666',
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Cart */}
              <Link
                href="/cart"
                className="hidden md:block relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Shopping Cart"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{
                    color: theme === 'dark' ? '#b3b3b3' : '#666666',
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {itemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                    style={{
                      backgroundColor: '#f09d22',
                      color: 'white',
                    }}
                  >
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="hidden md:block relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Wishlist"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{
                    color: theme === 'dark' ? '#b3b3b3' : '#666666',
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                    style={{
                      backgroundColor: '#f09d22',
                      color: 'white',
                    }}
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Notifications (auth only) */}
              {user && (
                <Link
                  href="/notifications"
                  className="hidden md:block relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Notifications"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </Link>
              )}

              {/* User Avatar / Login */}
              <div className="relative avatar-dropdown-container">
                {loading ? (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                ) : user ? (
                  <div
                    className="relative"
                    onMouseEnter={() => {
                      if (dropdownTimer) clearTimeout(dropdownTimer)
                      setIsDropdownOpen(true)
                    }}
                    onMouseLeave={() => {
                      const timer = setTimeout(() => setIsDropdownOpen(false), 300)
                      setDropdownTimer(timer)
                    }}
                  >
                    {/* Avatar */}
                    <div 
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-transparent hover:border-[#009ae9] transition-colors">
                        {user.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={user.display_name || user.username}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: '#009ae9' }}
                          >
                            {(user.display_name || user.username).charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div
                        className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-1 z-50"
                        style={{
                          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                          border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'}`,
                        }}
                      >
                        {/* Profile */}
                        <Link
                          href={`/member/${user.username}`}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          style={{
                            fontFamily: 'var(--font-body)',
                            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                          }}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>My Profile</span>
                        </Link>

                        {/* Feed */}
                        <Link
                          href="/feed"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          style={{
                            fontFamily: 'var(--font-body)',
                            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                          }}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span>Feed</span>
                        </Link>

                        {/* Messages */}
                        <Link
                          href="/messages"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          style={{
                            fontFamily: 'var(--font-body)',
                            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                          }}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>Messages</span>
                        </Link>

                        {/* Cart */}
                        <Link
                          href="/cart"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          style={{
                            fontFamily: 'var(--font-body)',
                            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                          }}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>Cart {itemCount > 0 && `(${itemCount})`}</span>
                        </Link>

                        {/* Wishlist */}
                        <Link
                          href="/wishlist"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          style={{
                            fontFamily: 'var(--font-body)',
                            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                          }}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</span>
                        </Link>

                        {/* Notifications */}
                        <Link
                          href="/notifications"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          style={{
                            fontFamily: 'var(--font-body)',
                            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                          }}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          <span>Notifications</span>
                        </Link>

                        {/* Divider */}
                        <div
                          className="border-t my-1"
                          style={{
                            borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                          }}
                        />

                        {/* My Store */}
                        <Link
                          href={`/store/${user.username}`}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          style={{
                            fontFamily: 'var(--font-body)',
                            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                          }}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span>My Store</span>
                        </Link>

                        {/* Wallet */}
                        <Link
                          href="/wallet"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          style={{
                            fontFamily: 'var(--font-body)',
                            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                          }}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <span>Wallet</span>
                        </Link>

                        {/* Settings */}
                        <Link
                          href="/settings"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          style={{
                            fontFamily: 'var(--font-body)',
                            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                          }}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Settings</span>
                        </Link>

                        {/* Divider */}
                        <div
                          className="border-t my-1"
                          style={{
                            borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                          }}
                        />

                        {/* Sign Out */}
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                          style={{
                            fontFamily: 'var(--font-body)',
                            color: '#ef4444',
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: '#009ae9',
                      color: 'white',
                      fontFamily: 'var(--font-body)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0088cc'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#009ae9'
                    }}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed top-16 left-0 right-0 z-40 shadow-lg"
          style={{
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            borderBottom: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'}`,
          }}
        >
          <div className="py-2">
            {/* Community with submenu */}
            <div>
              <button
                onClick={() => setIsMobileCommunityOpen(!isMobileCommunityOpen)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Community</span>
                </div>
                <svg className={`w-4 h-4 transition-transform ${isMobileCommunityOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isMobileCommunityOpen && (
                <div className="bg-gray-50 dark:bg-gray-800/50">
                  <Link
                    href="/community"
                    className="block px-4 py-2 pl-12 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Browse Members
                  </Link>
                  <Link
                    href="/groups"
                    className="block px-4 py-2 pl-12 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Groups
                  </Link>
                  <Link
                    href="/feed"
                    className="block px-4 py-2 pl-12 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Feed
                  </Link>
                </div>
              )}
            </div>

            {/* Marketplace with submenu */}
            <div>
              <button
                onClick={() => setIsMobileMarketplaceOpen(!isMobileMarketplaceOpen)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Marketplace</span>
                </div>
                <svg className={`w-4 h-4 transition-transform ${isMobileMarketplaceOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isMobileMarketplaceOpen && (
                <div className="bg-gray-50 dark:bg-gray-800/50">
                  <Link
                    href="/marketplace"
                    className="block px-4 py-2 pl-12 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Browse All
                  </Link>
                  <Link
                    href="/marketplace/products"
                    className="block px-4 py-2 pl-12 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Products
                  </Link>
                  <Link
                    href="/marketplace/services"
                    className="block px-4 py-2 pl-12 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Services
                  </Link>
                  <Link
                    href="/marketplace/webinars"
                    className="block px-4 py-2 pl-12 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Webinars
                  </Link>
                </div>
              )}
            </div>

            {/* Tools */}
            <Link
              href="/tools"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Tools</span>
            </Link>

            {/* Pricing */}
            <Link
              href="/pricing"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Pricing</span>
            </Link>

            {/* About */}
            <Link
              href="/about"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>About</span>
            </Link>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
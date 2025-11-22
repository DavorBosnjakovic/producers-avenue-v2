// File: MemberCard.tsx
// Path: /src/components/community/MemberCard.tsx
// Community member card - now using FollowButton component

'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import Link from 'next/link'
import Image from 'next/image'
import FollowButton from '@/components/profile/FollowButton'

interface MemberCardProps {
  id: string
  userId: string
  username: string
  displayName: string
  avatar: string | null
  bio: string | null
  location: string | null
  categories: string[]
  genres: string[]
  followers: number
  following: number
  products: number
  services: number
  subscriptionTier: string
  experienceLevel: string | null
  isFollowing: boolean
  isCurrentUser: boolean
}

export default function MemberCard({
  userId,
  username,
  displayName,
  avatar,
  bio,
  categories,
  followers,
  products,
  isFollowing = false,
  isCurrentUser = false,
}: MemberCardProps) {
  const { theme } = useTheme()
  const [followerCount, setFollowerCount] = useState(followers)

  const handleFollowChange = (newIsFollowing: boolean) => {
    // Update local count when follow status changes
    setFollowerCount(prev => newIsFollowing ? prev + 1 : prev - 1)
  }

  return (
    <Link
      href={`/member/${username}`}
      className="group rounded-xl border transition-all duration-300 hover:shadow-lg backdrop-blur-md overflow-hidden flex flex-col flex-shrink-0"
      style={{
        width: '280px',
        height: '420px',
        backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
        borderColor: isCurrentUser ? '#ff6b35' : (theme === 'dark' ? '#2a2a2a' : '#e0e0e0'),
        borderWidth: '1px',
      }}
    >
      <div className="p-3 flex flex-col h-full relative">
        {isCurrentUser && (
          <div
            className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold z-10"
            style={{ backgroundColor: '#ff6b35', color: 'white' }}
          >
            ME
          </div>
        )}

        <div className="flex items-start gap-3 mb-3">
          <div className="relative w-16 h-16 flex-shrink-0">
            {avatar ? (
              <Image
                src={avatar}
                alt={displayName}
                fill
                className="rounded-full object-cover"
                sizes="64px"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                style={{ backgroundColor: '#009ae9', color: 'white' }}
              >
                {(displayName || username).charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-sm mb-1 truncate"
              style={{
                fontFamily: 'var(--font-heading)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
            >
              {displayName}
            </h3>
            <p
              className="text-xs truncate"
              style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}
            >
              @{username}
            </p>
          </div>
        </div>

        {bio && (
          <p
            className="text-xs mb-3 line-clamp-2"
            style={{
              color: theme === 'dark' ? '#b3b3b3' : '#666666',
              fontFamily: 'var(--font-body)',
            }}
          >
            {bio}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-auto">
          {categories.slice(0, 3).map((cat, idx) => (
            <span
              key={idx}
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: 'rgba(0, 154, 233, 0.1)',
                color: '#009ae9',
              }}
            >
              {cat}
            </span>
          ))}
        </div>

        <div
          className="flex items-center gap-2 text-xs mb-2 mt-3"
          style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}
        >
          <span>{followerCount} followers</span>
          <span>•</span>
          <span>{products} products</span>
        </div>

        {!isCurrentUser ? (
          <div onClick={(e) => e.preventDefault()}>
            <FollowButton
              targetUserId={userId}
              initialIsFollowing={isFollowing}
              className="w-full py-2.5 text-sm"
              onFollowChange={handleFollowChange}
            />
          </div>
        ) : (
          <button
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: '#ff6b35',
              color: 'white',
            }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.location.href = '/settings/profile'
            }}
          >
            My Profile
          </button>
        )}
      </div>
    </Link>
  )
}
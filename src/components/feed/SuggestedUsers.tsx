// File: SuggestedUsers.tsx
// Path: /src/components/feed/SuggestedUsers.tsx

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'

interface SuggestedUser {
  user_id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  followers_count: number
  mutual_followers_count: number
}

interface SuggestedUsersProps {
  currentUserId: string
  limit?: number
}

export default function SuggestedUsers({ currentUserId, limit = 5 }: SuggestedUsersProps) {
  const [users, setUsers] = useState<SuggestedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [followingStates, setFollowingStates] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    loadSuggestedUsers()
  }, [currentUserId])

  const loadSuggestedUsers = async () => {
    try {
      const supabase = createClient()
      
      // Get users that current user is already following
      const { data: followingData } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', currentUserId)
      
      const followingIds = followingData?.map(f => f.following_id) || []

      // Get suggested users (excluding already followed and self)
      const { data: suggestedUsers, error } = await supabase
        .from('user_profiles')
        .select('user_id, username, display_name, avatar_url, bio, followers_count')
        .neq('user_id', currentUserId)
        .not('user_id', 'in', `(${followingIds.join(',') || 'null'})`)
        .order('followers_count', { ascending: false })
        .limit(limit * 2) // Get more to filter
      
      if (error) throw error

      // Filter out followed users and take only the limit
      const unfollowedUsers = (suggestedUsers || [])
        .filter(user => !followingIds.includes(user.user_id))
        .slice(0, limit)
        .map(user => ({
          ...user,
          mutual_followers_count: 0 // Can be enhanced with a query
        }))

      setUsers(unfollowedUsers)

      // Initialize following states (all false since we filtered out followed users)
      const states: { [key: string]: boolean } = {}
      unfollowedUsers.forEach(user => {
        states[user.user_id] = false
      })
      setFollowingStates(states)

    } catch (error) {
      console.error('Error loading suggested users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (userId: string) => {
    try {
      const supabase = createClient()
      const isCurrentlyFollowing = followingStates[userId]

      if (isCurrentlyFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', userId)
        
        if (error) throw error
      } else {
        // Follow
        const { error } = await supabase
          .from('followers')
          .insert({ 
            follower_id: currentUserId, 
            following_id: userId 
          })
        
        if (error) throw error
      }

      // Update local state
      setFollowingStates(prev => ({ ...prev, [userId]: !isCurrentlyFollowing }))
      
      // Update follower count
      setUsers(prev => prev.map(user => 
        user.user_id === userId 
          ? { ...user, followers_count: user.followers_count + (isCurrentlyFollowing ? -1 : 1) } 
          : user
      ))

      // If user was just followed, remove them from suggestions after a delay
      if (!isCurrentlyFollowing) {
        setTimeout(() => {
          setUsers(prev => prev.filter(user => user.user_id !== userId))
        }, 1000)
      }

    } catch (error) {
      console.error('Error following/unfollowing user:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No suggestions available
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Suggested for you
        </h3>
        <Link 
          href="/community" 
          className="text-xs font-semibold text-[#009ae9] hover:text-[#0088d1] transition-colors"
        >
          See All
        </Link>
      </div>

      {users.map((user) => (
        <div key={user.user_id} className="flex items-center gap-3 py-2">
          <Link href={`/${user.username}`}>
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer">
              {user.avatar_url ? (
                <Image 
                  src={user.avatar_url} 
                  alt={user.display_name} 
                  width={40} 
                  height={40} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#009ae9] to-[#0076b9] flex items-center justify-center text-white font-semibold">
                  {user.display_name[0].toUpperCase()}
                </div>
              )}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <Link href={`/${user.username}`}>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate hover:text-[#009ae9] transition-colors cursor-pointer">
                {user.display_name}
              </p>
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.mutual_followers_count > 0 
                ? `Followed by ${user.mutual_followers_count} ${user.mutual_followers_count === 1 ? 'person' : 'people'} you follow`
                : user.bio ? user.bio.slice(0, 30) + (user.bio.length > 30 ? '...' : '') : `${user.followers_count} followers`
              }
            </p>
          </div>

          <button
            onClick={() => handleFollow(user.user_id)}
            className="text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
            style={{
              backgroundColor: followingStates[user.user_id] ? 'transparent' : '#009ae9',
              color: followingStates[user.user_id] ? '#009ae9' : 'white',
              border: followingStates[user.user_id] ? '1px solid #009ae9' : 'none',
            }}
          >
            {followingStates[user.user_id] ? 'Following' : 'Follow'}
          </button>
        </div>
      ))}
    </div>
  )
}
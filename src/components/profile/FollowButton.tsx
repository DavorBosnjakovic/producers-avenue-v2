// File: FollowButton.tsx
// Path: /src/components/profile/FollowButton.tsx
// FIXED: No redirect after follow, just updates UI

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface FollowButtonProps {
  targetUserId: string
  initialIsFollowing?: boolean
  className?: string
  onFollowChange?: (isFollowing: boolean) => void
}

export default function FollowButton({ 
  targetUserId, 
  initialIsFollowing = false,
  className = '',
  onFollowChange
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle()

      setIsFollowing(!!data)
    }

    checkStatus()
  }, [targetUserId, supabase])

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isFollowing ? 'unfollow' : 'follow',
          target_user_id: targetUserId,
        }),
      })

      const data = await response.json()

      if (response.status === 401) {
        window.location.href = '/login'
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update follow status')
      }

      const newFollowState = !isFollowing
      setIsFollowing(newFollowState)
      
      // Notify parent component if callback provided
      if (onFollowChange) {
        onFollowChange(newFollowState)
      }

      // DON'T call router.refresh() - it causes navigation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Follow error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleFollowToggle}
        disabled={isLoading}
        className={`px-6 py-2 rounded-lg font-medium transition-all ${
          isFollowing
            ? 'bg-[#1a1a1a] hover:bg-[#222222] text-white border border-[#333333]'
            : 'bg-[#009ae9] hover:bg-[#0088d1] text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
      </button>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}
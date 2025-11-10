// File: WishlistButton.tsx
// Path: /src/components/common/WishlistButton.tsx
// Wishlist button component for adding/removing items from wishlist

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface WishlistButtonProps {
  itemId: string
  itemType: 'product' | 'service'
  sellerId: string
  className?: string
  showText?: boolean
}

export default function WishlistButton({
  itemId,
  itemType,
  sellerId,
  className = '',
  showText = true,
}: WishlistButtonProps) {
  const router = useRouter()
  const supabase = createClient()

  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    checkWishlistStatus()
  }, [itemId])

  const checkWishlistStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      setUserId(user.id)

      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('item_type', itemType)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking wishlist:', error)
      }

      setIsInWishlist(!!data)
    } catch (error) {
      console.error('Error checking wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleWishlist = async () => {
    // Check if user is logged in
    if (!userId) {
      router.push('/login')
      return
    }

    setProcessing(true)

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', userId)
          .eq('item_id', itemId)
          .eq('item_type', itemType)

        if (error) throw error

        setIsInWishlist(false)
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlist')
          .insert({
            user_id: userId,
            item_id: itemId,
            item_type: itemType,
            seller_id: sellerId,
          })

        if (error) throw error

        setIsInWishlist(true)
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      alert('Failed to update wishlist. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-400 cursor-not-allowed ${className}`}
      >
        <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {showText && <span>Loading...</span>}
      </button>
    )
  }

  return (
    <button
      onClick={toggleWishlist}
      disabled={processing}
      className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
        isInWishlist
          ? 'border-[#FF6B2C] bg-[#FF6B2C] text-white'
          : 'border-gray-300 text-gray-700 hover:border-[#FF6B2C] hover:text-[#FF6B2C]'
      } ${className}`}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg
        className={`w-5 h-5 ${processing ? 'animate-pulse' : ''}`}
        fill={isInWishlist ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showText && (
        <span className="font-medium">
          {processing
            ? isInWishlist
              ? 'Removing...'
              : 'Adding...'
            : isInWishlist
            ? 'Saved'
            : 'Save'}
        </span>
      )}
    </button>
  )
}
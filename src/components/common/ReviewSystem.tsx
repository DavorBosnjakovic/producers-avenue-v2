// File: ReviewSystem.tsx
// Path: /src/components/common/ReviewSystem.tsx
// Review and rating system component

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Review {
  id: string
  user_id: string
  reviewer_name: string
  reviewer_avatar: string | null
  rating: number
  comment: string
  created_at: string
}

interface ReviewSystemProps {
  itemId: string
  itemType: 'product' | 'service'
  sellerId: string
}

export default function ReviewSystem({ itemId, itemType, sellerId }: ReviewSystemProps) {
  const supabase = createClient()
  
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [loading, setLoading] = useState(true)
  const [canReview, setCanReview] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
  })

  useEffect(() => {
    loadReviews()
    checkIfCanReview()
  }, [itemId])

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:user_profiles!reviews_user_id_fkey(username, display_name, avatar_url)
        `)
        .eq(itemType === 'product' ? 'product_id' : 'service_id', itemId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedReviews: Review[] = (data || []).map((review) => ({
        id: review.id,
        user_id: review.user_id,
        reviewer_name: review.reviewer?.display_name || review.reviewer?.username || 'Anonymous',
        reviewer_avatar: review.reviewer?.avatar_url || null,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
      }))

      setReviews(formattedReviews)
      setTotalReviews(formattedReviews.length)

      // Calculate average rating
      if (formattedReviews.length > 0) {
        const sum = formattedReviews.reduce((acc, review) => acc + review.rating, 0)
        setAverageRating(sum / formattedReviews.length)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkIfCanReview = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setCanReview(false)
        return
      }

      // User cannot review their own items
      if (user.id === sellerId) {
        setCanReview(false)
        return
      }

      // Check if user has purchased this item
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('buyer_id', user.id)
        .eq(itemType === 'product' ? 'product_id' : 'service_id', itemId)
        .eq('status', 'completed')

      if (!orders || orders.length === 0) {
        setCanReview(false)
        return
      }

      // Check if user has already reviewed this item
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq(itemType === 'product' ? 'product_id' : 'service_id', itemId)
        .single()

      setCanReview(!existingReview)
    } catch (error) {
      console.error('Error checking review permission:', error)
      setCanReview(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (!newReview.comment.trim()) {
        alert('Please write a comment')
        setSubmitting(false)
        return
      }

      const reviewData = {
        user_id: user.id,
        [itemType === 'product' ? 'product_id' : 'service_id']: itemId,
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('reviews')
        .insert(reviewData)

      if (error) throw error

      // Reset form
      setNewReview({ rating: 5, comment: '' })
      setShowReviewForm(false)
      
      // Reload reviews
      await loadReviews()
      setCanReview(false)
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate && onRate(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <svg
              className={`w-5 h-5 ${
                star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
              fill={star <= rating ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / 86400000)

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    if (days < 365) return `${Math.floor(days / 30)} months ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl font-bold text-gray-900">
                {totalReviews > 0 ? averageRating.toFixed(1) : '0.0'}
              </span>
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-sm text-gray-600">
              {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Write Review Button */}
          {canReview && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-6 py-2 bg-[#FF6B2C] text-white rounded-lg hover:bg-[#ff5516] transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Write Your Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating *
              </label>
              {renderStars(newReview.rating, true, (rating) => setNewReview({ ...newReview, rating }))}
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                id="comment"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent"
                placeholder="Share your experience with this item..."
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-[#FF6B2C] text-white rounded-lg hover:bg-[#ff5516] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">
          {totalReviews > 0 ? 'Customer Reviews' : 'No Reviews Yet'}
        </h3>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <p className="text-gray-500">Be the first to review this {itemType}!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {review.reviewer_avatar ? (
                    <img
                      src={review.reviewer_avatar}
                      alt={review.reviewer_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-lg text-gray-500">
                        {review.reviewer_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{review.reviewer_name}</h4>
                    <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                  </div>
                  
                  <div className="mb-3">
                    {renderStars(review.rating)}
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
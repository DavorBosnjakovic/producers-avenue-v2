// File: page.tsx
// Path: /src/app/(protected)/wishlist/page.tsx
// Wishlist page

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface WishlistItem {
  id: string
  item_id: string
  item_type: 'product' | 'service'
  title: string
  description: string
  price: number
  image_url: string | null
  seller_id: string
  seller_name: string
  category: string
  created_at: string
}

export default function WishlistPage() {
  const router = useRouter()
  const supabase = createClient()

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'product' | 'service'>('all')

  useEffect(() => {
    loadWishlist()
  }, [])

  const loadWishlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: wishlist } = await supabase
        .from('wishlist')
        .select(`
          *,
          product:products(title, description, price, image_url, seller_id, category),
          service:services(title, description, price_from, image_url, seller_id, category),
          seller:user_profiles!wishlist_seller_id_fkey(username, display_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const formattedItems: WishlistItem[] = (wishlist || []).map((item) => {
        const isProduct = item.item_type === 'product'
        const itemData = isProduct ? item.product : item.service
        
        return {
          id: item.id,
          item_id: item.item_id,
          item_type: item.item_type,
          title: itemData?.title || 'Unknown Item',
          description: itemData?.description || '',
          price: isProduct ? itemData?.price : itemData?.price_from || 0,
          image_url: itemData?.image_url || null,
          seller_id: item.seller_id,
          seller_name: item.seller?.display_name || item.seller?.username || 'Unknown Seller',
          category: itemData?.category || 'Uncategorized',
          created_at: item.created_at,
        }
      })

      setWishlistItems(formattedItems)
    } catch (error) {
      console.error('Error loading wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (wishlistItemId: string) => {
    setRemoving(wishlistItemId)
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistItemId)

      if (error) throw error

      setWishlistItems((prev) => prev.filter((item) => item.id !== wishlistItemId))
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      alert('Failed to remove item from wishlist')
    } finally {
      setRemoving(null)
    }
  }

  const addToCart = async (item: WishlistItem) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Check if item already in cart
      const { data: existingItem } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', item.item_id)
        .eq('item_type', item.item_type)
        .single()

      if (existingItem) {
        alert('This item is already in your cart')
        return
      }

      // Add to cart
      const { error } = await supabase
        .from('cart')
        .insert({
          user_id: user.id,
          item_id: item.item_id,
          item_type: item.item_type,
          seller_id: item.seller_id,
        })

      if (error) throw error

      alert('Added to cart!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add to cart')
    }
  }

  const clearWishlist = async () => {
    if (!confirm('Are you sure you want to clear your wishlist?')) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      setWishlistItems([])
    } catch (error) {
      console.error('Error clearing wishlist:', error)
      alert('Failed to clear wishlist')
    }
  }

  const filteredItems = wishlistItems.filter((item) => {
    if (filter === 'all') return true
    return item.item_type === filter
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B2C]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          // Empty Wishlist
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="w-24 h-24 text-gray-300 mx-auto mb-4"
              fill="none"
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Save your favorite products and services for later
            </p>
            <Link
              href="/marketplace/products"
              className="inline-block px-6 py-3 bg-[#FF6B2C] text-white rounded-lg hover:bg-[#ff5516] transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <>
            {/* Filters and Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'all'
                      ? 'bg-[#FF6B2C] text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All ({wishlistItems.length})
                </button>
                <button
                  onClick={() => setFilter('product')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'product'
                      ? 'bg-[#FF6B2C] text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Products ({wishlistItems.filter(i => i.item_type === 'product').length})
                </button>
                <button
                  onClick={() => setFilter('service')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'service'
                      ? 'bg-[#FF6B2C] text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Services ({wishlistItems.filter(i => i.item_type === 'service').length})
                </button>
              </div>

              {/* Clear Wishlist */}
              <button
                onClick={clearWishlist}
                className="text-sm text-red-600 hover:text-red-700 hover:underline"
              >
                Clear Wishlist
              </button>
            </div>

            {/* Wishlist Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <Link href={`/marketplace/${item.item_type}s/${item.item_id}`}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="p-4">
                    {/* Category Badge */}
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded mb-2">
                      {item.category}
                    </span>

                    {/* Title */}
                    <Link href={`/marketplace/${item.item_type}s/${item.item_id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-[#FF6B2C] mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                    </Link>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Seller */}
                    <p className="text-sm text-gray-600 mb-3">
                      by{' '}
                      <Link
                        href={`/profile/${item.seller_name}`}
                        className="text-[#FF6B2C] hover:underline"
                      >
                        {item.seller_name}
                      </Link>
                    </p>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-gray-900">
                        ${item.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.item_type === 'service' ? 'Starting at' : ''}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(item)}
                        className="flex-1 px-4 py-2 bg-[#FF6B2C] text-white rounded-lg hover:bg-[#ff5516] transition-colors text-sm font-medium"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        disabled={removing === item.id}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        title="Remove from wishlist"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No items after filter */}
            {filteredItems.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500">
                  No {filter === 'product' ? 'products' : 'services'} in your wishlist
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
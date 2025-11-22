// File: page.tsx
// Path: /src/app/(protected)/wishlist/page.tsx
// Wishlist page - UPDATED with cart-style design and Add to Cart functionality

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'

export default function WishlistPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { items: wishlistItems, removeFromWishlist, clearWishlist, loading } = useWishlist()
  const { addToCart, isInCart } = useCart()
  const [removing, setRemoving] = useState<string | null>(null)
  const [movingToCart, setMovingToCart] = useState<string | null>(null)

  const handleRemoveItem = async (itemId: string) => {
    setRemoving(itemId)
    try {
      await removeFromWishlist(itemId)
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      alert('Failed to remove item from wishlist')
    } finally {
      setRemoving(null)
    }
  }

  const handleClearWishlist = async () => {
    if (!confirm('Are you sure you want to clear your wishlist?')) return

    try {
      await clearWishlist()
    } catch (error) {
      console.error('Error clearing wishlist:', error)
      alert('Failed to clear wishlist')
    }
  }

  const handleAddToCart = async (item: typeof wishlistItems[0]) => {
    setMovingToCart(item.itemId)
    try {
      // Add to cart
      addToCart({
        id: `${item.type}-${item.itemId}`,
        type: item.type,
        itemId: item.itemId,
        title: item.title,
        price: item.price,
        image_url: item.image_url,
        seller_id: item.seller_id,
        seller_name: item.seller_name,
      })

      // Remove from wishlist
      await removeFromWishlist(item.itemId)
      
      console.log(`✅ Moved ${item.title} from wishlist to cart`)
    } catch (error) {
      console.error('Error moving to cart:', error)
      alert('Failed to move item to cart')
    } finally {
      setMovingToCart(null)
    }
  }

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa' }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009ae9]"></div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ 
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
            }}
          >
            MY WISHLIST
          </h1>
          <p style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}>
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          // Empty Wishlist
          <div 
            className="rounded-xl shadow-sm p-12 text-center border"
            style={{ 
              backgroundColor: theme === 'dark' 
                ? 'rgba(26, 26, 26, 0.6)' 
                : 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(12px)',
              borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
            }}
          >
            <svg
              className="w-24 h-24 mx-auto mb-4"
              style={{ color: theme === 'dark' ? '#4a4a4a' : '#d1d5db' }}
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
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ 
                fontFamily: 'var(--font-heading)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
              }}
            >
              YOUR WISHLIST IS EMPTY
            </h2>
            <p className="mb-6" style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}>
              Save your favorite products for later
            </p>
            <Link href="/marketplace/products" className="btn btn-cta inline-block">
              Browse Products
            </Link>
          </div>
        ) : (
          // Wishlist with Items
          <div>
            {/* Clear Wishlist Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={handleClearWishlist}
                className="text-sm text-red-600 hover:text-red-700 hover:underline"
              >
                Clear Wishlist
              </button>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl shadow-sm overflow-hidden relative border transition-all duration-300 hover:shadow-lg"
                  style={{ 
                    backgroundColor: theme === 'dark' 
                      ? 'rgba(26, 26, 26, 0.6)' 
                      : 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(12px)',
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                  }}
                >
                  {/* Remove X Button - Top Right */}
                  <button
                    onClick={() => handleRemoveItem(item.itemId)}
                    disabled={removing === item.itemId}
                    className="absolute top-3 right-3 z-10 p-1 rounded-full transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(42, 42, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#3a3a3a' : '#f3f4f6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(42, 42, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)'
                    }}
                    aria-label="Remove from wishlist"
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                      fill="none"
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

                  {/* Image */}
                  <Link href={`/marketplace/products/${item.itemId}`}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div 
                        className="w-full h-48 flex items-center justify-center"
                        style={{ backgroundColor: theme === 'dark' ? '#3a3a3a' : '#e5e7eb' }}
                      >
                        <svg
                          className="w-12 h-12"
                          style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
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
                    {/* Title */}
                    <Link href={`/marketplace/products/${item.itemId}`}>
                      <h3 
                        className="text-lg font-semibold hover:text-[#009ae9] mb-2 line-clamp-2"
                        style={{ 
                          fontFamily: 'var(--font-body)',
                          color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                        }}
                      >
                        {item.title}
                      </h3>
                    </Link>

                    {/* Seller */}
                    <p 
                      className="text-sm mb-3"
                      style={{ 
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#b3b3b3' : '#666666' 
                      }}
                    >
                      by{' '}
                      <Link
                        href={`/profile/${item.seller_name}`}
                        className="text-[#009ae9] hover:underline"
                      >
                        {item.seller_name}
                      </Link>
                    </p>

                    {/* Price */}
                    <p 
                      className="text-xl font-bold mb-4"
                      style={{ 
                        fontFamily: 'var(--font-heading)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                      }}
                    >
                      ${item.price.toFixed(2)}
                    </p>

                    {/* Add to Cart Button */}
                    {isInCart(item.itemId) ? (
                      <button
                        disabled
                        className="btn btn-secondary w-full opacity-50 cursor-not-allowed"
                      >
                        Already in Cart
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={movingToCart === item.itemId}
                        className="btn btn-primary w-full"
                      >
                        {movingToCart === item.itemId ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                            Moving...
                          </span>
                        ) : (
                          'Add to Cart'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-8 text-center">
              <Link
                href="/marketplace/products"
                className="btn btn-secondary inline-block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
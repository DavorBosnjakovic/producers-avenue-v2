// File: ProductCard.tsx
// Path: /src/components/marketplace/products/ProductCard.tsx
// Product card component for carousels and grids with audio preview
// FIXED: Now properly uses CartContext API

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useState } from 'react'
import AudioPlayerModal from './AudioPlayerModal'

interface AudioTrack {
  id: string
  title: string
  duration: number // in seconds
  url: string
}

interface ProductCardProps {
  id: string
  title: string
  price: number
  image: string
  seller: {
    name: string
    avatar: string
    id: string // Added seller.id for CartContext
  }
  rating?: number
  reviewCount?: number
  isFeatured?: boolean
  hasPreview?: boolean // Indicates if product has audio previews
  previewTracks?: AudioTrack[] // Audio preview tracks
  isWishlisted?: boolean // Whether product is wishlisted
}

export default function ProductCard({
  id,
  title,
  price,
  image,
  seller,
  rating = 0,
  reviewCount = 0,
  isFeatured = false,
  hasPreview = true,
  previewTracks = [],
  isWishlisted: initialIsWishlisted = false,
}: ProductCardProps) {
  const { theme } = useTheme()
  const { addToCart, removeFromCart, isInCart: checkIsInCart, loading: cartLoading } = useCart()
  const { toggleWishlist, isInWishlist: checkIsInWishlist } = useWishlist()
  const [isHovered, setIsHovered] = useState(false)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)
  
  // Use contexts to check real-time state
  const isInCart = checkIsInCart(id)
  const isWishlisted = checkIsInWishlist(id)

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Preview clicked! Opening modal...', { id, title, tracksCount: previewTracks.length })
    setIsPlayerOpen(true)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isAddingToCart) return
    
    setIsAddingToCart(true)
    
    try {
      if (isInCart) {
        // Remove from cart - use the full cart item id format
        removeFromCart(`product-${id}`)
      } else {
        // Add to cart - provide full CartItem object
        addToCart({
          id: `product-${id}`,
          type: 'product',
          itemId: id,
          title,
          price,
          image_url: image,
          seller_id: seller.id,
          seller_name: seller.name,
        })
        
        // Auto-remove from wishlist when adding to cart
        if (isWishlisted) {
          toggleWishlist({
            type: 'product',
            itemId: id,
            title,
            price,
            image_url: image,
            seller_id: seller.id,
            seller_name: seller.name,
          })
        }
      }
    } catch (error) {
      console.error('Error toggling cart:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isTogglingWishlist) return
    
    setIsTogglingWishlist(true)
    
    try {
      await toggleWishlist({
        type: 'product',
        itemId: id,
        title,
        price,
        image_url: image,
        seller_id: seller.id,
        seller_name: seller.name,
      })
    } catch (error) {
      console.error('Error toggling wishlist:', error)
    } finally {
      setIsTogglingWishlist(false)
    }
  }

  return (
    <>
      <Link
        href={`/marketplace/products/${id}`}
        className="group flex-shrink-0 rounded-xl border transition-all duration-300 hover:shadow-lg backdrop-blur-md overflow-hidden flex flex-col w-full"
        style={{
          scrollSnapAlign: 'start',
          aspectRatio: '2/3',
          backgroundColor: theme === 'dark' 
            ? 'rgba(26, 26, 26, 0.6)' 
            : 'rgba(255, 255, 255, 0.6)',
          borderColor: isHovered ? '#009ae9' : (theme === 'dark' ? '#2a2a2a' : '#e0e0e0'),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      {/* Image - Takes about 55% of card height */}
      <div className="relative flex-shrink-0" style={{ paddingTop: '83.33%' }}>
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300 absolute inset-0"
          sizes="240px"
        />
        
        {/* Audio Preview Indicator Badge */}
        {hasPreview && (
          <div 
            className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-md"
            style={{
              backgroundColor: theme === 'dark' 
                ? 'rgba(0, 154, 233, 0.9)' 
                : 'rgba(0, 154, 233, 0.85)',
              color: 'white',
            }}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
            <span>Preview</span>
          </div>
        )}
        
        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-2 left-2 bg-[#009ae9] text-white text-xs font-bold px-2 py-1 rounded">
            FEATURED
          </div>
        )}

        {/* Like Button */}
        <button
          className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-gray-900/90 rounded-full hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-md"
          onClick={handleLike}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          disabled={isTogglingWishlist}
        >
          {isWishlisted ? (
            <svg className="w-4 h-4" fill="#009ae9" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Content - Takes remaining 45% */}
      <div className="flex flex-col flex-1 p-3">
        {/* Title */}
        <h3 
          className="text-sm font-semibold mb-2 truncate"
          style={{
            fontFamily: 'var(--font-body)',
            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
          }}
          title={title}
        >
          <span className="group-hover:text-[#009ae9] transition-colors">
            {title}
          </span>
        </h3>

        {/* Seller */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative w-5 h-5 flex-shrink-0">
            <Image
              src={seller.avatar}
              alt={seller.name}
              fill
              className="rounded-full object-cover"
              sizes="20px"
            />
          </div>
          <span 
            className="text-xs truncate"
            style={{
              fontFamily: 'var(--font-body)',
              color: theme === 'dark' ? '#b3b3b3' : '#666666',
            }}
          >
            {seller.name}
          </span>
        </div>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span 
              className="text-xs"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#b3b3b3' : '#666666',
              }}
            >
              ({reviewCount})
            </span>
          </div>
        )}

        {/* Price and Actions - Push to bottom */}
        <div className="flex items-center justify-between mt-auto">
          <span 
            className="text-xl font-bold"
            style={{
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#009ae9' : '#007acc',
            }}
          >
            ${price.toFixed(2)}
          </span>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Preview Button */}
            {hasPreview && (
              <button
                className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
                style={{
                  backgroundColor: theme === 'dark' 
                    ? 'rgba(0, 154, 233, 0.15)' 
                    : 'rgba(0, 154, 233, 0.1)',
                  color: '#009ae9',
                  border: '1px solid rgba(0, 154, 233, 0.3)',
                }}
                onClick={handlePreviewClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark'
                    ? 'rgba(0, 154, 233, 0.25)'
                    : 'rgba(0, 154, 233, 0.2)'
                  e.currentTarget.style.borderColor = 'rgba(0, 154, 233, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark'
                    ? 'rgba(0, 154, 233, 0.15)'
                    : 'rgba(0, 154, 233, 0.1)'
                  e.currentTarget.style.borderColor = 'rgba(0, 154, 233, 0.3)'
                }}
                aria-label="Preview audio"
                title="Preview audio"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </button>
            )}

            {/* Add to Cart Button */}
            <button
              className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: isInCart ? '#10b981' : '#009ae9',
                color: 'white',
              }}
              onClick={handleAddToCart}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isInCart ? '#059669' : '#0088cc'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isInCart ? '#10b981' : '#009ae9'
              }}
              aria-label={isInCart ? "Remove from cart" : "Add to cart"}
              title={isInCart ? "Remove from cart" : "Add to cart"}
              disabled={isAddingToCart}
            >
              {isInCart ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>

    {hasPreview && previewTracks.length > 0 && (
        <AudioPlayerModal
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          product={{
            id,
            title,
            image,
            price,
            seller,
          }}
          tracks={previewTracks}
      />
    )}
  </>
  )
}
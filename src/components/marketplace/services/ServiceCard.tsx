// File: ServiceCard.tsx
// Path: /src/components/marketplace/services/ServiceCard.tsx
// Service card component for carousels and grids

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { useState } from 'react'

interface ServiceCardProps {
  id: string
  title: string
  startingPrice: number
  image: string
  seller: {
    name: string
    avatar: string
  }
  rating?: number
  reviewCount?: number
  deliveryTime?: string
  isFeatured?: boolean
}

export default function ServiceCard({
  id,
  title,
  startingPrice,
  image,
  seller,
  rating = 0,
  reviewCount = 0,
  deliveryTime = '3 days',
  isFeatured = false,
}: ServiceCardProps) {
  const { theme } = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      href={`/marketplace/services/${id}`}
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
        
        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-2 left-2 bg-[#009ae9] text-white text-xs font-bold px-2 py-1 rounded">
            FEATURED
          </div>
        )}

        {/* Like Button */}
        <button
          className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-gray-900/90 rounded-full hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-md"
          onClick={(e) => {
            e.preventDefault()
            // Handle like
          }}
          aria-label="Like"
        >
          <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
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

        {/* Delivery Time - Small badge */}
        <div className="flex items-center gap-1 mb-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#009ae9' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span 
            className="text-xs"
            style={{
              fontFamily: 'var(--font-body)',
              color: theme === 'dark' ? '#b3b3b3' : '#666666',
            }}
          >
            {deliveryTime}
          </span>
        </div>

        {/* Price - Push to bottom */}
        <div className="mt-auto">
          <div 
            className="text-xs mb-1"
            style={{
              fontFamily: 'var(--font-body)',
              color: theme === 'dark' ? '#b3b3b3' : '#666666',
            }}
          >
            Starting at
          </div>
          <span 
            className="text-xl font-bold"
            style={{
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#009ae9' : '#007acc',
            }}
          >
            ${startingPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  )
}
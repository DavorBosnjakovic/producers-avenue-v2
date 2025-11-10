// File: ServiceCard.tsx
// Path: /src/components/marketplace/services/ServiceCard.tsx
// Service card component for carousels and grids

import Image from 'next/image'
import Link from 'next/link'

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
  return (
    <Link
      href={`/marketplace/services/${id}`}
      className="group flex-shrink-0 w-72 card overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-2 left-2 bg-featured text-gray-900 text-xs font-bold px-2 py-1 rounded">
            FEATURED
          </div>
        )}

        {/* Like Button */}
        <button
          className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-900/80 rounded-full hover:bg-white dark:hover:bg-gray-900 transition-colors"
          onClick={(e) => {
            e.preventDefault()
            // Handle like
          }}
          aria-label="Like"
        >
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Seller */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative w-6 h-6">
            <Image
              src={seller.avatar}
              alt={seller.name}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {seller.name}
          </span>
        </div>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
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
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({reviewCount})
            </span>
          </div>
        )}

        {/* Delivery Time & Price */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Starting at
            </div>
            <span className="text-2xl font-mono font-bold text-primary">
              ${startingPrice.toFixed(2)}
            </span>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {deliveryTime}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
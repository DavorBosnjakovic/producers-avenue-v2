// File: ProductPageClient.tsx
// Path: /src/app/marketplace/products/[id]/ProductPageClient.tsx
// Client-side wrapper for product page with audio player modal

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AudioPlayerModal from '@/components/marketplace/products/AudioPlayerModal'
import { useTheme } from '@/lib/contexts/ThemeContext'

interface AudioTrack {
  id: string
  title: string
  duration: number
  url: string
}

interface ProductPageClientProps {
  product: any
  otherProducts: any[]
  isOwner: boolean
  user: any
}

export default function ProductPageClient({ product, otherProducts, isOwner, user }: ProductPageClientProps) {
  const { theme } = useTheme()
  const [selectedImage, setSelectedImage] = useState(0)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)

  const previewTracks: AudioTrack[] = product.demo_url ? [{
    id: 'preview-1',
    title: product.title,
    duration: 30,
    url: product.demo_url
  }] : []

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(product.price)

  return (
    <>
      <div 
        className="min-h-screen"
        style={{
          backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Left Column - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div 
                className="aspect-video relative rounded-lg overflow-hidden border"
                style={{
                  backgroundColor: theme === 'dark' ? '#111111' : '#f5f5f5',
                  borderColor: theme === 'dark' ? '#222222' : '#e0e0e0',
                }}
              >
                {product.images && product.images[selectedImage] ? (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg 
                      className="w-24 h-24" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      style={{ color: theme === 'dark' ? '#333333' : '#cccccc' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Play button overlay */}
                {product.demo_url && (
                  <button
                    onClick={() => setIsPlayerOpen(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300"
                  >
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-sm"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      }}
                    >
                      <svg className="w-10 h-10 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </button>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.slice(0, 4).map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className="aspect-square relative rounded-lg overflow-hidden border-2 transition-all"
                      style={{
                        backgroundColor: theme === 'dark' ? '#111111' : '#f5f5f5',
                        borderColor: selectedImage === index ? '#ffffff' : (theme === 'dark' ? '#222222' : '#e0e0e0'),
                      }}
                    >
                      <Image
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Audio Preview Button */}
              {product.demo_url && (
                <button
                  onClick={() => setIsPlayerOpen(true)}
                  className="w-full py-4 px-6 rounded-lg transition-colors text-lg flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: theme === 'dark' ? '#ffffff' : '#ffffff',
                    color: '#000000',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 'bold',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#eeeeee' : '#eeeeee'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#ffffff' : '#ffffff'
                  }}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Preview Audio
                </button>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Title and Price */}
              <div>
                <h1 
                  className="text-4xl font-bold mb-4"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  {product.title}
                </h1>
                <div className="flex items-center gap-4 mb-6">
                  <span 
                    className="text-3xl font-bold"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    }}
                  >
                    {formattedPrice}
                  </span>
                  <span 
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                      color: theme === 'dark' ? '#888888' : '#666666',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Seller Info */}
              <Link 
                href={`/profile/${product.seller.username}`}
                className="flex items-center gap-4 p-4 rounded-lg border transition-colors"
                style={{
                  backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
                  borderColor: theme === 'dark' ? '#222222' : '#e0e0e0',
                }}
              >
                <div 
                  className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                  }}
                >
                  {product.seller.avatar_url ? (
                    <Image
                      src={product.seller.avatar_url}
                      alt={product.seller.display_name || product.seller.username}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span 
                        className="text-xl"
                        style={{
                          color: theme === 'dark' ? '#666666' : '#999999',
                          fontFamily: 'var(--font-heading)',
                        }}
                      >
                        {(product.seller.display_name || product.seller.username).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p 
                    className="font-medium"
                    style={{
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {product.seller.display_name || product.seller.username}
                  </p>
                  <p 
                    className="text-sm"
                    style={{
                      color: theme === 'dark' ? '#888888' : '#666666',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    @{product.seller.username}
                  </p>
                </div>
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ color: theme === 'dark' ? '#666666' : '#999999' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Technical Details */}
              <div 
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
                  borderColor: theme === 'dark' ? '#222222' : '#e0e0e0',
                }}
              >
                <h3 
                  className="text-lg font-bold mb-4"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span 
                      style={{
                        color: theme === 'dark' ? '#888888' : '#666666',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      File Type
                    </span>
                    <span 
                      className="font-medium"
                      style={{
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {product.file_type}
                    </span>
                  </div>
                  {product.bpm && (
                    <div className="flex justify-between">
                      <span 
                        style={{
                          color: theme === 'dark' ? '#888888' : '#666666',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        BPM
                      </span>
                      <span 
                        className="font-medium"
                        style={{
                          color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {product.bpm}
                      </span>
                    </div>
                  )}
                  {product.key && (
                    <div className="flex justify-between">
                      <span 
                        style={{
                          color: theme === 'dark' ? '#888888' : '#666666',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        Key
                      </span>
                      <span 
                        className="font-medium"
                        style={{
                          color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {product.key}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span 
                      style={{
                        color: theme === 'dark' ? '#888888' : '#666666',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      Downloads
                    </span>
                    <span 
                      className="font-medium"
                      style={{
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {product.downloads || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {isOwner ? (
                  <div className="space-y-3">
                    <Link
                      href={`/products/${product.product_id}/edit`}
                      className="w-full block text-center px-6 py-4 rounded-lg transition-colors border font-bold"
                      style={{
                        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                        borderColor: theme === 'dark' ? '#333333' : '#d0d0d0',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      Edit Product
                    </Link>
                    <button
                      className="w-full px-6 py-4 rounded-lg transition-colors border font-bold"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderColor: 'rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      Delete Product
                    </button>
                  </div>
                ) : user ? (
                  <div className="space-y-3">
                    <button 
                      className="w-full px-6 py-4 rounded-lg transition-colors font-bold text-lg"
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      Purchase Now
                    </button>
                    <button 
                      className="w-full px-6 py-4 rounded-lg transition-colors border font-bold"
                      style={{
                        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                        borderColor: theme === 'dark' ? '#333333' : '#d0d0d0',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      Add to Cart
                    </button>
                    <Link
                      href={`/messages?user=${product.seller.username}`}
                      className="w-full block text-center px-6 py-4 rounded-lg transition-colors border font-bold"
                      style={{
                        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                        borderColor: theme === 'dark' ? '#333333' : '#d0d0d0',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      Contact Seller
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="w-full block text-center px-6 py-4 rounded-lg transition-colors font-bold text-lg"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    Login to Purchase
                  </Link>
                )}
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                        color: theme === 'dark' ? '#cccccc' : '#666666',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div 
            className="rounded-lg border p-8 mb-12"
            style={{
              backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
              borderColor: theme === 'dark' ? '#222222' : '#e0e0e0',
            }}
          >
            <h2 
              className="text-2xl font-bold mb-4"
              style={{
                fontFamily: 'var(--font-heading)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
            >
              Description
            </h2>
            <p 
              className="whitespace-pre-wrap leading-relaxed"
              style={{
                color: theme === 'dark' ? '#cccccc' : '#666666',
                fontFamily: 'var(--font-body)',
              }}
            >
              {product.description}
            </p>
          </div>

          {/* More from Seller */}
          {otherProducts && otherProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  More from {product.seller.display_name || product.seller.username}
                </h2>
                <Link
                  href={`/profile/${product.seller.username}`}
                  className="transition-colors"
                  style={{
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  View all →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {otherProducts.map((item) => (
                  <Link
                    key={item.product_id}
                    href={`/marketplace/products/${item.product_id}`}
                    className="rounded-lg overflow-hidden border transition-colors group"
                    style={{
                      backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
                      borderColor: theme === 'dark' ? '#222222' : '#e0e0e0',
                    }}
                  >
                    <div 
                      className="aspect-video relative"
                      style={{
                        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                      }}
                    >
                      {item.images && item.images[0] && (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 
                        className="font-bold mb-2 line-clamp-1"
                        style={{
                          fontFamily: 'var(--font-heading)',
                          color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                        }}
                      >
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span 
                          className="text-xl font-bold"
                          style={{
                            fontFamily: 'var(--font-heading)',
                            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                          }}
                        >
                          ${item.price}
                        </span>
                        <span 
                          className="text-sm"
                          style={{
                            color: theme === 'dark' ? '#888888' : '#666666',
                          }}
                        >
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audio Player Modal */}
      {product.demo_url && (
        <AudioPlayerModal
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          product={{
            id: product.product_id,
            title: product.title,
            image: product.images?.[0] || '/placeholder.jpg',
            price: product.price,
            seller: {
              name: product.seller.display_name || product.seller.username,
              avatar: product.seller.avatar_url || '/default-avatar.jpg',
            },
          }}
          tracks={previewTracks}
        />
      )}
    </>
  )
}
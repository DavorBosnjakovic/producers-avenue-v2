// File: page.tsx
// Path: /src/app/marketplace/products/[id]/page.tsx
// Product detail page

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const supabase = createClient()

  // Get product
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      seller:user_profiles!products_seller_id_fkey(*)
    `)
    .eq('product_id', params.id)
    .single()

  if (error || !product) {
    notFound()
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === product.seller_id

  // Get seller's other products
  const { data: otherProducts } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', product.seller_id)
    .eq('status', 'active')
    .neq('product_id', product.product_id)
    .order('created_at', { ascending: false })
    .limit(4)

  // Format price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(product.price)

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-video relative bg-[#111111] rounded-lg overflow-hidden border border-[#222222]">
              {product.images && product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(1, 5).map((image: string, index: number) => (
                  <div key={index} className="aspect-square relative bg-[#111111] rounded-lg overflow-hidden border border-[#222222] cursor-pointer hover:border-[#333333] transition-colors">
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Demo Player */}
            {product.demo_url && (
              <div className="bg-[#111111] border border-[#222222] rounded-lg p-6">
                <h3 className="text-lg font-favorit font-bold text-white mb-4">
                  Preview
                </h3>
                <audio controls className="w-full">
                  <source src={product.demo_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-4xl font-favorit font-bold text-white mb-4">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-favorit font-bold text-white">
                  {formattedPrice}
                </span>
                <span className="px-3 py-1 bg-[#1a1a1a] text-[#888888] rounded-full text-sm font-inter">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Seller Info */}
            <Link 
              href={`/profile/${product.seller.username}`}
              className="flex items-center gap-4 p-4 bg-[#111111] border border-[#222222] rounded-lg hover:border-[#333333] transition-colors"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                {product.seller.avatar_url ? (
                  <Image
                    src={product.seller.avatar_url}
                    alt={product.seller.display_name || product.seller.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xl text-[#666666] font-favorit">
                      {(product.seller.display_name || product.seller.username).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-favorit font-medium">
                  {product.seller.display_name || product.seller.username}
                </p>
                <p className="text-[#888888] text-sm font-inter">
                  @{product.seller.username}
                </p>
              </div>
              <svg className="w-5 h-5 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Technical Details */}
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-6">
              <h3 className="text-lg font-favorit font-bold text-white mb-4">
                Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#888888] font-inter">File Type</span>
                  <span className="text-white font-inter font-medium">{product.file_type}</span>
                </div>
                {product.bpm && (
                  <div className="flex justify-between">
                    <span className="text-[#888888] font-inter">BPM</span>
                    <span className="text-white font-inter font-medium">{product.bpm}</span>
                  </div>
                )}
                {product.key && (
                  <div className="flex justify-between">
                    <span className="text-[#888888] font-inter">Key</span>
                    <span className="text-white font-inter font-medium">{product.key}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#888888] font-inter">Downloads</span>
                  <span className="text-white font-inter font-medium">{product.downloads || 0}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isOwner ? (
                <div className="space-y-3">
                  <Link
                    href={`/products/${product.product_id}/edit`}
                    className="w-full block text-center px-6 py-4 bg-[#1a1a1a] hover:bg-[#222222] text-white rounded-lg transition-colors border border-[#333333] font-favorit font-bold"
                  >
                    Edit Product
                  </Link>
                  <button
                    className="w-full px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20 font-favorit font-bold"
                  >
                    Delete Product
                  </button>
                </div>
              ) : user ? (
                <div className="space-y-3">
                  <button className="w-full px-6 py-4 bg-white hover:bg-[#eeeeee] text-black rounded-lg transition-colors font-favorit font-bold text-lg">
                    Purchase Now
                  </button>
                  <button className="w-full px-6 py-4 bg-[#1a1a1a] hover:bg-[#222222] text-white rounded-lg transition-colors border border-[#333333] font-favorit font-bold">
                    Add to Cart
                  </button>
                  <Link
                    href={`/messages?user=${product.seller.username}`}
                    className="w-full block text-center px-6 py-4 bg-[#1a1a1a] hover:bg-[#222222] text-white rounded-lg transition-colors border border-[#333333] font-favorit font-bold"
                  >
                    Contact Seller
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="w-full block text-center px-6 py-4 bg-white hover:bg-[#eeeeee] text-black rounded-lg transition-colors font-favorit font-bold text-lg"
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
                    className="px-3 py-1 bg-[#1a1a1a] text-[#cccccc] rounded-full text-sm font-inter"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-[#111111] border border-[#222222] rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-favorit font-bold text-white mb-4">
            Description
          </h2>
          <p className="text-[#cccccc] font-inter whitespace-pre-wrap leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* More from Seller */}
        {otherProducts && otherProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-favorit font-bold text-white">
                More from {product.seller.display_name || product.seller.username}
              </h2>
              <Link
                href={`/profile/${product.seller.username}`}
                className="text-white hover:text-[#cccccc] transition-colors font-inter"
              >
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {otherProducts.map((item) => (
                <Link
                  key={item.product_id}
                  href={`/marketplace/products/${item.product_id}`}
                  className="bg-[#111111] border border-[#222222] rounded-lg overflow-hidden hover:border-[#333333] transition-colors group"
                >
                  <div className="aspect-video relative bg-[#1a1a1a]">
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
                    <h3 className="font-favorit font-bold text-white mb-2 line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-favorit font-bold text-white">
                        ${item.price}
                      </span>
                      <span className="text-sm text-[#888888]">
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
  )
}
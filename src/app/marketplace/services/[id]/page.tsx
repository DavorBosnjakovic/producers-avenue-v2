// File: page.tsx
// Path: /src/app/marketplace/services/[id]/page.tsx
// Service detail page

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface ServicePageProps {
  params: {
    id: string
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const supabase = createClient()

  // Get service
  const { data: service, error } = await supabase
    .from('services')
    .select(`
      *,
      provider:user_profiles!services_provider_id_fkey(*)
    `)
    .eq('service_id', params.id)
    .single()

  if (error || !service) {
    notFound()
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === service.provider_id

  // Get provider's other services
  const { data: otherServices } = await supabase
    .from('services')
    .select('*')
    .eq('provider_id', service.provider_id)
    .eq('status', 'active')
    .neq('service_id', service.service_id)
    .order('created_at', { ascending: false })
    .limit(4)

  // Format price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(service.price)

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Images & Portfolio */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-video relative bg-[#111111] rounded-lg overflow-hidden border border-[#222222]">
              {service.images && service.images[0] ? (
                <Image
                  src={service.images[0]}
                  alt={service.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {service.images && service.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {service.images.slice(1, 5).map((image: string, index: number) => (
                  <div key={index} className="aspect-square relative bg-[#111111] rounded-lg overflow-hidden border border-[#222222] cursor-pointer hover:border-[#333333] transition-colors">
                    <Image
                      src={image}
                      alt={`${service.title} ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Portfolio Samples */}
            {service.portfolio_urls && service.portfolio_urls.length > 0 && (
              <div className="bg-[#111111] border border-[#222222] rounded-lg p-6">
                <h3 className="text-lg font-favorit font-bold text-white mb-4">
                  Portfolio Samples
                </h3>
                <div className="space-y-3">
                  {service.portfolio_urls.map((url: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg border border-[#333333]">
                      <svg className="w-5 h-5 text-[#888888] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      <audio controls className="flex-1 h-8">
                        <source src={url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-4xl font-favorit font-bold text-white mb-4">
                {service.title}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <p className="text-sm text-[#888888] font-inter mb-1">Starting at</p>
                  <span className="text-3xl font-favorit font-bold text-white">
                    {formattedPrice}
                  </span>
                </div>
                <span className="px-3 py-1 bg-[#1a1a1a] text-[#888888] rounded-full text-sm font-inter">
                  {service.category}
                </span>
              </div>
            </div>

            {/* Provider Info */}
            <Link 
              href={`/profile/${service.provider.username}`}
              className="flex items-center gap-4 p-4 bg-[#111111] border border-[#222222] rounded-lg hover:border-[#333333] transition-colors"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                {service.provider.avatar_url ? (
                  <Image
                    src={service.provider.avatar_url}
                    alt={service.provider.display_name || service.provider.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xl text-[#666666] font-favorit">
                      {(service.provider.display_name || service.provider.username).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-favorit font-medium">
                  {service.provider.display_name || service.provider.username}
                </p>
                <p className="text-[#888888] text-sm font-inter">
                  @{service.provider.username}
                </p>
              </div>
              <svg className="w-5 h-5 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Service Details */}
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-6">
              <h3 className="text-lg font-favorit font-bold text-white mb-4">
                What's Included
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#cccccc] font-inter">Delivery in {service.delivery_time}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#cccccc] font-inter">
                    {service.revisions === 0 ? 'No revisions' : `${service.revisions} revision${service.revisions > 1 ? 's' : ''} included`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#cccccc] font-inter">Professional quality</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#cccccc] font-inter">Direct communication</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isOwner ? (
                <div className="space-y-3">
                  <Link
                    href={`/services/${service.service_id}/edit`}
                    className="w-full block text-center px-6 py-4 bg-[#1a1a1a] hover:bg-[#222222] text-white rounded-lg transition-colors border border-[#333333] font-favorit font-bold"
                  >
                    Edit Service
                  </Link>
                  <button
                    className="w-full px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20 font-favorit font-bold"
                  >
                    Delete Service
                  </button>
                </div>
              ) : user ? (
                <div className="space-y-3">
                  <Link
                    href={`/orders/new?service=${service.service_id}`}
                    className="w-full block text-center px-6 py-4 bg-white hover:bg-[#eeeeee] text-black rounded-lg transition-colors font-favorit font-bold text-lg"
                  >
                    Order Now
                  </Link>
                  <Link
                    href={`/messages?user=${service.provider.username}`}
                    className="w-full block text-center px-6 py-4 bg-[#1a1a1a] hover:bg-[#222222] text-white rounded-lg transition-colors border border-[#333333] font-favorit font-bold"
                  >
                    Contact Provider
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="w-full block text-center px-6 py-4 bg-white hover:bg-[#eeeeee] text-black rounded-lg transition-colors font-favorit font-bold text-lg"
                >
                  Login to Order
                </Link>
              )}
            </div>

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag: string, index: number) => (
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
            About This Service
          </h2>
          <p className="text-[#cccccc] font-inter whitespace-pre-wrap leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Provider Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 text-center">
            <p className="text-3xl font-favorit font-bold text-white mb-2">
              {service.provider.rating || '5.0'}
            </p>
            <p className="text-[#888888] text-sm font-inter">Rating</p>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 text-center">
            <p className="text-3xl font-favorit font-bold text-white mb-2">
              {service.orders_completed || 0}
            </p>
            <p className="text-[#888888] text-sm font-inter">Orders Completed</p>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 text-center">
            <p className="text-3xl font-favorit font-bold text-white mb-2">
              {service.delivery_time}
            </p>
            <p className="text-[#888888] text-sm font-inter">Avg. Delivery</p>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 text-center">
            <p className="text-3xl font-favorit font-bold text-white mb-2">
              100%
            </p>
            <p className="text-[#888888] text-sm font-inter">Response Rate</p>
          </div>
        </div>

        {/* More from Provider */}
        {otherServices && otherServices.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-favorit font-bold text-white">
                More from {service.provider.display_name || service.provider.username}
              </h2>
              <Link
                href={`/profile/${service.provider.username}`}
                className="text-white hover:text-[#cccccc] transition-colors font-inter"
              >
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {otherServices.map((item) => (
                <Link
                  key={item.service_id}
                  href={`/marketplace/services/${item.service_id}`}
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
                      <div>
                        <p className="text-xs text-[#888888] font-inter">Starting at</p>
                        <span className="text-xl font-favorit font-bold text-white">
                          ${item.price}
                        </span>
                      </div>
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
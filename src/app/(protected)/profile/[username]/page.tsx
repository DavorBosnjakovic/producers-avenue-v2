// File: page.tsx
// Path: /src/app/(protected)/profile/[username]/page.tsx
// User profile view page

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get profile by username
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Check if this is the current user's profile
  const isOwnProfile = user.id === profile.user_id

  // Get user's products count
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', profile.user_id)
    .eq('status', 'active')

  // Get user's services count
  const { count: servicesCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('provider_id', profile.user_id)
    .eq('status', 'active')

  // Get user's products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', profile.user_id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  // Get user's services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('provider_id', profile.user_id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-[#111111] border border-[#222222] rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-[#1a1a1a] border-2 border-[#333333]">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name || profile.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl text-[#666666] font-favorit">
                      {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-favorit font-bold text-white mb-2">
                    {profile.display_name || profile.username}
                  </h1>
                  <p className="text-[#888888] mb-4">@{profile.username}</p>
                </div>

                {isOwnProfile && (
                  <Link
                    href="/settings?tab=profile"
                    className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222222] text-white rounded-lg transition-colors border border-[#333333]"
                  >
                    Edit Profile
                  </Link>
                )}
              </div>

              {profile.bio && (
                <p className="text-[#cccccc] mb-4 font-inter">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex gap-6 mb-4">
                <div>
                  <p className="text-2xl font-favorit font-bold text-white">{productsCount || 0}</p>
                  <p className="text-sm text-[#888888]">Products</p>
                </div>
                <div>
                  <p className="text-2xl font-favorit font-bold text-white">{servicesCount || 0}</p>
                  <p className="text-sm text-[#888888]">Services</p>
                </div>
                <div>
                  <p className="text-2xl font-favorit font-bold text-white">{profile.rating || '5.0'}</p>
                  <p className="text-sm text-[#888888]">Rating</p>
                </div>
              </div>

              {/* Location and Website */}
              <div className="flex flex-wrap gap-4 text-sm text-[#888888]">
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-[#222222]">
            <div className="flex gap-8">
              <button className="pb-4 border-b-2 border-white text-white font-favorit">
                Products
              </button>
              <button className="pb-4 border-b-2 border-transparent text-[#888888] hover:text-white font-favorit transition-colors">
                Services
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link
                key={product.product_id}
                href={`/marketplace/products/${product.product_id}`}
                className="bg-[#111111] border border-[#222222] rounded-lg overflow-hidden hover:border-[#333333] transition-colors group"
              >
                <div className="aspect-video relative bg-[#1a1a1a]">
                  {product.images && product.images[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-favorit font-bold text-white mb-2 line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-[#888888] text-sm mb-3 line-clamp-2 font-inter">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-favorit font-bold text-white">
                      ${product.price}
                    </span>
                    <span className="text-sm text-[#888888]">
                      {product.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#888888] font-inter">No products yet</p>
          </div>
        )}

        {/* View All Link */}
        {products && products.length >= 6 && (
          <div className="text-center mt-8">
            <Link
              href={`/profile/${params.username}/products`}
              className="text-white hover:text-[#cccccc] transition-colors font-inter"
            >
              View all products →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
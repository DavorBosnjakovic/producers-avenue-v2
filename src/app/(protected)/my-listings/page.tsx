// File: page.tsx
// Path: /src/app/(protected)/my-listings/page.tsx
// User's product and service listings management page

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function MyListingsPage() {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user's products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  // Get user's services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('provider_id', user.id)
    .order('created_at', { ascending: false })

  // Count by status
  const activeProducts = products?.filter(p => p.status === 'active').length || 0
  const draftProducts = products?.filter(p => p.status === 'draft').length || 0
  const inactiveProducts = products?.filter(p => p.status === 'inactive').length || 0

  const activeServices = services?.filter(s => s.status === 'active').length || 0
  const draftServices = services?.filter(s => s.status === 'draft').length || 0
  const inactiveServices = services?.filter(s => s.status === 'inactive').length || 0

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-favorit font-bold text-white mb-2">
            My Listings
          </h1>
          <p className="text-[#888888] font-inter">
            Manage your products and services
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-6">
            <p className="text-[#888888] text-sm mb-2 font-inter">Total Listings</p>
            <p className="text-3xl font-favorit font-bold text-white">
              {(products?.length || 0) + (services?.length || 0)}
            </p>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-6">
            <p className="text-[#888888] text-sm mb-2 font-inter">Active</p>
            <p className="text-3xl font-favorit font-bold text-green-500">
              {activeProducts + activeServices}
            </p>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-6">
            <p className="text-[#888888] text-sm mb-2 font-inter">Drafts</p>
            <p className="text-3xl font-favorit font-bold text-yellow-500">
              {draftProducts + draftServices}
            </p>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-6">
            <p className="text-[#888888] text-sm mb-2 font-inter">Inactive</p>
            <p className="text-3xl font-favorit font-bold text-[#666666]">
              {inactiveProducts + inactiveServices}
            </p>
          </div>
        </div>

        {/* Create New Buttons */}
        <div className="flex gap-4 mb-8">
          <Link
            href="/products/new"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-[#eeeeee] text-black rounded-lg transition-colors font-favorit font-bold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            List New Product
          </Link>
          <Link
            href="/services/new"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#1a1a1a] hover:bg-[#222222] text-white rounded-lg transition-colors border border-[#333333] font-favorit font-bold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Offer New Service
          </Link>
        </div>

        {/* Products Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-favorit font-bold text-white">
              Products ({products?.length || 0})
            </h2>
          </div>

          {products && products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.product_id}
                  className="bg-[#111111] border border-[#222222] rounded-lg p-6 hover:border-[#333333] transition-colors"
                >
                  <div className="flex gap-6">
                    {/* Thumbnail */}
                    <Link
                      href={`/marketplace/products/${product.product_id}`}
                      className="flex-shrink-0"
                    >
                      <div className="w-40 h-24 relative bg-[#1a1a1a] rounded-lg overflow-hidden">
                        {product.images && product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Link
                            href={`/marketplace/products/${product.product_id}`}
                            className="text-xl font-favorit font-bold text-white hover:text-[#cccccc] transition-colors"
                          >
                            {product.title}
                          </Link>
                          <p className="text-[#888888] text-sm mt-1 font-inter line-clamp-2">
                            {product.description}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-inter ${
                            product.status === 'active'
                              ? 'bg-green-500/10 text-green-500'
                              : product.status === 'draft'
                              ? 'bg-yellow-500/10 text-yellow-500'
                              : 'bg-[#1a1a1a] text-[#666666]'
                          }`}
                        >
                          {product.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-[#888888] mb-4 font-inter">
                        <span>${product.price}</span>
                        <span>{product.category}</span>
                        <span>{product.downloads || 0} downloads</span>
                        <span>
                          Listed {new Date(product.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Link
                          href={`/marketplace/products/${product.product_id}`}
                          className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222222] text-white rounded-lg transition-colors text-sm font-inter"
                        >
                          View
                        </Link>
                        <Link
                          href={`/products/${product.product_id}/edit`}
                          className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222222] text-white rounded-lg transition-colors text-sm font-inter"
                        >
                          Edit
                        </Link>
                        <button className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222222] text-white rounded-lg transition-colors text-sm font-inter">
                          {product.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors text-sm font-inter">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#111111] border border-[#222222] rounded-lg">
              <svg className="mx-auto h-16 w-16 text-[#333333] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-favorit font-bold text-white mb-2">
                No products yet
              </h3>
              <p className="text-[#888888] mb-4 font-inter">
                Start by listing your first product
              </p>
              <Link
                href="/products/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#eeeeee] text-black rounded-lg transition-colors font-favorit font-bold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                List Your First Product
              </Link>
            </div>
          )}
        </div>

        {/* Services Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-favorit font-bold text-white">
              Services ({services?.length || 0})
            </h2>
          </div>

          {services && services.length > 0 ? (
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.service_id}
                  className="bg-[#111111] border border-[#222222] rounded-lg p-6 hover:border-[#333333] transition-colors"
                >
                  <div className="flex gap-6">
                    {/* Thumbnail */}
                    <Link
                      href={`/marketplace/services/${service.service_id}`}
                      className="flex-shrink-0"
                    >
                      <div className="w-40 h-24 relative bg-[#1a1a1a] rounded-lg overflow-hidden">
                        {service.images && service.images[0] ? (
                          <Image
                            src={service.images[0]}
                            alt={service.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Link
                            href={`/marketplace/services/${service.service_id}`}
                            className="text-xl font-favorit font-bold text-white hover:text-[#cccccc] transition-colors"
                          >
                            {service.title}
                          </Link>
                          <p className="text-[#888888] text-sm mt-1 font-inter line-clamp-2">
                            {service.description}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-inter ${
                            service.status === 'active'
                              ? 'bg-green-500/10 text-green-500'
                              : service.status === 'draft'
                              ? 'bg-yellow-500/10 text-yellow-500'
                              : 'bg-[#1a1a1a] text-[#666666]'
                          }`}
                        >
                          {service.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-[#888888] mb-4 font-inter">
                        <span>Starting at ${service.price}</span>
                        <span>{service.category}</span>
                        <span>{service.orders_completed || 0} orders</span>
                        <span>
                          Listed {new Date(service.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Link
                          href={`/marketplace/services/${service.service_id}`}
                          className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222222] text-white rounded-lg transition-colors text-sm font-inter"
                        >
                          View
                        </Link>
                        <Link
                          href={`/services/${service.service_id}/edit`}
                          className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222222] text-white rounded-lg transition-colors text-sm font-inter"
                        >
                          Edit
                        </Link>
                        <button className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222222] text-white rounded-lg transition-colors text-sm font-inter">
                          {service.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors text-sm font-inter">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#111111] border border-[#222222] rounded-lg">
              <svg className="mx-auto h-16 w-16 text-[#333333] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-favorit font-bold text-white mb-2">
                No services yet
              </h3>
              <p className="text-[#888888] mb-4 font-inter">
                Start by offering your first service
              </p>
              <Link
                href="/services/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#eeeeee] text-black rounded-lg transition-colors font-favorit font-bold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Offer Your First Service
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
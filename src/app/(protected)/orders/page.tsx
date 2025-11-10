// File: page.tsx
// Path: /src/app/(protected)/orders/page.tsx
// Orders page - view purchase and sales history

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Order {
  id: string
  order_number: string
  type: 'purchase' | 'sale'
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  total_amount: number
  created_at: string
  product_name: string
  seller_name?: string
  buyer_name?: string
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'purchases' | 'sales'>('purchases')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [activeTab])

  const loadOrders = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // This is a placeholder - implement based on your schema
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          product:products(name),
          seller:user_profiles!seller_id(display_name),
          buyer:user_profiles!buyer_id(display_name)
        `)
        .eq(activeTab === 'purchases' ? 'buyer_id' : 'seller_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setOrders(data || [])
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
      case 'processing':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your purchases and sales
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-800">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('purchases')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'purchases'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                My Purchases
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'sales'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                My Sales
              </button>
            </nav>
          </div>

          {/* Orders List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No {activeTab === 'purchases' ? 'purchases' : 'sales'} yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {activeTab === 'purchases' 
                    ? 'Start shopping in the marketplace to see your orders here'
                    : 'List your products or services to start selling'
                  }
                </p>
                <Link 
                  href="/marketplace" 
                  className="btn-primary inline-block px-6 py-3"
                >
                  Go to Marketplace
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-primary dark:hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {order.product_name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Order #{order.order_number}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activeTab === 'purchases' 
                            ? `Seller: ${order.seller_name}`
                            : `Buyer: ${order.buyer_name}`
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          ${order.total_amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-sm font-medium text-primary hover:text-primary-hover"
                      >
                        View Details
                      </Link>
                      {order.status === 'completed' && activeTab === 'purchases' && (
                        <button className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary">
                          Leave Review
                        </button>
                      )}
                      {order.status === 'pending' && (
                        <button className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                          Cancel Order
                        </button>
                      )}
                      <button className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary ml-auto">
                        Download Invoice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total {activeTab === 'purchases' ? 'Spent' : 'Earned'}
                </p>
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${orders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completed Orders
                </p>
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {orders.filter(o => o.status === 'completed').length}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Orders
                </p>
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
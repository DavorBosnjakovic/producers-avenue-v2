// File: page.tsx
// Path: /src/app/(protected)/dashboard/page.tsx
// User dashboard analytics page

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface DashboardStats {
  totalSales: number
  totalRevenue: number
  totalProducts: number
  totalServices: number
  pendingOrders: number
  completedOrders: number
  totalViews: number
  conversionRate: number
}

interface RecentOrder {
  id: string
  product_title: string
  service_title: string
  amount: number
  status: string
  created_at: string
  buyer_name: string
}

interface TopItem {
  id: string
  title: string
  type: 'product' | 'service'
  sales: number
  revenue: number
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalServices: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalViews: 0,
    conversionRate: 0,
  })

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topItems, setTopItems] = useState<TopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'all'>('30days')

  useEffect(() => {
    loadDashboardData()
  }, [timeRange])

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Calculate date range
      const now = new Date()
      let startDate: Date | null = null
      if (timeRange === '7days') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else if (timeRange === '30days') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }

      // Load orders
      let ordersQuery = supabase
        .from('orders')
        .select(`
          *,
          buyer:user_profiles!orders_buyer_id_fkey(username, display_name)
        `)
        .eq('seller_id', user.id)

      if (startDate) {
        ordersQuery = ordersQuery.gte('created_at', startDate.toISOString())
      }

      const { data: orders } = await ordersQuery

      // Load products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .eq('status', 'active')

      // Load services count
      const { count: servicesCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .eq('status', 'active')

      // Calculate stats
      const totalSales = orders?.length || 0
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0
      const pendingOrders = orders?.filter((o) => o.status === 'pending').length || 0
      const completedOrders = orders?.filter((o) => o.status === 'completed').length || 0

      // Mock views and conversion rate (would come from analytics table in production)
      const totalViews = totalSales * 15 // Mock: assume 15 views per sale
      const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0

      setStats({
        totalSales,
        totalRevenue,
        totalProducts: productsCount || 0,
        totalServices: servicesCount || 0,
        pendingOrders,
        completedOrders,
        totalViews,
        conversionRate,
      })

      // Recent orders
      const recentOrdersData = orders
        ?.slice(0, 5)
        .map((order) => ({
          id: order.id,
          product_title: order.product_title || '',
          service_title: order.service_title || '',
          amount: order.amount,
          status: order.status,
          created_at: order.created_at,
          buyer_name: order.buyer?.display_name || order.buyer?.username || 'Unknown',
        })) || []

      setRecentOrders(recentOrdersData)

      // Top selling items (mock data - would need aggregation in production)
      // In production, you'd aggregate order data by product/service
      const topItemsData: TopItem[] = []
      setTopItems(topItemsData)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B2C]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Track your sales and performance</p>
          </div>

          {/* Time Range Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === '7days'
                  ? 'bg-[#FF6B2C] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === '30days'
                  ? 'bg-[#FF6B2C] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === 'all'
                  ? 'bg-[#FF6B2C] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-sm text-gray-500 mt-1">From {stats.totalSales} sales</p>
          </div>

          {/* Total Sales */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Sales</h3>
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalSales}</p>
            <p className="text-sm text-gray-500 mt-1">{stats.completedOrders} completed</p>
          </div>

          {/* Listings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Listings</h3>
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalProducts + stats.totalServices}</p>
            <p className="text-sm text-gray-500 mt-1">{stats.totalProducts} products, {stats.totalServices} services</p>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Conversion Rate</h3>
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.conversionRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-500 mt-1">{stats.totalViews} total views</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                <Link
                  href="/orders"
                  className="text-sm text-[#FF6B2C] hover:underline"
                >
                  View all
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <p className="text-gray-500">No orders yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Item</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Buyer</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {order.product_title || order.service_title}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {order.buyer_name}
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                            {formatCurrency(order.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(order.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/products/new"
                  className="block w-full px-4 py-3 bg-[#FF6B2C] text-white rounded-lg hover:bg-[#ff5516] transition-colors text-center font-medium"
                >
                  + Add Product
                </Link>
                <Link
                  href="/services/new"
                  className="block w-full px-4 py-3 bg-[#FF6B2C] text-white rounded-lg hover:bg-[#ff5516] transition-colors text-center font-medium"
                >
                  + Add Service
                </Link>
                <Link
                  href="/my-listings"
                  className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
                >
                  Manage Listings
                </Link>
                <Link
                  href="/orders"
                  className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
                >
                  View Orders
                </Link>
              </div>
            </div>

            {/* Pending Orders Alert */}
            {stats.pendingOrders > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                      Pending Orders
                    </h3>
                    <p className="text-sm text-yellow-800">
                      You have {stats.pendingOrders} pending order{stats.pendingOrders > 1 ? 's' : ''} that need attention.
                    </p>
                    <Link
                      href="/orders?filter=pending"
                      className="text-sm text-yellow-900 font-medium hover:underline mt-2 inline-block"
                    >
                      View pending orders →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
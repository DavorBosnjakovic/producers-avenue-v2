// File: page.tsx
// Path: /src/app/(protected)/cart/page.tsx
// Shopping cart page

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface CartItem {
  id: string
  item_id: string
  item_type: 'product' | 'service'
  title: string
  price: number
  image_url: string | null
  seller_id: string
  seller_name: string
}

export default function CartPage() {
  const router = useRouter()
  const supabase = createClient()

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: cart } = await supabase
        .from('cart')
        .select(`
          *,
          product:products(title, price, image_url, seller_id),
          service:services(title, price_from, image_url, seller_id),
          seller:user_profiles!cart_seller_id_fkey(username, display_name)
        `)
        .eq('user_id', user.id)

      const formattedItems: CartItem[] = (cart || []).map((item) => {
        const isProduct = item.item_type === 'product'
        const itemData = isProduct ? item.product : item.service
        
        return {
          id: item.id,
          item_id: item.item_id,
          item_type: item.item_type,
          title: itemData?.title || 'Unknown Item',
          price: isProduct ? itemData?.price : itemData?.price_from || 0,
          image_url: itemData?.image_url || null,
          seller_id: item.seller_id,
          seller_name: item.seller?.display_name || item.seller?.username || 'Unknown Seller',
        }
      })

      setCartItems(formattedItems)
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (cartItemId: string) => {
    setRemoving(cartItemId)
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartItemId)

      if (error) throw error

      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId))
    } catch (error) {
      console.error('Error removing from cart:', error)
      alert('Failed to remove item from cart')
    } finally {
      setRemoving(null)
    }
  }

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      setCartItems([])
    } catch (error) {
      console.error('Error clearing cart:', error)
      alert('Failed to clear cart')
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price, 0)
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    router.push('/checkout')
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {cartItems.length === 0 ? (
          // Empty Cart
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="w-24 h-24 text-gray-300 mx-auto mb-4"
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Browse our marketplace and add items to your cart
            </p>
            <Link
              href="/marketplace/products"
              className="inline-block px-6 py-3 bg-[#FF6B2C] text-white rounded-lg hover:bg-[#ff5516] transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          // Cart with Items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Clear Cart Button */}
              <div className="flex justify-end">
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:text-red-700 hover:underline"
                >
                  Clear Cart
                </button>
              </div>

              {/* Items List */}
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4"
                >
                  {/* Image */}
                  <div className="flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <Link
                      href={`/marketplace/${item.item_type}s/${item.item_id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-[#FF6B2C] mb-1 block"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-gray-600 mb-2">
                      by{' '}
                      <Link
                        href={`/profile/${item.seller_name}`}
                        className="text-[#FF6B2C] hover:underline"
                      >
                        {item.seller_name}
                      </Link>
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {item.item_type === 'product' ? 'Product' : 'Service'}
                      </span>
                    </div>
                  </div>

                  {/* Price and Remove */}
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-xl font-bold text-gray-900">
                      ${item.price.toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      disabled={removing === item.id}
                      className="text-sm text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
                    >
                      {removing === item.id ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Service Fee</span>
                    <span>${(calculateTotal() * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>${(calculateTotal() * 1.05).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-[#FF6B2C] text-white rounded-lg hover:bg-[#ff5516] transition-colors font-medium mb-3"
                >
                  Proceed to Checkout
                </button>

                <Link
                  href="/marketplace/products"
                  className="block w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  Continue Shopping
                </Link>

                {/* Security Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <svg
                      className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Secure Checkout</p>
                      <p>Your payment information is encrypted and secure</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
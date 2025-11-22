// File: page.tsx
// Path: /src/app/(protected)/cart/page.tsx
// Shopping cart page - CORRECTED STYLING

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'

export default function CartPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { items: cartItems, removeFromCart, clearCart, loading, totalAmount } = useCart()
  const [removing, setRemoving] = useState<string | null>(null)

  const handleRemoveItem = async (itemId: string) => {
    setRemoving(itemId)
    try {
      removeFromCart(itemId)
    } catch (error) {
      console.error('Error removing from cart:', error)
    } finally {
      setRemoving(null)
    }
  }

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart()
    }
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    router.push('/checkout')
  }

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa' }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009ae9]"></div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ 
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
            }}
          >
            SHOPPING CART
          </h1>
          <p style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}>
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {cartItems.length === 0 ? (
          // Empty Cart
          <div 
            className="rounded-xl shadow-sm p-12 text-center border"
            style={{ 
              backgroundColor: theme === 'dark' 
                ? 'rgba(26, 26, 26, 0.6)' 
                : 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(12px)',
              borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
            }}
          >
            <svg
              className="w-24 h-24 mx-auto mb-4"
              style={{ color: theme === 'dark' ? '#4a4a4a' : '#d1d5db' }}
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
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ 
                fontFamily: 'var(--font-heading)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
              }}
            >
              YOUR CART IS EMPTY
            </h2>
            <p className="mb-6" style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}>
              Browse our marketplace and add items to your cart
            </p>
            <Link href="/marketplace/" className="btn btn-cta inline-block">
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
                  onClick={handleClearCart}
                  className="text-sm text-red-600 hover:text-red-700 hover:underline"
                >
                  Clear Cart
                </button>
              </div>

              {/* Items List */}
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl shadow-sm p-4 flex items-center gap-4 relative border transition-all duration-300"
                  style={{ 
                    backgroundColor: theme === 'dark' 
                      ? 'rgba(26, 26, 26, 0.6)' 
                      : 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(12px)',
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                  }}
                >
                  {/* Remove X Button - Top Right */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={removing === item.id}
                    className="absolute top-3 right-3 p-1 rounded-full transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: theme === 'dark' ? 'transparent' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#3a3a3a' : '#f3f4f6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    aria-label="Remove item"
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  {/* Image */}
                  <div className="flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div 
                        className="w-24 h-24 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: theme === 'dark' ? '#3a3a3a' : '#e5e7eb' }}
                      >
                        <svg
                          className="w-8 h-8"
                          style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
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
                  <div className="flex-1 pr-8">
                    <Link
                      href={`/marketplace/${item.itemId}`}
                      className="text-lg font-semibold hover:text-[#009ae9] mb-1 block"
                      style={{ 
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                      }}
                    >
                      {item.title}
                    </Link>
                    <p 
                      className="text-sm mb-2"
                      style={{ 
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#b3b3b3' : '#666666' 
                      }}
                    >
                      by{' '}
                      <Link
                        href={`/profile/${item.seller_name}`}
                        className="text-[#009ae9] hover:underline"
                      >
                        {item.seller_name}
                      </Link>
                    </p>
                    
                    {/* Price */}
                    <p 
                      className="text-xl font-bold"
                      style={{ 
                        fontFamily: 'var(--font-heading)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                      }}
                    >
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div 
                className="rounded-xl shadow-sm p-6 sticky top-6 border"
                style={{ 
                  backgroundColor: theme === 'dark' 
                    ? 'rgba(26, 26, 26, 0.6)' 
                    : 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(12px)',
                  borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                }}
              >
                <h2 
                  className="text-xl font-bold mb-4"
                  style={{ 
                    fontFamily: 'var(--font-heading)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
                  }}
                >
                  ORDER SUMMARY
                </h2>

                <div className="space-y-3 mb-4">
                  <div 
                    className="flex justify-between"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#b3b3b3' : '#666666' 
                    }}
                  >
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  
                  <div 
                    className="border-t pt-3 flex justify-between text-lg font-bold"
                    style={{ 
                      borderColor: theme === 'dark' ? '#3a3a3a' : '#e0e0e0',
                      fontFamily: 'var(--font-heading)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
                    }}
                  >
                    <span>Total</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn btn-cta w-full mb-3"
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </button>

                <Link
                  href="/marketplace"
                  className="btn btn-secondary w-full text-center block"
                >
                  Continue Shopping
                </Link>

                {/* Security Info */}
                <div 
                  className="mt-6 pt-6"
                  style={{ borderTop: `1px solid ${theme === 'dark' ? '#3a3a3a' : '#e0e0e0'}` }}
                >
                  <div 
                    className="flex items-start gap-2 text-sm"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#b3b3b3' : '#666666' 
                    }}
                  >
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
                      <p 
                        className="font-medium mb-1"
                        style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}
                      >
                        Secure Checkout
                      </p>
                      <p>Your payment information is encrypted and secure. We accept Stripe and PayPal.</p>
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
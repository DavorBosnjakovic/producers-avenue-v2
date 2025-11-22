// File: page.tsx
// Path: /src/app/(protected)/checkout/page.tsx
// Checkout page with payment method selection

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { useCart } from '@/contexts/CartContext'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { items: cartItems, totalAmount, loading: cartLoading } = useCart()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<'stripe' | 'paypal' | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login?redirect=/checkout')
      return
    }
    setUser(user)
  }

  useEffect(() => {
    // Redirect if cart is empty
    if (!cartLoading && cartItems.length === 0) {
      router.push('/cart')
    }
  }, [cartItems, cartLoading])

  const handleStripeCheckout = async () => {
    setLoading(true)
    setSelectedPayment('stripe')
    
    try {
      // Call your Stripe checkout API
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            id: item.itemId,
            title: item.title,
            price: item.price,
            seller_id: item.seller_id,
          })),
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        alert(`Error: ${error}`)
        setLoading(false)
        setSelectedPayment(null)
        return
      }

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Stripe checkout error:', error)
      alert('Failed to start Stripe checkout. Please try again.')
      setLoading(false)
      setSelectedPayment(null)
    }
  }

  const handlePayPalCheckout = async () => {
    setLoading(true)
    setSelectedPayment('paypal')
    
    try {
      // Call your PayPal checkout API
      const response = await fetch('/api/paypal/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            id: item.itemId,
            title: item.title,
            price: item.price,
            seller_id: item.seller_id,
          })),
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        alert(`Error: ${error}`)
        setLoading(false)
        setSelectedPayment(null)
        return
      }

      // Redirect to PayPal
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('PayPal checkout error:', error)
      alert('Failed to start PayPal checkout. Please try again.')
      setLoading(false)
      setSelectedPayment(null)
    }
  }

  if (cartLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa' }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009ae9]"></div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return null // Will redirect via useEffect
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ 
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
            }}
          >
            CHECKOUT
          </h1>
          <p style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}>
            Review your order and select payment method
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div
              className="rounded-xl p-6 border"
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

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b"
                    style={{ borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0' }}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: theme === 'dark' ? '#3a3a3a' : '#e5e7eb' }}
                      >
                        <svg
                          className="w-6 h-6"
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
                    
                    <div className="flex-1">
                      <h3 
                        className="font-semibold mb-1"
                        style={{ 
                          fontFamily: 'var(--font-body)',
                          color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
                        }}
                      >
                        {item.title}
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}
                      >
                        by {item.seller_name}
                      </p>
                    </div>
                    
                    <p 
                      className="text-lg font-bold"
                      style={{ 
                        fontFamily: 'var(--font-heading)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
                      }}
                    >
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 pt-6 border-t space-y-3"
                style={{ borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0' }}>
                <div className="flex justify-between"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#b3b3b3' : '#666666'
                  }}>
                  <span>Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold"
                  style={{ 
                    fontFamily: 'var(--font-heading)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
                  }}>
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Back to Cart */}
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-sm hover:text-[#009ae9] transition-colors"
              style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Cart
            </Link>
          </div>

          {/* Payment Selection */}
          <div className="lg:col-span-1">
            <div
              className="rounded-xl p-6 border sticky top-6"
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
                PAYMENT METHOD
              </h2>

              <p 
                className="text-sm mb-6"
                style={{ 
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#b3b3b3' : '#666666'
                }}
              >
                Select your preferred payment method
              </p>

              {/* Stripe Button */}
              <button
                onClick={handleStripeCheckout}
                disabled={loading}
                className="w-full mb-3 px-6 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-3 border-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: selectedPayment === 'stripe' ? '#635BFF' : 'transparent',
                  borderColor: '#635BFF',
                  color: selectedPayment === 'stripe' ? 'white' : '#635BFF',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#635BFF'
                    e.currentTarget.style.color = 'white'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPayment !== 'stripe') {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#635BFF'
                  }
                }}
              >
                {loading && selectedPayment === 'stripe' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
                    </svg>
                    <span>Pay with Stripe</span>
                  </>
                )}
              </button>

              {/* PayPal Button */}
              <button
                onClick={handlePayPalCheckout}
                disabled={loading}
                className="w-full px-6 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-3 border-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: selectedPayment === 'paypal' ? '#0070BA' : 'transparent',
                  borderColor: '#0070BA',
                  color: selectedPayment === 'paypal' ? 'white' : '#0070BA',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#0070BA'
                    e.currentTarget.style.color = 'white'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPayment !== 'paypal') {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#0070BA'
                  }
                }}
              >
                {loading && selectedPayment === 'paypal' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
                    </svg>
                    <span>Pay with PayPal</span>
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div 
                className="mt-6 pt-6 text-xs text-center"
                style={{ 
                  borderTop: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'}`,
                  color: theme === 'dark' ? '#6b7280' : '#9ca3af'
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure checkout</span>
                </div>
                <p>Your payment information is encrypted and secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
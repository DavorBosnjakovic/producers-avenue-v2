// File: page.tsx
// Path: /src/app/(protected)/products/[id]/discount-codes/page.tsx
// Discount Codes Management - Premium+ Feature

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Calendar,
  Percent,
  DollarSign,
  Users,
  Lock,
  Crown,
  Loader2,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  title: string
  price: number
  seller_id: string
}

interface DiscountCode {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses: number | null
  current_uses: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

interface Subscription {
  tier: 'basic' | 'standard' | 'premium' | 'ultimate'
}

export default function DiscountCodesPage() {
  const params = useParams()
  const router = useRouter()
  const { theme } = useTheme()
  const productId = params.id as string

  // State
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Create form state
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    maxUses: '',
    hasExpiration: false,
    expirationDate: '',
    expirationTime: '23:59',
  })
  const [createLoading, setCreateLoading] = useState(false)

  // Fetch product, subscription, and discount codes
  useEffect(() => {
    fetchData()
  }, [productId])

  async function fetchData() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id, title, price, seller_id')
        .eq('id', productId)
        .single()

      if (productError || !productData) {
        alert('Product not found')
        router.push('/store/me')
        return
      }

      // Check if user owns this product
      if (productData.seller_id !== user.id) {
        alert('You do not have permission to manage this product')
        router.push('/store/me')
        return
      }

      setProduct(productData)

      // Fetch subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .single()

      setSubscription(subData)

      // Check if Premium+ (premium or ultimate)
      if (!subData || (subData.tier !== 'premium' && subData.tier !== 'ultimate')) {
        // Not Premium+, show upgrade message
        setLoading(false)
        return
      }

      // Fetch discount codes for this product
      const { data: codesData, error: codesError } = await supabase
        .from('product_discount_codes')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (codesData) {
        setDiscountCodes(codesData)
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Create discount code
  async function handleCreateCode(e: React.FormEvent) {
    e.preventDefault()
    setCreateLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // Validation
      if (!formData.code.trim()) {
        alert('Please enter a discount code')
        return
      }

      if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
        alert('Please enter a valid discount value')
        return
      }

      // Validate percentage (must be 1-100)
      if (formData.discountType === 'percentage') {
        const value = parseFloat(formData.discountValue)
        if (value < 1 || value > 100) {
          alert('Percentage discount must be between 1% and 100%')
          return
        }
      }

      // Validate fixed discount (must not exceed product price)
      if (formData.discountType === 'fixed' && product) {
        const value = parseFloat(formData.discountValue)
        if (value > product.price) {
          alert(`Fixed discount cannot exceed product price ($${product.price.toFixed(2)})`)
          return
        }
      }

      // Check for duplicate code
      const codeExists = discountCodes.some(
        dc => dc.code.toLowerCase() === formData.code.toLowerCase()
      )
      if (codeExists) {
        alert('A discount code with this name already exists')
        return
      }

      // Build expiration timestamp
      let expiresAt = null
      if (formData.hasExpiration && formData.expirationDate) {
        expiresAt = `${formData.expirationDate}T${formData.expirationTime}:00`
      }

      // Insert discount code
      const { data, error } = await supabase
        .from('product_discount_codes')
        .insert({
          product_id: productId,
          code: formData.code.toUpperCase(),
          discount_type: formData.discountType,
          discount_value: parseFloat(formData.discountValue),
          max_uses: formData.maxUses ? parseInt(formData.maxUses) : null,
          current_uses: 0,
          expires_at: expiresAt,
          is_active: true,
          created_by: user!.id
        })
        .select()
        .single()

      if (error) throw error

      // Update state
      setDiscountCodes([data, ...discountCodes])
      
      // Reset form
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        maxUses: '',
        hasExpiration: false,
        expirationDate: '',
        expirationTime: '23:59',
      })
      setShowCreateModal(false)

      alert('Discount code created successfully!')

    } catch (error: any) {
      console.error('Error creating discount code:', error)
      alert('Failed to create discount code: ' + error.message)
    } finally {
      setCreateLoading(false)
    }
  }

  // Toggle active status
  async function toggleActive(codeId: string, currentStatus: boolean) {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('product_discount_codes')
        .update({ is_active: !currentStatus })
        .eq('id', codeId)

      if (error) throw error

      // Update state
      setDiscountCodes(discountCodes.map(dc => 
        dc.id === codeId ? { ...dc, is_active: !currentStatus } : dc
      ))

    } catch (error: any) {
      console.error('Error toggling discount code:', error)
      alert('Failed to toggle discount code: ' + error.message)
    }
  }

  // Delete discount code
  async function deleteCode(codeId: string) {
    if (!confirm('Are you sure you want to delete this discount code? This action cannot be undone.')) {
      return
    }

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('product_discount_codes')
        .delete()
        .eq('id', codeId)

      if (error) throw error

      // Update state
      setDiscountCodes(discountCodes.filter(dc => dc.id !== codeId))

      alert('Discount code deleted successfully')

    } catch (error: any) {
      console.error('Error deleting discount code:', error)
      alert('Failed to delete discount code: ' + error.message)
    }
  }

  // Copy code to clipboard
  function copyToClipboard(code: string) {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Check if code is expired
  function isExpired(expiresAt: string | null): boolean {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  // Check if code is maxed out
  function isMaxedOut(code: DiscountCode): boolean {
    return code.max_uses !== null && code.current_uses >= code.max_uses
  }

  // Format discount display
  function formatDiscount(code: DiscountCode): string {
    if (code.discount_type === 'percentage') {
      return `${code.discount_value}% OFF`
    } else {
      return `$${code.discount_value.toFixed(2)} OFF`
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={48} style={{ color: '#009ae9' }} />
      </div>
    )
  }

  // Not Premium+ - Show upgrade message
  if (!subscription || (subscription.tier !== 'premium' && subscription.tier !== 'ultimate')) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/products/${productId}`}
              className="inline-flex items-center gap-2 mb-4 hover:opacity-70 transition-opacity"
              style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}
            >
              <ArrowLeft size={20} />
              Back to Product
            </Link>
          </div>

          {/* Upgrade Message */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-[0_0_8px_0_rgba(0,154,233,0.5)] border border-[#009ae9] p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ backgroundColor: 'rgba(0, 154, 233, 0.1)' }}>
              <Lock size={40} style={{ color: '#009ae9' }} />
            </div>
            
            <h1
              className="text-3xl md:text-4xl mb-4"
              style={{
                fontFamily: 'var(--font-heading)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
            >
              PREMIUM FEATURE
            </h1>
            
            <p
              className="text-lg mb-8 max-w-2xl mx-auto"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#b3b3b3' : '#666666',
              }}
            >
              Discount codes are available for Premium and Ultimate members. Create custom discount codes to run promotions and boost your sales!
            </p>

            <div className="space-y-4 mb-8 max-w-md mx-auto text-left">
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <p style={{ fontFamily: 'var(--font-body)', color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>
                  Create unlimited discount codes
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <p style={{ fontFamily: 'var(--font-body)', color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>
                  Percentage or fixed amount discounts
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <p style={{ fontFamily: 'var(--font-body)', color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>
                  Set usage limits and expiration dates
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <p style={{ fontFamily: 'var(--font-body)', color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>
                  Track usage and performance
                </p>
              </div>
            </div>

            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
              style={{ 
                backgroundColor: '#009ae9',
                fontFamily: 'var(--font-body)',
              }}
            >
              <Crown size={20} />
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/products/${productId}`}
            className="inline-flex items-center gap-2 mb-4 hover:opacity-70 transition-opacity"
            style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}
          >
            <ArrowLeft size={20} />
            Back to Product
          </Link>
          
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1
                className="text-3xl md:text-4xl mb-2"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                DISCOUNT CODES
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#b3b3b3' : '#666666',
                }}
              >
                {product?.title}
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
              style={{ 
                backgroundColor: '#009ae9',
                fontFamily: 'var(--font-body)',
              }}
            >
              <Plus size={20} />
              Create Code
            </button>
          </div>
        </div>

        {/* Discount Codes List */}
        <div className="space-y-4">
          {discountCodes.length === 0 ? (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-[0_0_8px_0_rgba(0,154,233,0.5)] border border-[#009ae9] p-12 text-center">
              <Percent size={48} className="mx-auto mb-4" style={{ color: '#009ae9', opacity: 0.5 }} />
              <h3
                className="text-xl mb-2"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                NO DISCOUNT CODES YET
              </h3>
              <p
                className="mb-6"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#b3b3b3' : '#666666',
                }}
              >
                Create your first discount code to start running promotions
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                style={{ 
                  backgroundColor: '#009ae9',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <Plus size={20} />
                Create First Code
              </button>
            </div>
          ) : (
            discountCodes.map(code => {
              const expired = isExpired(code.expires_at)
              const maxedOut = isMaxedOut(code)
              const inactive = !code.is_active
              const disabled = expired || maxedOut || inactive

              return (
                <div
                  key={code.id}
                  className="bg-white dark:bg-[#1a1a1a] rounded-xl border p-6 transition-all hover:shadow-lg"
                  style={{
                    borderColor: disabled ? theme === 'dark' ? '#2a2a2a' : '#e0e0e0' : '#009ae9',
                    opacity: disabled ? 0.6 : 1,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left Side - Code Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {/* Code */}
                        <div className="flex items-center gap-2">
                          <code
                            className="text-2xl font-bold px-4 py-2 rounded-lg border-2 border-dashed"
                            style={{
                              fontFamily: 'monospace',
                              color: disabled ? theme === 'dark' ? '#666666' : '#999999' : '#009ae9',
                              borderColor: disabled ? theme === 'dark' ? '#2a2a2a' : '#e0e0e0' : '#009ae9',
                              backgroundColor: disabled 
                                ? theme === 'dark' ? '#0a0a0a' : '#f9f9f9'
                                : theme === 'dark' ? 'rgba(0, 154, 233, 0.1)' : 'rgba(0, 154, 233, 0.05)',
                            }}
                          >
                            {code.code}
                          </code>

                          {/* Copy Button */}
                          <button
                            onClick={() => copyToClipboard(code.code)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Copy code"
                          >
                            {copiedCode === code.code ? (
                              <Check size={18} className="text-green-500" />
                            ) : (
                              <Copy size={18} style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }} />
                            )}
                          </button>
                        </div>

                        {/* Discount Badge */}
                        <span
                          className="px-3 py-1 rounded-full text-sm font-bold"
                          style={{
                            backgroundColor: disabled 
                              ? theme === 'dark' ? '#2a2a2a' : '#e0e0e0'
                              : '#10b981',
                            color: disabled 
                              ? theme === 'dark' ? '#666666' : '#999999'
                              : '#ffffff',
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          {formatDiscount(code)}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        {/* Usage */}
                        <div className="flex items-center gap-2">
                          <Users size={16} style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }} />
                          <span style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666', fontFamily: 'var(--font-body)' }}>
                            {code.current_uses} / {code.max_uses || '∞'} uses
                          </span>
                        </div>

                        {/* Expiration */}
                        {code.expires_at && (
                          <div className="flex items-center gap-2">
                            <Calendar size={16} style={{ color: expired ? '#ef4444' : theme === 'dark' ? '#b3b3b3' : '#666666' }} />
                            <span style={{ 
                              color: expired ? '#ef4444' : theme === 'dark' ? '#b3b3b3' : '#666666',
                              fontFamily: 'var(--font-body)' 
                            }}>
                              {expired ? 'Expired' : 'Expires'} {new Date(code.expires_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status Messages */}
                      {(expired || maxedOut || inactive) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {expired && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                              <AlertCircle size={12} />
                              Expired
                            </span>
                          )}
                          {maxedOut && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                              <AlertCircle size={12} />
                              Max uses reached
                            </span>
                          )}
                          {inactive && !expired && !maxedOut && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }}>
                              <AlertCircle size={12} />
                              Inactive
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex items-start gap-2">
                      {/* Toggle Active */}
                      <button
                        onClick={() => toggleActive(code.id, code.is_active)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title={code.is_active ? 'Deactivate' : 'Activate'}
                        disabled={expired || maxedOut}
                      >
                        {code.is_active ? (
                          <ToggleRight size={24} style={{ color: '#10b981' }} />
                        ) : (
                          <ToggleLeft size={24} style={{ color: theme === 'dark' ? '#666666' : '#999999' }} />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteCode(code.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete code"
                      >
                        <Trash2 size={20} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
          onClick={() => !createLoading && setShowCreateModal(false)}
        >
          <div
            className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-[0_0_8px_0_rgba(0,154,233,0.5)] border border-[#009ae9] p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-2xl md:text-3xl mb-6"
              style={{
                fontFamily: 'var(--font-heading)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
            >
              CREATE DISCOUNT CODE
            </h2>

            <form onSubmit={handleCreateCode} className="space-y-6">
              {/* Code Name */}
              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                  }}
                >
                  Discount Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9] uppercase"
                  style={{
                    backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'monospace',
                    fontSize: '1.125rem',
                  }}
                  placeholder="SAVE20"
                  maxLength={20}
                />
                <p className="text-xs mt-1" style={{ color: theme === 'dark' ? '#666666' : '#999999', fontFamily: 'var(--font-body)' }}>
                  Letters and numbers only, no spaces
                </p>
              </div>

              {/* Discount Type */}
              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                  }}
                >
                  Discount Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all"
                    style={{
                      borderColor: formData.discountType === 'percentage' ? '#009ae9' : theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      backgroundColor: formData.discountType === 'percentage'
                        ? theme === 'dark' ? 'rgba(0, 154, 233, 0.1)' : 'rgba(0, 154, 233, 0.05)'
                        : theme === 'dark' ? '#0a0a0a' : '#ffffff'
                    }}
                  >
                    <input
                      type="radio"
                      name="discountType"
                      value="percentage"
                      checked={formData.discountType === 'percentage'}
                      onChange={(e) => setFormData({ ...formData, discountType: 'percentage' })}
                      className="w-5 h-5"
                    />
                    <div className="flex items-center gap-2">
                      <Percent size={20} style={{ color: '#009ae9' }} />
                      <span style={{ fontFamily: 'var(--font-body)', color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>
                        Percentage
                      </span>
                    </div>
                  </label>

                  <label
                    className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all"
                    style={{
                      borderColor: formData.discountType === 'fixed' ? '#009ae9' : theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      backgroundColor: formData.discountType === 'fixed'
                        ? theme === 'dark' ? 'rgba(0, 154, 233, 0.1)' : 'rgba(0, 154, 233, 0.05)'
                        : theme === 'dark' ? '#0a0a0a' : '#ffffff'
                    }}
                  >
                    <input
                      type="radio"
                      name="discountType"
                      value="fixed"
                      checked={formData.discountType === 'fixed'}
                      onChange={(e) => setFormData({ ...formData, discountType: 'fixed' })}
                      className="w-5 h-5"
                    />
                    <div className="flex items-center gap-2">
                      <DollarSign size={20} style={{ color: '#009ae9' }} />
                      <span style={{ fontFamily: 'var(--font-body)', color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>
                        Fixed Amount
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Discount Value */}
              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                  }}
                >
                  {formData.discountType === 'percentage' ? 'Percentage Off *' : 'Amount Off *'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0"
                    max={formData.discountType === 'percentage' ? '100' : product?.price}
                    step={formData.discountType === 'percentage' ? '1' : '0.01'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                    style={{
                      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      fontFamily: 'var(--font-body)',
                    }}
                    placeholder={formData.discountType === 'percentage' ? '20' : '10.00'}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    {formData.discountType === 'percentage' ? (
                      <Percent size={18} style={{ color: '#009ae9' }} />
                    ) : (
                      <DollarSign size={18} style={{ color: '#009ae9' }} />
                    )}
                  </div>
                </div>
                {formData.discountType === 'percentage' && (
                  <p className="text-xs mt-1" style={{ color: theme === 'dark' ? '#666666' : '#999999', fontFamily: 'var(--font-body)' }}>
                    1-100% off the product price
                  </p>
                )}
                {formData.discountType === 'fixed' && product && (
                  <p className="text-xs mt-1" style={{ color: theme === 'dark' ? '#666666' : '#999999', fontFamily: 'var(--font-body)' }}>
                    Maximum: ${product.price.toFixed(2)} (product price)
                  </p>
                )}
              </div>

              {/* Max Uses */}
              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                  }}
                >
                  Maximum Uses (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                  style={{
                    backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)',
                  }}
                  placeholder="Leave blank for unlimited"
                />
              </div>

              {/* Expiration */}
              <div>
                <label className="flex items-center gap-3 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasExpiration}
                    onChange={(e) => setFormData({ ...formData, hasExpiration: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#009ae9] focus:ring-[#009ae9]"
                  />
                  <span className="font-medium" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a', fontFamily: 'var(--font-body)' }}>
                    Set expiration date
                  </span>
                </label>

                {formData.hasExpiration && (
                  <div className="grid grid-cols-2 gap-3 ml-8">
                    <div>
                      <label className="block mb-2 text-sm" style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666', fontFamily: 'var(--font-body)' }}>
                        Date
                      </label>
                      <input
                        type="date"
                        required={formData.hasExpiration}
                        value={formData.expirationDate}
                        onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                        style={{
                          backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                          borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                          color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                          fontFamily: 'var(--font-body)',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm" style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666', fontFamily: 'var(--font-body)' }}>
                        Time
                      </label>
                      <input
                        type="time"
                        value={formData.expirationTime}
                        onChange={(e) => setFormData({ ...formData, expirationTime: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                        style={{
                          backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                          borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                          color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                          fontFamily: 'var(--font-body)',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={createLoading}
                  className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-6 py-3 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  style={{ 
                    backgroundColor: '#009ae9',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {createLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={18} />
                      Creating...
                    </span>
                  ) : (
                    'Create Code'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
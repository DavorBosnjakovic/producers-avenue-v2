// File: page.tsx
// Path: /src/app/(protected)/create/service/page.tsx
// Create Service Page

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, X, Upload } from 'lucide-react'
import Link from 'next/link'

interface Package {
  name: string
  price: string
  deliveryDays: string
  revisions: string
  features: string[]
}

export default function CreateServicePage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceType: '',
    packages: [
      { name: 'Basic', price: '', deliveryDays: '', revisions: '1', features: [''] },
    ] as Package[],
  })

  const addPackage = () => {
    setFormData({
      ...formData,
      packages: [...formData.packages, { name: '', price: '', deliveryDays: '', revisions: '1', features: [''] }],
    })
  }

  const removePackage = (index: number) => {
    setFormData({
      ...formData,
      packages: formData.packages.filter((_, i) => i !== index),
    })
  }

  const updatePackage = (index: number, field: keyof Package, value: any) => {
    const newPackages = [...formData.packages]
    newPackages[index] = { ...newPackages[index], [field]: value }
    setFormData({ ...formData, packages: newPackages })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // TODO: Create service in database
      
      alert('Service created successfully!')
      router.push('/store/me')
    } catch (error) {
      console.error('Error creating service:', error)
      alert('Failed to create service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/store/me"
            className="inline-flex items-center gap-2 mb-4 hover:opacity-70 transition-opacity"
            style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}
          >
            <ArrowLeft size={20} />
            Back to Store
          </Link>
          <h1
            className="text-4xl md:text-5xl mb-2"
            style={{
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
            }}
          >
            CREATE SERVICE
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              color: theme === 'dark' ? '#b3b3b3' : '#666666',
            }}
          >
            Offer your expertise with custom packages
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-[0_0_8px_0_rgba(0,154,233,0.5)] border border-[#009ae9] p-6 md:p-8 space-y-8">
            
            {/* Basic Information */}
            <div>
              <h2
                className="text-2xl md:text-3xl mb-6"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                BASIC INFORMATION
              </h2>

              <div className="space-y-6">
                <div>
                  <label
                    className="block mb-2 font-medium"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                    }}
                  >
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                    style={{
                      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      fontFamily: 'var(--font-body)',
                    }}
                    placeholder="e.g., Professional Mixing & Mastering"
                  />
                </div>

                <div>
                  <label
                    className="block mb-2 font-medium"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                    }}
                  >
                    Description *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                    style={{
                      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      fontFamily: 'var(--font-body)',
                    }}
                    placeholder="Describe your service..."
                  />
                </div>

                <div>
                  <label
                    className="block mb-2 font-medium"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                    }}
                  >
                    Service Type *
                  </label>
                  <select
                    required
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                    style={{
                      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    <option value="">Select service type</option>
                    <option value="mixing">Mixing & Mastering</option>
                    <option value="production">Music Production</option>
                    <option value="vocals">Vocal Editing & Tuning</option>
                    <option value="mentoring">Mentoring & Consultation</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Service Packages */}
            <div>
              <h2
                className="text-2xl md:text-3xl mb-6"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                SERVICE PACKAGES
              </h2>

              <div className="space-y-4">
                {formData.packages.map((pkg, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border"
                    style={{
                      borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f9f9f9',
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold" style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a', fontFamily: 'var(--font-heading)' }}>
                        PACKAGE {index + 1}
                      </h3>
                      {formData.packages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePackage(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm" style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666', fontFamily: 'var(--font-body)' }}>
                          Package Name
                        </label>
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => updatePackage(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                          style={{
                            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                            borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                            fontFamily: 'var(--font-body)',
                          }}
                          placeholder="e.g., Basic"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm" style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666', fontFamily: 'var(--font-body)' }}>
                          Price ($)
                        </label>
                        <input
                          type="number"
                          value={pkg.price}
                          onChange={(e) => updatePackage(index, 'price', e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                          style={{
                            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                            borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                            fontFamily: 'var(--font-body)',
                          }}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm" style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666', fontFamily: 'var(--font-body)' }}>
                          Delivery (days)
                        </label>
                        <input
                          type="number"
                          value={pkg.deliveryDays}
                          onChange={(e) => updatePackage(index, 'deliveryDays', e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                          style={{
                            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                            borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                            fontFamily: 'var(--font-body)',
                          }}
                          placeholder="3"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm" style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666', fontFamily: 'var(--font-body)' }}>
                          Revisions
                        </label>
                        <input
                          type="number"
                          value={pkg.revisions}
                          onChange={(e) => updatePackage(index, 'revisions', e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                          style={{
                            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                            borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                            fontFamily: 'var(--font-body)',
                          }}
                          placeholder="1"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addPackage}
                  className="w-full py-3 rounded-lg border-2 border-dashed font-medium hover:border-[#009ae9] transition-colors"
                  style={{
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                    color: '#009ae9',
                    backgroundColor: 'transparent',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <Plus className="inline mr-2" size={20} />
                  Add Another Package
                </button>
              </div>
            </div>

            {/* Portfolio */}
            <div>
              <h2
                className="text-2xl md:text-3xl mb-6"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                PORTFOLIO & SAMPLES
              </h2>

              <div>
                <label
                  className="block mb-2 font-medium"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                  }}
                >
                  Upload Samples (Optional)
                </label>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-[#009ae9] transition-colors"
                  style={{
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                    backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f9f9f9',
                  }}
                >
                  <Upload className="mx-auto mb-2" size={40} style={{ color: '#009ae9' }} />
                  <p style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666', fontFamily: 'var(--font-body)' }}>
                    Upload samples of your work
                  </p>
                  <p className="text-sm mt-1" style={{ color: theme === 'dark' ? '#666666' : '#999999', fontFamily: 'var(--font-body)' }}>
                    Audio, video, or images
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Link
                href="/store/me"
                className="px-8 py-3 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-8 py-3 rounded-lg font-medium text-white disabled:opacity-50 transition-opacity"
                style={{ 
                  backgroundColor: '#009ae9',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {loading ? 'Publishing...' : 'Publish Service'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
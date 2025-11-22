// File: page.tsx
// Path: /src/app/(protected)/create/webinar/page.tsx
// Create Webinar Page

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Calendar, Clock, Upload } from 'lucide-react'
import Link from 'next/link'

export default function CreateWebinarPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '',
    price: '',
    maxAttendees: '',
    recordingAvailable: true,
  })

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

      // TODO: Create webinar in database
      
      alert('Webinar created successfully!')
      router.push('/store/me')
    } catch (error) {
      console.error('Error creating webinar:', error)
      alert('Failed to create webinar')
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
            CREATE WEBINAR
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              color: theme === 'dark' ? '#b3b3b3' : '#666666',
            }}
          >
            Host live sessions and workshops
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
                    Webinar Title *
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
                    placeholder="e.g., Mastering Modern Music Production"
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
                    placeholder="What will attendees learn in this webinar?"
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
                    Cover Image (Optional)
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
                      Upload cover image
                    </p>
                    <p className="text-sm mt-1" style={{ color: theme === 'dark' ? '#666666' : '#999999', fontFamily: 'var(--font-body)' }}>
                      PNG, JPG (max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule & Pricing */}
            <div>
              <h2
                className="text-2xl md:text-3xl mb-6"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                SCHEDULE & PRICING
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block mb-2 font-medium"
                      style={{ 
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                      }}
                    >
                      Date *
                    </label>
                    <div className="relative">
                      <Calendar
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        size={20}
                        style={{ color: '#009ae9' }}
                      />
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                        style={{
                          backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                          borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                          color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                          fontFamily: 'var(--font-body)',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block mb-2 font-medium"
                      style={{ 
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                      }}
                    >
                      Time *
                    </label>
                    <div className="relative">
                      <Clock
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        size={20}
                        style={{ color: '#009ae9' }}
                      />
                      <input
                        type="time"
                        required
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                        style={{
                          backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                          borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                          color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                          fontFamily: 'var(--font-body)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className="block mb-2 font-medium"
                      style={{ 
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                      }}
                    >
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      required
                      min="15"
                      step="15"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                      style={{
                        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                        borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                        fontFamily: 'var(--font-body)',
                      }}
                      placeholder="60"
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
                      Price (USD) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                      style={{
                        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                        borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                        fontFamily: 'var(--font-body)',
                      }}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block mb-2 font-medium"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' 
                    }}
                  >
                    Max Attendees *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                    style={{
                      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      fontFamily: 'var(--font-body)',
                    }}
                    placeholder="100"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="recording"
                    checked={formData.recordingAvailable}
                    onChange={(e) => setFormData({ ...formData, recordingAvailable: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#009ae9] focus:ring-[#009ae9]"
                  />
                  <label
                    htmlFor="recording"
                    className="font-medium cursor-pointer"
                    style={{ 
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    Make recording available after webinar
                  </label>
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
                {loading ? 'Publishing...' : 'Publish Webinar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
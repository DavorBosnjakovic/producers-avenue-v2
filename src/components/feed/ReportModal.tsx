// File: ReportModal.tsx
// Path: /src/components/feed/ReportModal.tsx
// Modal for reporting inappropriate posts

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { X, Flag } from 'lucide-react'

interface Post {
  id: string
  user_id: string
  content: string
  user_profiles: {
    username: string
    display_name: string
  }
}

interface ReportModalProps {
  post: Post
  onClose: () => void
  onReported: () => void
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment or Bullying' },
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'violence', label: 'Violence or Dangerous Content' },
  { value: 'misinformation', label: 'False Information' },
  { value: 'sexual_content', label: 'Sexual Content' },
  { value: 'copyright', label: 'Copyright Violation' },
  { value: 'scam', label: 'Scam or Fraud' },
  { value: 'other', label: 'Other' }
]

export default function ReportModal({ post, onClose, onReported }: ReportModalProps) {
  const { theme } = useTheme()
  const [selectedReason, setSelectedReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)

  useState(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReason || !user) return

    setSubmitting(true)

    try {
      const supabase = createClient()

      // Insert report
      const { error } = await supabase
        .from('reports')
        .insert({
          reportable_type: 'post',
          reportable_id: post.id,
          reported_user_id: post.user_id,
          reporter_id: user.id,
          reason: selectedReason,
          details: details.trim() || null,
          status: 'pending'
        })

      if (error) throw error

      alert('Thank you for your report. We will review it shortly.')
      onReported()
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Failed to submit report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="w-full max-w-lg rounded-xl border overflow-hidden"
          style={{
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            borderColor: '#009ae9',
            boxShadow: '0 0 8px 0 rgba(0, 154, 233, 0.5)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0' }}
          >
            <div className="flex items-center gap-3">
              <Flag className="w-6 h-6" style={{ color: '#ef4444' }} />
              <h2 
                className="text-2xl"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
                }}
              >
                REPORT POST
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-6 h-6" style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Info */}
              <p 
                className="text-sm"
                style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}
              >
                Please select the reason for reporting this post. Your report is anonymous.
              </p>

              {/* Reasons */}
              <div className="space-y-2">
                <label 
                  className="block font-semibold mb-3"
                  style={{
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)'
                  }}
                >
                  Reason *
                </label>
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason.value}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                    style={{
                      backgroundColor: selectedReason === reason.value 
                        ? (theme === 'dark' ? 'rgba(0, 154, 233, 0.1)' : 'rgba(0, 154, 233, 0.05)')
                        : (theme === 'dark' ? '#0a0a0a' : '#fafafa'),
                      borderColor: selectedReason === reason.value 
                        ? '#009ae9'
                        : (theme === 'dark' ? '#2a2a2a' : '#e0e0e0')
                    }}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-4 h-4"
                      style={{ accentColor: '#009ae9' }}
                    />
                    <span 
                      style={{
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                        fontFamily: 'var(--font-body)'
                      }}
                    >
                      {reason.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Additional Details */}
              <div>
                <label 
                  className="block font-semibold mb-3"
                  style={{
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)'
                  }}
                >
                  Additional Details (Optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide any additional information that might help us review this report..."
                  rows={4}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9] resize-none"
                  style={{
                    backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)'
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div 
              className="flex gap-3 p-6 border-t"
              style={{ borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0' }}
            >
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-lg font-semibold transition-all"
                style={{
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  fontFamily: 'var(--font-body)'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedReason || submitting}
                className="flex-1 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontFamily: 'var(--font-body)'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
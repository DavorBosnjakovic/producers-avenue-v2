// File: ReportModal.tsx
// Path: /src/components/common/ReportModal.tsx
// Report modal component for reporting content and users

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  reportType: 'product' | 'service' | 'user' | 'review'
  itemId: string
  itemTitle: string
}

const REPORT_REASONS = {
  product: [
    'Misleading description',
    'Copyright infringement',
    'Inappropriate content',
    'Scam or fraud',
    'Poor quality',
    'Other',
  ],
  service: [
    'Misleading description',
    'Inappropriate content',
    'Scam or fraud',
    'Poor service quality',
    'Unprofessional behavior',
    'Other',
  ],
  user: [
    'Harassment or bullying',
    'Spam',
    'Impersonation',
    'Inappropriate content',
    'Scam or fraud',
    'Other',
  ],
  review: [
    'Fake review',
    'Spam',
    'Inappropriate language',
    'Off-topic',
    'Personal information',
    'Other',
  ],
}

export default function ReportModal({
  isOpen,
  onClose,
  reportType,
  itemId,
  itemTitle,
}: ReportModalProps) {
  const router = useRouter()
  const supabase = createClient()

  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason) {
      alert('Please select a reason')
      return
    }

    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const reportData = {
        reporter_id: user.id,
        report_type: reportType,
        item_id: itemId,
        reason,
        details: details.trim() || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('reports')
        .insert(reportData)

      if (error) throw error

      setSubmitted(true)
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
        // Reset state
        setReason('')
        setDetails('')
        setSubmitted(false)
      }, 2000)
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Failed to submit report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setReason('')
      setDetails('')
      setSubmitted(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {submitted ? (
            // Success Message
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Report Submitted
              </h3>
              <p className="text-sm text-gray-600">
                Thank you for helping keep our community safe. We'll review your report shortly.
              </p>
            </div>
          ) : (
            // Report Form
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Report {reportType}</h3>
                  <p className="text-sm text-gray-600 mt-1">"{itemTitle}"</p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Reason */}
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for reporting *
                  </label>
                  <select
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent"
                    required
                  >
                    <option value="">Select a reason</option>
                    {REPORT_REASONS[reportType].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Additional Details */}
                <div>
                  <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional details (optional)
                  </label>
                  <textarea
                    id="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent"
                    placeholder="Please provide any additional information that might help us understand the issue..."
                  />
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <svg
                      className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Your report is confidential</p>
                      <p>Our moderation team will review this report and take appropriate action. False reports may result in account restrictions.</p>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
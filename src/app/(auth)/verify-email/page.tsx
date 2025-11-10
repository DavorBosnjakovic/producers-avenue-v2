// File: page.tsx
// Path: /src/app/(auth)/verify-email/page.tsx
// Email verification notice page

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState('')

  const handleResendEmail = async () => {
    setResending(true)
    setMessage('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user?.email) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: user.email,
        })

        if (error) {
          setMessage('Error resending email. Please try again.')
        } else {
          setMessage('Verification email sent! Check your inbox.')
        }
      }
    } catch (error) {
      setMessage('An unexpected error occurred.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Icon */}
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <Link href="/" className="inline-block mb-4">
            <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
              Producers Avenue
            </h1>
          </Link>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Check your email
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            We've sent you a verification link. Please check your email and click the link to verify your account.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm text-center ${
            message.includes('Error') 
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
              : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
          }`}>
            {message}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleResendEmail}
            disabled={resending}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? 'Sending...' : 'Resend verification email'}
          </button>

          <div className="text-center">
            <Link 
              href="/login" 
              className="text-sm text-primary hover:text-primary-hover font-medium"
            >
              Back to login
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            <strong>Didn't receive the email?</strong>
          </p>
          <ul className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li>• Check your spam or junk folder</li>
            <li>• Make sure you entered the correct email address</li>
            <li>• Wait a few minutes and try resending</li>
          </ul>
        </div>

        {/* Support Link */}
        <div className="text-center pt-4">
          <Link 
            href="/contact" 
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary"
          >
            Still need help? Contact support
          </Link>
        </div>
      </div>
    </div>
  )
}
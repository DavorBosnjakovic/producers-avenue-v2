// File: page.tsx
// Path: /src/app/(auth)/forgot-password/page.tsx
// Forgot password page

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { validateEmail } from '@/lib/utils/validation'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-heading font-bold text-gray-900 dark:text-white">
              Producers Avenue
            </h1>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Success Message */}
        {success ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                  Check your email
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset your password.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
              <Link 
                href="/login" 
                className="text-sm text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 font-medium"
              >
                ← Back to login
              </Link>
            </div>
          </div>
        ) : (
          /* Form */
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending link...' : 'Send reset link'}
            </button>

            <div className="text-center space-y-2">
              <Link 
                href="/login" 
                className="text-sm text-primary hover:text-primary-hover font-medium block"
              >
                ← Back to login
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link href="/register" className="font-semibold text-primary hover:text-primary-hover">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        )}

        {/* Help Text */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            <strong>Having trouble?</strong>
          </p>
          <ul className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li>• Make sure you enter the email you used to sign up</li>
            <li>• Check your spam or junk folder</li>
            <li>• The reset link expires after 1 hour</li>
          </ul>
          <div className="text-center mt-4">
            <Link 
              href="/contact" 
              className="text-sm text-primary hover:text-primary-hover"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
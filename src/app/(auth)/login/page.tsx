// File: page.tsx
// Path: /src/app/(auth)/login/page.tsx
// FINAL: CTA button with shine animation

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/lib/contexts/ThemeContext'

export default function LoginPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        router.push('/feed')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
        paddingTop: 'calc(3rem - 48px)', // py-12 minus button height
        paddingBottom: '3rem',
      }}
    >
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 
              className="text-4xl font-bold"
              style={{
                fontFamily: 'var(--font-heading)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
            >
              Producers Avenue
            </h1>
          </Link>
          <h2 
            className="mt-6 text-3xl font-bold"
            style={{
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
            }}
          >
            Welcome back
          </h2>
          <p 
            className="mt-2 text-sm"
            style={{
              fontFamily: 'var(--font-body)',
              color: theme === 'dark' ? '#b3b3b3' : '#666666',
            }}
          >
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold" style={{ color: '#009ae9' }}>
              Sign up
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div 
              className="px-4 py-3 rounded-lg text-sm border"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fee',
                borderColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : '#fcc',
                color: theme === 'dark' ? '#fca5a5' : '#dc2626',
              }}
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium mb-1"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
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
                className="appearance-none relative block w-full px-4 py-3 rounded-xl border transition-colors"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                  borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  fontFamily: 'var(--font-body)',
                }}
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium mb-1"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 rounded-xl border transition-colors"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                  borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  fontFamily: 'var(--font-body)',
                }}
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded"
                style={{
                  accentColor: '#009ae9',
                }}
              />
              <label 
                htmlFor="remember-me" 
                className="ml-2 block text-sm"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                Remember me
              </label>
            </div>

            <Link 
              href="/forgot-password" 
              className="text-sm font-semibold"
              style={{ color: '#009ae9' }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button - CTA with shine animation */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-cta w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
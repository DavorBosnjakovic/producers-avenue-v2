// File: page.tsx
// Path: /src/app/(protected)/profile/page.tsx
// Redirect to user's own public profile

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MyProfileRedirect() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const redirectToProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Get username from user metadata
      const username = user.user_metadata?.username || user.email?.split('@')[0]
      
      // Redirect to public profile
      router.push(`/member/${username}`)
    }

    redirectToProfile()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009ae9] mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
      </div>
    </div>
  )
}
// File: route.ts
// Path: /src/app/(auth)/callback/route.ts
// OAuth callback handler

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if user profile exists
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', data.user.id)
        .single()

      // Create profile if it doesn't exist (for OAuth users)
      if (!profile) {
        const username = data.user.email?.split('@')[0] || `user_${data.user.id.slice(0, 8)}`
        
        await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            username: username,
            display_name: data.user.user_metadata.full_name || username,
            avatar_url: data.user.user_metadata.avatar_url || null,
          })
      }

      // Redirect to feed on success
      return NextResponse.redirect(`${origin}/feed`)
    }
  }

  // Redirect to error page if something went wrong
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
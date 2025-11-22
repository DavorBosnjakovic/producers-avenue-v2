// File: route.ts
// Path: /src/app/(auth)/callback/route.ts
// Handles email verification callback

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/login?error=verification_failed`)
    }
    
    // Successfully verified - redirect to homepage
    return NextResponse.redirect(`${origin}/`)
  }

  // No code provided
  return NextResponse.redirect(`${origin}/login`)
}
// File: route.ts
// Path: /src/app/api/newsletter/route.ts
// Newsletter subscription API route

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate required field
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Check if email already exists
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 409 }
      )
    }

    // Add subscriber to database
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        subscribed_at: new Date().toISOString(),
        status: 'active',
      })

    if (insertError) {
      console.error('Database error:', insertError)
      return NextResponse.json(
        { error: 'Failed to subscribe to newsletter' },
        { status: 500 }
      )
    }

    // TODO: Send welcome email
    // This would integrate with an email service like SendGrid, Resend, etc.
    // Example: await sendWelcomeEmail(email)

    return NextResponse.json(
      { message: 'Successfully subscribed to newsletter' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Unsubscribe endpoint
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Update subscriber status to unsubscribed
    const { error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('email', email)

    if (updateError) {
      console.error('Database error:', updateError)
      return NextResponse.json(
        { error: 'Failed to unsubscribe from newsletter' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Successfully unsubscribed from newsletter' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
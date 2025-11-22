// File: route.ts
// Path: /src/app/api/users/route.ts
// FIXED: Using @supabase/ssr (correct for Next.js 15)

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const userId = searchParams.get('user_id')
    const search = searchParams.get('search')
    const type = searchParams.get('type')

    if (username) {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error) throw error
      return NextResponse.json({ profile })
    }

    if (userId) {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return NextResponse.json({ profile })
    }

    if (type && userId) {
      if (type === 'followers') {
        const { data: followers, error } = await supabase
          .from('followers')
          .select(`
            follower:user_profiles!followers_follower_id_fkey(
              user_id,
              username,
              display_name,
              avatar_url,
              bio
            ),
            created_at
          `)
          .eq('following_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ followers: followers.map(f => f.follower) })
      } else if (type === 'following') {
        const { data: following, error } = await supabase
          .from('followers')
          .select(`
            following:user_profiles!followers_following_id_fkey(
              user_id,
              username,
              display_name,
              avatar_url,
              bio
            ),
            created_at
          `)
          .eq('follower_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ following: following.map(f => f.following) })
      }
    }

    if (search) {
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select('user_id, username, display_name, avatar_url, bio')
        .or(`username.ilike.%${search}%,display_name.ilike.%${search}%`)
        .limit(20)

      if (error) throw error
      return NextResponse.json({ users })
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      display_name,
      bio,
      location_city,
      location_country,
      website_url,
      avatar_url,
      banner_url,
      smart_link
    } = body

    const updateData: any = {}
    if (display_name !== undefined) updateData.display_name = display_name
    if (bio !== undefined) updateData.bio = bio
    if (location_city !== undefined) updateData.location_city = location_city
    if (location_country !== undefined) updateData.location_country = location_country
    if (website_url !== undefined) updateData.website_url = website_url
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url
    if (banner_url !== undefined) updateData.banner_url = banner_url
    if (smart_link !== undefined) {
      if (smart_link && !smart_link.match(/^https?:\/\/(www\.)?rolink\.me\/.+$/)) {
        return NextResponse.json(
          { error: 'Smart link must be a rolink.me URL' },
          { status: 400 }
        )
      }
      updateData.smart_link = smart_link
    }

    const { data: updatedProfile, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      profile: updatedProfile,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, target_user_id } = body

    if (!action || !target_user_id) {
      return NextResponse.json(
        { error: 'action and target_user_id are required' },
        { status: 400 }
      )
    }

    if (user.id === target_user_id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    if (action === 'follow') {
      const { data: existing } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', target_user_id)
        .maybeSingle()

      if (existing) {
        return NextResponse.json(
          { error: 'Already following this user' },
          { status: 400 }
        )
      }

      const { error: followError } = await supabase
        .from('followers')
        .insert({
          follower_id: user.id,
          following_id: target_user_id
        })

      if (followError) throw followError

      const { data: followerProfile } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('user_id', user.id)
        .single()

      await supabase
        .from('notifications')
        .insert({
          user_id: target_user_id,
          type: 'follow',
          title: 'New Follower',
          message: `${followerProfile?.username || 'Someone'} started following you`,
          link: `/profile/${followerProfile?.username}`,
          is_read: false
        })
        .then(({ error }) => {
          if (error) console.error('Notification error (non-blocking):', error)
        })

      return NextResponse.json({ 
        success: true,
        message: 'Successfully followed user'
      })
    } else if (action === 'unfollow') {
      const { error: unfollowError } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', target_user_id)

      if (unfollowError) throw unfollowError

      return NextResponse.json({ 
        success: true,
        message: 'Successfully unfollowed user'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in user action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
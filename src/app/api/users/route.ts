// File: route.ts
// Path: /src/app/api/users/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const userId = searchParams.get('user_id');
    const search = searchParams.get('search');
    const type = searchParams.get('type'); // 'followers' or 'following'

    // Get specific user by username
    if (username) {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          followers:user_follows!user_follows_following_id_fkey(count),
          following:user_follows!user_follows_follower_id_fkey(count),
          products(count),
          services(count)
        `)
        .eq('username', username)
        .single();

      if (error) throw error;

      return NextResponse.json({ profile });
    }

    // Get specific user by ID
    if (userId) {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return NextResponse.json({ profile });
    }

    // Get followers or following list
    if (type && userId) {
      if (type === 'followers') {
        const { data: followers, error } = await supabase
          .from('user_follows')
          .select(`
            follower:user_profiles!user_follows_follower_id_fkey(
              id,
              username,
              full_name,
              avatar_url,
              bio
            ),
            created_at
          `)
          .eq('following_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ 
          followers: followers.map(f => f.follower) 
        });
      } else if (type === 'following') {
        const { data: following, error } = await supabase
          .from('user_follows')
          .select(`
            following:user_profiles!user_follows_following_id_fkey(
              id,
              username,
              full_name,
              avatar_url,
              bio
            ),
            created_at
          `)
          .eq('follower_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ 
          following: following.map(f => f.following) 
        });
      }
    }

    // Search users
    if (search) {
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select('id, username, full_name, avatar_url, bio, user_type')
        .or(`username.ilike.%${search}%,full_name.ilike.%${search}%`)
        .limit(20);

      if (error) throw error;

      return NextResponse.json({ users });
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      full_name,
      bio,
      location,
      website,
      user_type,
      skills,
      avatar_url,
      banner_url,
      social_links,
      rolink_url
    } = body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (user_type !== undefined) updateData.user_type = user_type;
    if (skills !== undefined) updateData.skills = skills;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (banner_url !== undefined) updateData.banner_url = banner_url;
    if (social_links !== undefined) updateData.social_links = social_links;
    if (rolink_url !== undefined) updateData.rolink_url = rolink_url;

    const { data: updatedProfile, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      profile: updatedProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, target_user_id } = body;

    if (!action || !target_user_id) {
      return NextResponse.json(
        { error: 'action and target_user_id are required' },
        { status: 400 }
      );
    }

    if (action === 'follow') {
      // Check if already following
      const { data: existing } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', target_user_id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Already following this user' },
          { status: 400 }
        );
      }

      // Create follow relationship
      const { error: followError } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: target_user_id
        });

      if (followError) throw followError;

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: target_user_id,
          type: 'follow',
          title: 'New Follower',
          message: `${user.email} started following you`,
          link: `/profile/${user.email}`,
          read: false
        });

      return NextResponse.json({ 
        success: true,
        message: 'Successfully followed user'
      });
    } else if (action === 'unfollow') {
      // Remove follow relationship
      const { error: unfollowError } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', target_user_id);

      if (unfollowError) throw unfollowError;

      return NextResponse.json({ 
        success: true,
        message: 'Successfully unfollowed user'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in user action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
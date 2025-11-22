// File: route.ts
// Path: src/app/api/follow/route.ts
// FIXED: Properly handles authentication errors to return 401 instead of 500

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Try to get user - wrap in try/catch to handle auth errors
    let user;
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        console.log('User not authenticated');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      user = authUser;
    } catch (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, targetUserId } = body;

    if (!action || !targetUserId) {
      return NextResponse.json(
        { error: 'action and targetUserId are required' },
        { status: 400 }
      );
    }

    // Prevent self-follow
    if (user.id === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    if (action === 'follow') {
      // Check if already following
      const { data: existing } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
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
          following_id: targetUserId
        });

      if (followError) {
        console.error('Follow error:', followError);
        throw followError;
      }

      // Optional: Create notification (don't fail if this errors)
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: targetUserId,
            type: 'follow',
            title: 'New Follower',
            message: 'Someone started following you',
            link: `/member/${user.id}`,
            read: false
          });
      } catch (notifError) {
        console.error('Notification error (non-critical):', notifError);
      }

      return NextResponse.json({ 
        success: true,
        isFollowing: true,
        message: 'Successfully followed user'
      });

    } else if (action === 'unfollow') {
      // Remove follow relationship
      const { error: unfollowError } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (unfollowError) {
        console.error('Unfollow error:', unfollowError);
        throw unfollowError;
      }

      return NextResponse.json({ 
        success: true,
        isFollowing: false,
        message: 'Successfully unfollowed user'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "follow" or "unfollow"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Follow API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
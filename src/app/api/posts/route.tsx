// File: route.ts
// Path: /src/app/api/posts/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');
    const userId = searchParams.get('user_id');
    const feedType = searchParams.get('feed_type') || 'all'; // 'all', 'following', 'user'
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get specific post by ID
    if (postId) {
      const { data: post, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:user_profiles!posts_user_id_fkey(id, username, full_name, avatar_url),
          likes:post_likes(count),
          comments:post_comments(count),
          user_like:post_likes!post_likes_post_id_fkey(id)
        `)
        .eq('id', postId)
        .eq('user_like.user_id', user.id)
        .single();

      if (error) throw error;

      return NextResponse.json({ post });
    }

    // Get posts for specific user
    if (userId) {
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:user_profiles!posts_user_id_fkey(id, username, full_name, avatar_url),
          likes:post_likes(count),
          comments:post_comments(count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return NextResponse.json({ posts });
    }

    // Get feed based on type
    if (feedType === 'following') {
      // Get posts from users that current user follows
      const { data: following } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = following?.map(f => f.following_id) || [];
      
      if (followingIds.length === 0) {
        return NextResponse.json({ posts: [] });
      }

      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:user_profiles!posts_user_id_fkey(id, username, full_name, avatar_url),
          likes:post_likes(count),
          comments:post_comments(count)
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return NextResponse.json({ posts });
    }

    // Get all posts (default feed)
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:user_profiles!posts_user_id_fkey(id, username, full_name, avatar_url),
        likes:post_likes(count),
        comments:post_comments(count)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
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
    const { action, post_id, content, media_urls, media_type } = body;

    // Create new post
    if (!action || action === 'create') {
      if (!content || content.trim() === '') {
        return NextResponse.json(
          { error: 'Post content is required' },
          { status: 400 }
        );
      }

      const { data: post, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          media_urls: media_urls || [],
          media_type: media_type || null,
          likes_count: 0,
          comments_count: 0
        })
        .select(`
          *,
          author:user_profiles!posts_user_id_fkey(id, username, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      return NextResponse.json({ 
        success: true,
        post,
        message: 'Post created successfully'
      });
    }

    // Like a post
    if (action === 'like') {
      if (!post_id) {
        return NextResponse.json(
          { error: 'post_id is required' },
          { status: 400 }
        );
      }

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', post_id)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        return NextResponse.json(
          { error: 'Post already liked' },
          { status: 400 }
        );
      }

      // Create like
      const { error: likeError } = await supabase
        .from('post_likes')
        .insert({
          post_id: post_id,
          user_id: user.id
        });

      if (likeError) throw likeError;

      // Increment likes count
      const { error: updateError } = await supabase
        .rpc('increment_post_likes', { post_id: post_id });

      if (updateError) throw updateError;

      // Get post author for notification
      const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', post_id)
        .single();

      // Create notification if not liking own post
      if (post && post.user_id !== user.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: post.user_id,
            type: 'like',
            title: 'New Like',
            message: `${user.email} liked your post`,
            link: `/feed?post=${post_id}`,
            read: false
          });
      }

      return NextResponse.json({ 
        success: true,
        message: 'Post liked successfully'
      });
    }

    // Unlike a post
    if (action === 'unlike') {
      if (!post_id) {
        return NextResponse.json(
          { error: 'post_id is required' },
          { status: 400 }
        );
      }

      // Remove like
      const { error: unlikeError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', post_id)
        .eq('user_id', user.id);

      if (unlikeError) throw unlikeError;

      // Decrement likes count
      const { error: updateError } = await supabase
        .rpc('decrement_post_likes', { post_id: post_id });

      if (updateError) throw updateError;

      return NextResponse.json({ 
        success: true,
        message: 'Post unliked successfully'
      });
    }

    // Comment on a post
    if (action === 'comment') {
      if (!post_id || !content) {
        return NextResponse.json(
          { error: 'post_id and content are required' },
          { status: 400 }
        );
      }

      const { data: comment, error: commentError } = await supabase
        .from('post_comments')
        .insert({
          post_id: post_id,
          user_id: user.id,
          content: content.trim()
        })
        .select(`
          *,
          author:user_profiles!post_comments_user_id_fkey(id, username, full_name, avatar_url)
        `)
        .single();

      if (commentError) throw commentError;

      // Increment comments count
      const { error: updateError } = await supabase
        .rpc('increment_post_comments', { post_id: post_id });

      if (updateError) throw updateError;

      // Get post author for notification
      const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', post_id)
        .single();

      // Create notification if not commenting on own post
      if (post && post.user_id !== user.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: post.user_id,
            type: 'comment',
            title: 'New Comment',
            message: `${user.email} commented on your post`,
            link: `/feed?post=${post_id}`,
            read: false
          });
      }

      return NextResponse.json({ 
        success: true,
        comment,
        message: 'Comment added successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing post action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (!post || post.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete post (cascades to likes and comments)
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
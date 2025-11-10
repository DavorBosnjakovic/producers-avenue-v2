// File: route.ts
// Path: /src/app/api/messages/route.ts

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
    const conversationId = searchParams.get('conversation_id');
    const otherUserId = searchParams.get('other_user_id');

    // If requesting specific conversation messages
    if (conversationId) {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:user_profiles!messages_sender_id_fkey(id, username, avatar_url),
          receiver:user_profiles!messages_receiver_id_fkey(id, username, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', user.id)
        .eq('read', false);

      return NextResponse.json({ messages });
    }

    // If starting conversation with specific user
    if (otherUserId) {
      // Check if conversation exists
      const { data: existingConvo } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
        .single();

      if (existingConvo) {
        return NextResponse.json({ conversation_id: existingConvo.id });
      }

      // Create new conversation
      const { data: newConvo, error: convoError } = await supabase
        .from('conversations')
        .insert({
          user1_id: user.id,
          user2_id: otherUserId
        })
        .select()
        .single();

      if (convoError) throw convoError;

      return NextResponse.json({ conversation_id: newConvo.id });
    }

    // Get all conversations for user
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user1:user_profiles!conversations_user1_id_fkey(id, username, avatar_url),
        user2:user_profiles!conversations_user2_id_fkey(id, username, avatar_url),
        messages(content, created_at, read, sender_id)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Format conversations with other user info and last message
    const formattedConversations = conversations.map(convo => {
      const otherUser = convo.user1_id === user.id ? convo.user2 : convo.user1;
      const lastMessage = convo.messages[convo.messages.length - 1];
      const unreadCount = convo.messages.filter(
        (msg: any) => msg.receiver_id === user.id && !msg.read
      ).length;

      return {
        id: convo.id,
        other_user: otherUser,
        last_message: lastMessage?.content || 'No messages yet',
        last_message_time: lastMessage?.created_at || convo.created_at,
        unread_count: unreadCount,
        updated_at: convo.updated_at
      };
    });

    return NextResponse.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Error in messages API:', error);
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
    const { conversation_id, receiver_id, content } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Insert message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        sender_id: user.id,
        receiver_id,
        content: content.trim(),
        read: false
      })
      .select(`
        *,
        sender:user_profiles!messages_sender_id_fkey(id, username, avatar_url)
      `)
      .single();

    if (messageError) throw messageError;

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversation_id);

    // Create notification for receiver
    await supabase
      .from('notifications')
      .insert({
        user_id: receiver_id,
        type: 'message',
        title: 'New Message',
        message: `You have a new message from ${user.email}`,
        link: `/messages?conversation=${conversation_id}`,
        read: false
      });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
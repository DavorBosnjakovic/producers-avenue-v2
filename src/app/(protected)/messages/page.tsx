// File: page.tsx
// Path: /src/app/(protected)/messages/page.tsx
// Messages/Chat page

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Conversation {
  id: string
  participant: {
    username: string
    display_name: string
    avatar_url: string | null
  }
  last_message: string
  last_message_time: string
  unread_count: number
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const supabase = createClient()
      
      // This is a placeholder - you'll need to implement the actual query
      // based on your messages schema
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant:user_profiles(username, display_name, avatar_url)
        `)
        .order('updated_at', { ascending: false })

      if (error) throw error
      
      setConversations(data || [])
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          content: newMessage,
        })

      if (error) throw error
      
      setNewMessage('')
      loadMessages(selectedConversation)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950 flex">
      
      {/* Conversations List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">No conversations yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Start a conversation with someone from the community
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => {
                  setSelectedConversation(conversation.id)
                  loadMessages(conversation.id)
                }}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-200 dark:border-gray-800 ${
                  selectedConversation === conversation.id ? 'bg-gray-50 dark:bg-gray-800' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {conversation.participant.display_name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {conversation.participant.display_name}
                    </h3>
                    {conversation.unread_count > 0 && (
                      <span className="bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {conversation.last_message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {new Date(conversation.last_message_time).toLocaleTimeString()}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
              U
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Username</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    U
                  </div>
                  <div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 max-w-md">
                      <p className="text-gray-900 dark:text-white">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
          <div className="text-center">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Select a conversation
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
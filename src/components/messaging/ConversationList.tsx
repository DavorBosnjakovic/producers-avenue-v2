// File: ConversationList.tsx (UPDATED WITH THEME SUPPORT)
// Path: /src/components/messaging/ConversationList.tsx

'use client';

import { useState, useEffect } from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface Conversation {
  id: string;
  recipient_id: string;
  recipient_name: string;
  recipient_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_online: boolean;
}

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

export default function ConversationList({
  onSelectConversation,
  selectedConversationId
}: ConversationListProps) {
  const { theme } = useTheme();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages?type=conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.recipient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className={`flex flex-col h-full ${
      theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-white'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b ${
        theme === 'dark' ? 'border-[#2a2a2a]' : 'border-[#e0e0e0]'
      }`}>
        <h2 className={`text-xl font-bold mb-4 ${
          theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#1a1a1a]'
        }`}>
          Messages
        </h2>
        
        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
            theme === 'dark' ? 'text-[#b3b3b3]' : 'text-[#666666]'
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:border-[#009ae9] ${
              theme === 'dark'
                ? 'bg-[#1a1a1a] border-[#2a2a2a] text-[#f5f5f5] placeholder-[#b3b3b3]'
                : 'bg-[#f5f5f5] border-[#e0e0e0] text-[#1a1a1a] placeholder-[#666666]'
            }`}
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-[#009ae9] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className={`text-center py-8 ${
            theme === 'dark' ? 'text-[#b3b3b3]' : 'text-[#666666]'
          }`}>
            {searchQuery ? 'No conversations found' : 'No messages yet'}
          </div>
        ) : (
          <div>
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`w-full p-4 flex items-start gap-3 border-b transition-colors ${
                  conversation.id === selectedConversationId
                    ? theme === 'dark'
                      ? 'bg-[#1a1a1a] border-[#2a2a2a]'
                      : 'bg-[#f5f5f5] border-[#e0e0e0]'
                    : theme === 'dark'
                    ? 'hover:bg-[#1a1a1a] border-[#2a2a2a]'
                    : 'hover:bg-[#f5f5f5] border-[#e0e0e0]'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#009ae9] flex items-center justify-center text-white font-medium">
                    {conversation.recipient_avatar ? (
                      <img
                        src={conversation.recipient_avatar}
                        alt={conversation.recipient_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      conversation.recipient_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {conversation.is_online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#0a0a0a] rounded-full"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-medium truncate ${
                      theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#1a1a1a]'
                    }`}>
                      {conversation.recipient_name}
                    </h3>
                    <span className={`text-xs flex-shrink-0 ml-2 ${
                      theme === 'dark' ? 'text-[#b3b3b3]' : 'text-[#666666]'
                    }`}>
                      {formatTime(conversation.last_message_time)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${
                      conversation.unread_count > 0
                        ? theme === 'dark' ? 'text-[#f5f5f5] font-medium' : 'text-[#1a1a1a] font-medium'
                        : theme === 'dark' ? 'text-[#b3b3b3]' : 'text-[#666666]'
                    }`}>
                      {conversation.last_message}
                    </p>
                    {conversation.unread_count > 0 && (
                      <span className="flex-shrink-0 min-w-[20px] h-5 px-2 bg-[#009ae9] text-white text-xs rounded-full flex items-center justify-center">
                        {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>

                {/* More Options */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle more options
                  }}
                  className={`flex-shrink-0 p-1 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-[#2a2a2a] text-[#b3b3b3]'
                      : 'hover:bg-[#e0e0e0] text-[#666666]'
                  }`}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// File: MessageThread.tsx (UPDATED WITH THEME SUPPORT)
// Path: /src/components/messaging/MessageThread.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface MessageThreadProps {
  conversationId: string;
  recipientName: string;
  recipientAvatar?: string;
  currentUserId: string;
}

export default function MessageThread({
  conversationId,
  recipientName,
  recipientAvatar,
  currentUserId
}: MessageThreadProps) {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Fetch messages
    fetchMessages();
    scrollToBottom();
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: newMessage.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${
      theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-white'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        theme === 'dark' ? 'border-[#2a2a2a]' : 'border-[#e0e0e0]'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#009ae9] flex items-center justify-center text-white font-medium">
            {recipientAvatar ? (
              <img src={recipientAvatar} alt={recipientName} className="w-full h-full rounded-full object-cover" />
            ) : (
              recipientName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className={`font-medium ${
              theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#1a1a1a]'
            }`}>
              {recipientName}
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-[#b3b3b3]' : 'text-[#666666]'
            }`}>
              Active now
            </p>
          </div>
        </div>
        <button className={`p-2 rounded-lg transition-colors ${
          theme === 'dark' 
            ? 'hover:bg-[#1a1a1a] text-[#f5f5f5]' 
            : 'hover:bg-[#f5f5f5] text-[#1a1a1a]'
        }`}>
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.sender_id === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                <div className={`rounded-2xl px-4 py-2 ${
                  isOwnMessage
                    ? 'bg-[#009ae9] text-white'
                    : theme === 'dark'
                    ? 'bg-[#1a1a1a] text-[#f5f5f5]'
                    : 'bg-[#f5f5f5] text-[#1a1a1a]'
                }`}>
                  <p className="text-sm">{message.content}</p>
                </div>
                <p className={`text-xs mt-1 ${
                  isOwnMessage ? 'text-right' : 'text-left'
                } ${theme === 'dark' ? 'text-[#b3b3b3]' : 'text-[#666666]'}`}>
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-4 border-t ${
        theme === 'dark' ? 'border-[#2a2a2a]' : 'border-[#e0e0e0]'
      }`}>
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <button
            type="button"
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-[#1a1a1a] text-[#f5f5f5]'
                : 'hover:bg-[#f5f5f5] text-[#1a1a1a]'
            }`}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:border-[#009ae9] ${
              theme === 'dark'
                ? 'bg-[#1a1a1a] border-[#2a2a2a] text-[#f5f5f5] placeholder-[#b3b3b3]'
                : 'bg-white border-[#e0e0e0] text-[#1a1a1a] placeholder-[#666666]'
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-[#1a1a1a] text-[#f5f5f5]'
                : 'hover:bg-[#f5f5f5] text-[#1a1a1a]'
            }`}
          >
            <Smile className="w-5 h-5" />
          </button>
          <button
            type="submit"
            disabled={!newMessage.trim() || isLoading}
            className="p-2 bg-[#009ae9] hover:bg-[#0088d1] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
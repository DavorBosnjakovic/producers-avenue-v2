// File: CreateChoiceModal.tsx
// Path: /src/components/feed/CreateChoiceModal.tsx
// Modal that gives user choice between creating a Post or Story

'use client'

import { useTheme } from '@/lib/contexts/ThemeContext'

interface CreateChoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPost: () => void
  onSelectStory: () => void
}

export default function CreateChoiceModal({ 
  isOpen, 
  onClose, 
  onSelectPost, 
  onSelectStory 
}: CreateChoiceModalProps) {
  const { theme } = useTheme()

  if (!isOpen) return null

  const handleSelect = (type: 'post' | 'story') => {
    if (type === 'post') {
      onSelectPost()
    } else {
      onSelectStory()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative rounded-xl border border-[#009ae9] shadow-[0_0_8px_0_rgba(0,154,233,0.5)] max-w-md w-full mx-4 p-8"
        style={{
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close"
        >
          <svg 
            className="w-5 h-5"
            style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h2 
          className="text-4xl mb-8 text-center"
          style={{
            fontFamily: 'var(--font-heading)',
            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
          }}
        >
          CREATE
        </h2>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Post Option */}
          <button
            onClick={() => handleSelect('post')}
            className="group relative flex flex-col items-center justify-center p-8 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{
              backgroundColor: theme === 'dark' 
                ? 'rgba(26, 26, 26, 0.6)' 
                : 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(12px)',
              borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#009ae9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e0e0e0'
            }}
          >
            {/* Post Icon */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#009ae9] to-[#0076b9] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg 
                className="w-8 h-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            
            {/* Post Label */}
            <span 
              className="text-xl font-semibold"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
            >
              Post
            </span>
            <span 
              className="text-sm mt-2 text-center"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#b3b3b3' : '#666666',
              }}
            >
              Share your thoughts with your followers
            </span>
          </button>

          {/* Story Option */}
          <button
            onClick={() => handleSelect('story')}
            className="group relative flex flex-col items-center justify-center p-8 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{
              backgroundColor: theme === 'dark' 
                ? 'rgba(26, 26, 26, 0.6)' 
                : 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(12px)',
              borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#009ae9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e0e0e0'
            }}
          >
            {/* Story Icon */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#009ae9] to-[#0076b9] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg 
                className="w-8 h-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            
            {/* Story Label */}
            <span 
              className="text-xl font-semibold"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
            >
              Story
            </span>
            <span 
              className="text-sm mt-2 text-center"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#b3b3b3' : '#666666',
              }}
            >
              Share a photo or video that disappears in 24h
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
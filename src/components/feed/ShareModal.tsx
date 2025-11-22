// File: ShareModal.tsx
// Path: /src/components/feed/ShareModal.tsx
// Modal for sharing posts to various platforms

'use client'

import { useTheme } from '@/lib/contexts/ThemeContext'
import { X, Link as LinkIcon, Facebook, Twitter, MessageCircle, Mail } from 'lucide-react'

interface Post {
  id: string
  content: string
  user_profiles: {
    username: string
    display_name: string
  }
}

interface ShareModalProps {
  post: Post
  onClose: () => void
}

export default function ShareModal({ post, onClose }: ShareModalProps) {
  const { theme } = useTheme()
  const postUrl = `${window.location.origin}/post/${post.id}`
  const shareText = `Check out this post by ${post.user_profiles.display_name || post.user_profiles.username} on Producers Avenue!`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      alert('Link copied to clipboard!')
      onClose()
    } catch (error) {
      console.error('Failed to copy link:', error)
      alert('Failed to copy link. Please try again.')
    }
  }

  const handleShareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
    onClose()
  }

  const handleShareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
    onClose()
  }

  const handleShareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + postUrl)}`
    window.open(url, '_blank')
    onClose()
  }

  const handleShareViaEmail = () => {
    const subject = encodeURIComponent('Check out this post on Producers Avenue')
    const body = encodeURIComponent(`${shareText}\n\n${postUrl}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="w-full max-w-md rounded-xl border overflow-hidden"
          style={{
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            borderColor: '#009ae9',
            boxShadow: '0 0 8px 0 rgba(0, 154, 233, 0.5)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0' }}
          >
            <h2 
              className="text-2xl"
              style={{
                fontFamily: 'var(--font-heading)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
              }}
            >
              SHARE POST
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-6 h-6" style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }} />
            </button>
          </div>

          {/* Share Options */}
          <div className="p-6 space-y-3">
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-4 p-4 rounded-lg border transition-all hover:border-[#009ae9]"
              style={{
                backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
                borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0'
              }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#009ae9]">
                <LinkIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p 
                  className="font-semibold"
                  style={{
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)'
                  }}
                >
                  Copy Link
                </p>
                <p 
                  className="text-sm"
                  style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}
                >
                  Copy post link to clipboard
                </p>
              </div>
            </button>

            {/* Facebook */}
            <button
              onClick={handleShareToFacebook}
              className="w-full flex items-center gap-4 p-4 rounded-lg border transition-all hover:border-[#009ae9]"
              style={{
                backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
                borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0'
              }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1877f2]">
                <Facebook className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p 
                  className="font-semibold"
                  style={{
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)'
                  }}
                >
                  Facebook
                </p>
                <p 
                  className="text-sm"
                  style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}
                >
                  Share to Facebook
                </p>
              </div>
            </button>

            {/* Twitter */}
            <button
              onClick={handleShareToTwitter}
              className="w-full flex items-center gap-4 p-4 rounded-lg border transition-all hover:border-[#009ae9]"
              style={{
                backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
                borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0'
              }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1da1f2]">
                <Twitter className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p 
                  className="font-semibold"
                  style={{
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)'
                  }}
                >
                  Twitter
                </p>
                <p 
                  className="text-sm"
                  style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}
                >
                  Share to Twitter
                </p>
              </div>
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleShareToWhatsApp}
              className="w-full flex items-center gap-4 p-4 rounded-lg border transition-all hover:border-[#009ae9]"
              style={{
                backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
                borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0'
              }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#25d366]">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p 
                  className="font-semibold"
                  style={{
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)'
                  }}
                >
                  WhatsApp
                </p>
                <p 
                  className="text-sm"
                  style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}
                >
                  Share via WhatsApp
                </p>
              </div>
            </button>

            {/* Email */}
            <button
              onClick={handleShareViaEmail}
              className="w-full flex items-center gap-4 p-4 rounded-lg border transition-all hover:border-[#009ae9]"
              style={{
                backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
                borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0'
              }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ea4335]">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p 
                  className="font-semibold"
                  style={{
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)'
                  }}
                >
                  Email
                </p>
                <p 
                  className="text-sm"
                  style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}
                >
                  Share via email
                </p>
              </div>
            </button>
          </div>

          {/* Cancel Button */}
          <div className="p-6 pt-0">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                fontFamily: 'var(--font-body)'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
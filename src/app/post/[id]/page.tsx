// File: page.tsx
// Path: /src/app/post/[id]/page.tsx
// Post Detail Page with comments

'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  Send,
  MoreHorizontal
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function PostDetailPage() {
  const { theme } = useTheme()
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [comment, setComment] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likes, setLikes] = useState(247)

  // Mock post data
  const post = {
    id: postId,
    author: {
      id: 'user-1',
      username: 'alexrodriguez',
      displayName: 'Alex Rodriguez',
      avatar: '',
      categories: ['Producer', 'Engineer'],
    },
    content: 'Just finished working on this new beat! Let me know what you think. Been experimenting with some new sounds and techniques. Really proud of how this one turned out. 🎵🔥',
    media: {
      type: 'audio' as const,
      url: '',
    },
    likes: 247,
    comments: 18,
    shares: 12,
    isLiked: false,
    isSaved: false,
    timestamp: '2 hours ago',
  }

  // Mock comments
  const mockComments = Array.from({ length: 8 }, (_, i) => ({
    id: `comment-${i + 1}`,
    author: {
      username: `user${i + 1}`,
      displayName: `User ${i + 1}`,
      avatar: '',
    },
    content: 'This is fire! 🔥 Love the vibes on this one.',
    likes: Math.floor(Math.random() * 50) + 5,
    timestamp: `${i + 1}h ago`,
    isLiked: false,
  }))

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  const handleShare = () => {
    alert('Share functionality')
  }

  const handleComment = () => {
    if (comment.trim() === '') return
    // API call to post comment
    setComment('')
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
      }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 font-medium transition-colors hover:opacity-80"
          style={{
            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
            fontFamily: 'var(--font-body)',
          }}
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Post */}
        <div
          className="rounded-xl p-6 mb-6"
          style={{
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e5e5'}`,
          }}
        >
          {/* Post Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href={`/member/${post.author.username}`}>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: post.author.avatar ? 'transparent' : '#009ae9',
                    color: 'white',
                    backgroundImage: post.author.avatar ? `url(${post.author.avatar})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!post.author.avatar && post.author.displayName.charAt(0).toUpperCase()}
                </div>
              </Link>

              <div>
                <Link href={`/member/${post.author.username}`}>
                  <h3
                    className="font-bold text-base hover:underline"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    }}
                  >
                    {post.author.displayName}
                  </h3>
                </Link>
                <div className="flex items-center gap-2">
                  <p
                    className="text-sm"
                    style={{
                      color: theme === 'dark' ? '#b3b3b3' : '#666666',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    @{post.author.username}
                  </p>
                  <span style={{ color: theme === 'dark' ? '#666666' : '#999999' }}>•</span>
                  <p
                    className="text-sm"
                    style={{
                      color: theme === 'dark' ? '#b3b3b3' : '#666666',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {post.timestamp}
                  </p>
                </div>
              </div>
            </div>

            <button className="p-2 rounded-lg hover:bg-opacity-80 transition-all">
              <MoreHorizontal size={20} style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }} />
            </button>
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <p
              className="text-base leading-relaxed whitespace-pre-wrap"
              style={{
                fontFamily: 'var(--font-body)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
            >
              {post.content}
            </p>
          </div>

          {/* Audio Player (Mock) */}
          {post.media && post.media.type === 'audio' && (
            <div
              className="mb-4 p-4 rounded-lg"
              style={{
                backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
              }}
            >
              <p
                className="text-sm font-medium mb-2"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                Audio Preview
              </p>
              <div className="h-2 rounded-full"
                style={{
                  backgroundColor: theme === 'dark' ? '#3a3a3a' : '#d1d5db',
                }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: '#009ae9',
                    width: '40%',
                  }}
                />
              </div>
            </div>
          )}

          {/* Interaction Buttons */}
          <div className="flex items-center gap-6 pt-4 border-t"
            style={{
              borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
            }}
          >
            <button
              onClick={handleLike}
              className="flex items-center gap-2 transition-all hover:scale-110"
            >
              <Heart
                size={20}
                fill={isLiked ? '#ef4444' : 'none'}
                style={{
                  color: isLiked ? '#ef4444' : theme === 'dark' ? '#b3b3b3' : '#666666',
                }}
              />
              <span
                className="text-sm font-medium"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: isLiked ? '#ef4444' : theme === 'dark' ? '#b3b3b3' : '#666666',
                }}
              >
                {likes}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <MessageCircle
                size={20}
                style={{
                  color: theme === 'dark' ? '#b3b3b3' : '#666666',
                }}
              />
              <span
                className="text-sm font-medium"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#b3b3b3' : '#666666',
                }}
              >
                {mockComments.length}
              </span>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 transition-all hover:scale-110"
            >
              <Share2
                size={20}
                style={{
                  color: theme === 'dark' ? '#b3b3b3' : '#666666',
                }}
              />
              <span
                className="text-sm font-medium"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#b3b3b3' : '#666666',
                }}
              >
                {post.shares}
              </span>
            </button>

            <div className="flex-1" />

            <button
              onClick={handleSave}
              className="transition-all hover:scale-110"
            >
              <Bookmark
                size={20}
                fill={isSaved ? '#009ae9' : 'none'}
                style={{
                  color: isSaved ? '#009ae9' : theme === 'dark' ? '#b3b3b3' : '#666666',
                }}
              />
            </button>
          </div>
        </div>

        {/* Comment Input */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e5e5'}`,
          }}
        >
          <div className="flex gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{
                backgroundColor: '#009ae9',
                color: 'white',
              }}
            >
              A
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(42, 42, 42, 0.6)' : 'rgba(245, 245, 245, 0.6)',
                  borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  fontFamily: 'var(--font-body)',
                }}
              />
              <button
                onClick={handleComment}
                disabled={comment.trim() === ''}
                className="px-4 py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: comment.trim() === '' ? '#666666' : '#009ae9',
                  color: 'white',
                  opacity: comment.trim() === '' ? 0.6 : 1,
                  cursor: comment.trim() === '' ? 'not-allowed' : 'pointer',
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h2
            className="text-xl font-bold mb-4"
            style={{
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
            }}
          >
            Comments ({mockComments.length})
          </h2>

          <div className="space-y-4">
            {mockComments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl p-4"
                style={{
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e5e5'}`,
                }}
              >
                <div className="flex items-start gap-3">
                  <Link href={`/member/${comment.author.username}`}>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: comment.author.avatar ? 'transparent' : '#009ae9',
                        color: 'white',
                        backgroundImage: comment.author.avatar ? `url(${comment.author.avatar})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {!comment.author.avatar && comment.author.displayName.charAt(0).toUpperCase()}
                    </div>
                  </Link>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/member/${comment.author.username}`}>
                        <h4
                          className="font-semibold text-sm hover:underline"
                          style={{
                            fontFamily: 'var(--font-body)',
                            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                          }}
                        >
                          {comment.author.displayName}
                        </h4>
                      </Link>
                      <span
                        className="text-xs"
                        style={{
                          color: theme === 'dark' ? '#b3b3b3' : '#666666',
                        }}
                      >
                        @{comment.author.username}
                      </span>
                      <span style={{ color: theme === 'dark' ? '#666666' : '#999999' }}>•</span>
                      <span
                        className="text-xs"
                        style={{
                          color: theme === 'dark' ? '#b3b3b3' : '#666666',
                        }}
                      >
                        {comment.timestamp}
                      </span>
                    </div>

                    <p
                      className="text-sm mb-2"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      }}
                    >
                      {comment.content}
                    </p>

                    <button
                      className="flex items-center gap-1 text-xs transition-all hover:opacity-80"
                      style={{
                        color: theme === 'dark' ? '#b3b3b3' : '#666666',
                      }}
                    >
                      <Heart size={14} />
                      {comment.likes}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
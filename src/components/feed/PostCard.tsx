// File: PostCard.tsx
// Path: /src/components/feed/PostCard.tsx
// Post card component with interactions

'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { useRouter } from 'next/navigation'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Play,
  Volume2,
  Image as ImageIcon
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface PostProps {
  post: {
    id: string
    author: {
      id: string
      username: string
      displayName: string
      avatar: string
      categories: string[]
    }
    content: string
    media?: {
      type: 'image' | 'audio' | 'video' | null
      url: string
    }
    likes: number
    comments: number
    shares: number
    isLiked: boolean
    isSaved: boolean
    timestamp: string
    poll?: {
      question: string
      options: Array<{ text: string; votes: number }>
      totalVotes: number
      hasVoted: boolean
    }
  }
}

export default function PostCard({ post }: PostProps) {
  const { theme } = useTheme()
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [isSaved, setIsSaved] = useState(post.isSaved)
  const [likes, setLikes] = useState(post.likes)
  const [showMenu, setShowMenu] = useState(false)
  const [selectedPollOption, setSelectedPollOption] = useState<number | null>(null)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsSaved(!isSaved)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Share functionality
    alert('Share functionality')
  }

  const handleCardClick = () => {
    router.push(`/post/${post.id}`)
  }

  const handlePollVote = (optionIndex: number) => {
    if (!post.poll?.hasVoted) {
      setSelectedPollOption(optionIndex)
      // API call to vote
    }
  }

  return (
    <div
      className="rounded-xl p-6 transition-all cursor-pointer hover:shadow-lg"
      style={{
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e5e5'}`,
      }}
      onClick={handleCardClick}
    >
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Author Avatar */}
          <Link 
            href={`/member/${post.author.username}`}
            onClick={(e) => e.stopPropagation()}
          >
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

          {/* Author Info */}
          <div>
            <Link 
              href={`/member/${post.author.username}`}
              onClick={(e) => e.stopPropagation()}
            >
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

        {/* More Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
            style={{
              color: theme === 'dark' ? '#b3b3b3' : '#666666',
            }}
          >
            <MoreHorizontal size={20} />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-10"
              style={{
                backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                border: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e5e5e5'}`,
              }}
            >
              <button
                className="w-full text-left px-4 py-3 hover:bg-opacity-80 transition-colors text-sm"
                style={{
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  fontFamily: 'var(--font-body)',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                }}
              >
                Copy Link
              </button>
              <button
                className="w-full text-left px-4 py-3 hover:bg-opacity-80 transition-colors text-sm"
                style={{
                  color: '#ef4444',
                  fontFamily: 'var(--font-body)',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                }}
              >
                Report Post
              </button>
            </div>
          )}
        </div>
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

      {/* Media */}
      {post.media && post.media.type === 'image' && (
        <div
          className="mb-4 rounded-lg overflow-hidden"
          style={{
            backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
          }}
        >
          <div className="aspect-video relative flex items-center justify-center">
            {post.media.url ? (
              <Image
                src={post.media.url}
                alt="Post media"
                fill
                className="object-cover"
              />
            ) : (
              <ImageIcon size={64} style={{ color: '#666666' }} />
            )}
          </div>
        </div>
      )}

      {post.media && post.media.type === 'audio' && (
        <div
          className="mb-4 p-4 rounded-lg flex items-center gap-4"
          style={{
            backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
          }}
        >
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: '#009ae9',
              color: 'white',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Play size={20} fill="white" />
          </button>
          <div className="flex-1">
            <div
              className="h-2 rounded-full mb-2"
              style={{
                backgroundColor: theme === 'dark' ? '#3a3a3a' : '#d1d5db',
              }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: '#009ae9',
                  width: '30%',
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs"
              style={{
                color: theme === 'dark' ? '#b3b3b3' : '#666666',
              }}
            >
              <span>0:45</span>
              <span>2:30</span>
            </div>
          </div>
          <Volume2 size={20} style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }} />
        </div>
      )}

      {/* Poll */}
      {post.poll && (
        <div className="mb-4">
          <p
            className="text-base font-semibold mb-3"
            style={{
              fontFamily: 'var(--font-body)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
            }}
          >
            {post.poll.question}
          </p>
          <div className="space-y-2">
            {post.poll.options.map((option, index) => {
              const percentage = (option.votes / post.poll!.totalVotes) * 100
              const isSelected = selectedPollOption === index

              return (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePollVote(index)
                  }}
                  className="w-full p-3 rounded-lg relative overflow-hidden transition-all"
                  style={{
                    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
                    border: isSelected ? '2px solid #009ae9' : '2px solid transparent',
                  }}
                  disabled={post.poll.hasVoted}
                >
                  {/* Progress Bar */}
                  <div
                    className="absolute top-0 left-0 h-full transition-all"
                    style={{
                      backgroundColor: 'rgba(0, 154, 233, 0.2)',
                      width: post.poll.hasVoted ? `${percentage}%` : '0%',
                    }}
                  />

                  {/* Option Text */}
                  <div className="relative flex items-center justify-between">
                    <span
                      className="font-medium text-sm"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      }}
                    >
                      {option.text}
                    </span>
                    {post.poll.hasVoted && (
                      <span
                        className="text-sm font-bold"
                        style={{
                          color: '#009ae9',
                        }}
                      >
                        {percentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
          <p
            className="text-xs mt-2"
            style={{
              color: theme === 'dark' ? '#b3b3b3' : '#666666',
              fontFamily: 'var(--font-body)',
            }}
          >
            {post.poll.totalVotes} votes
          </p>
        </div>
      )}

      {/* Interaction Buttons */}
      <div className="flex items-center gap-6 pt-4 border-t"
        style={{
          borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
        }}
      >
        {/* Like */}
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

        {/* Comment */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/post/${post.id}`)
          }}
          className="flex items-center gap-2 transition-all hover:scale-110"
        >
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
            {post.comments}
          </span>
        </button>

        {/* Share */}
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* Save */}
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
  )
}
// File: CommentModal.tsx
// Path: /src/components/feed/CommentModal.tsx
// Modal for viewing and adding comments to posts

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/lib/contexts/ThemeContext'
import Image from 'next/image'
import { X, Send } from 'lucide-react'

interface Post {
  id: string
  user_id: string
  content: string
  created_at: string
  user_profiles: {
    username: string
    display_name: string
    avatar_url: string | null
  }
}

interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  user_profiles: {
    username: string
    display_name: string
    avatar_url: string | null
  }
}

interface CommentModalProps {
  post: Post
  onClose: () => void
  onCommentAdded: () => void
}

export default function CommentModal({ post, onClose, onCommentAdded }: CommentModalProps) {
  const { theme } = useTheme()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadUser()
    loadComments()
  }, [])

  const loadUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const loadComments = async () => {
    try {
      const supabase = createClient()
      
      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', post.id)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false })

      if (commentsError) throw commentsError

      if (!commentsData || commentsData.length === 0) {
        setComments([])
        return
      }

      // Get user profiles for comments
      const userIds = [...new Set(commentsData.map(c => c.user_id))]
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', userIds)

      if (profilesError) throw profilesError

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.user_id, p])
      )

      const commentsWithProfiles = commentsData.map(comment => ({
        ...comment,
        user_profiles: profilesMap.get(comment.user_id) || {
          username: 'unknown',
          display_name: 'Unknown User',
          avatar_url: null
        }
      }))

      setComments(commentsWithProfiles)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setSubmitting(true)

    try {
      const supabase = createClient()

      // Insert comment
      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: newComment.trim()
        })
        .select()
        .single()

      if (commentError) throw commentError

      // Update post comments count
      await supabase
        .from('posts')
        .update({ comments_count: comments.length + 1 })
        .eq('id', post.id)

      setNewComment('')
      onCommentAdded()
      loadComments()
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
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
          className="w-full max-w-2xl max-h-[80vh] rounded-xl border overflow-hidden flex flex-col"
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
              COMMENTS
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-6 h-6" style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }} />
            </button>
          </div>

          {/* Original Post */}
          <div 
            className="p-6 border-b"
            style={{ borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#009ae9] to-[#0076b9] flex-shrink-0">
                {post.user_profiles?.avatar_url ? (
                  <Image
                    src={post.user_profiles.avatar_url}
                    alt={post.user_profiles.display_name || post.user_profiles.username}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                    {post.user_profiles?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p 
                  className="font-semibold mb-1"
                  style={{
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)'
                  }}
                >
                  {post.user_profiles?.display_name || post.user_profiles?.username}
                </p>
                <p 
                  style={{
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)'
                  }}
                >
                  {post.content}
                </p>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <p style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}>
                  No comments yet. Be the first to comment!
                </p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#009ae9] to-[#0076b9] flex-shrink-0">
                    {comment.user_profiles?.avatar_url ? (
                      <Image
                        src={comment.user_profiles.avatar_url}
                        alt={comment.user_profiles.display_name || comment.user_profiles.username}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold">
                        {comment.user_profiles?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p 
                      className="font-semibold text-sm mb-1"
                      style={{
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                        fontFamily: 'var(--font-body)'
                      }}
                    >
                      {comment.user_profiles?.display_name || comment.user_profiles?.username}
                    </p>
                    <p 
                      className="text-sm"
                      style={{
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                        fontFamily: 'var(--font-body)'
                      }}
                    >
                      {comment.content}
                    </p>
                    <p 
                      className="text-xs mt-1"
                      style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}
                    >
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <div 
            className="p-6 border-t"
            style={{ borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0' }}
          >
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                style={{
                  backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                  borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
                }}
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#009ae9',
                  color: '#ffffff',
                  fontFamily: 'var(--font-body)'
                }}
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
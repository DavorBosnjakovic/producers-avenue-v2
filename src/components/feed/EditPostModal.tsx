// File: EditPostModal.tsx
// Path: /src/components/feed/EditPostModal.tsx
// Modal for editing existing posts

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { X, Save } from 'lucide-react'

interface Post {
  id: string
  content: string
  media_urls: string[]
}

interface EditPostModalProps {
  post: Post
  onClose: () => void
  onPostUpdated: () => void
}

export default function EditPostModal({ post, onClose, onPostUpdated }: EditPostModalProps) {
  const { theme } = useTheme()
  const [content, setContent] = useState(post.content)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('posts')
        .update({
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id)

      if (error) throw error

      onPostUpdated()
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Failed to update post. Please try again.')
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
          className="w-full max-w-2xl rounded-xl border overflow-hidden"
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
              EDIT POST
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-6 h-6" style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={8}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9] resize-none"
                style={{
                  backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                  borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  fontFamily: 'var(--font-body)'
                }}
                disabled={submitting}
                required
              />

              {/* Media Preview (if exists) */}
              {post.media_urls && post.media_urls.length > 0 && (
                <div className="mt-4">
                  <p 
                    className="text-sm mb-2"
                    style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}
                  >
                    Note: Media cannot be edited. To change media, delete this post and create a new one.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {post.media_urls.map((url, index) => (
                      <div 
                        key={index}
                        className="aspect-video rounded-lg overflow-hidden border"
                        style={{ borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0' }}
                      >
                        {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img
                            src={url}
                            alt={`Media ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={url}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div 
              className="flex gap-3 p-6 border-t"
              style={{ borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0' }}
            >
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-lg font-semibold transition-all"
                style={{
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  fontFamily: 'var(--font-body)'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!content.trim() || submitting}
                className="flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#009ae9',
                  color: '#ffffff',
                  fontFamily: 'var(--font-body)'
                }}
              >
                <Save className="w-5 h-5" />
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
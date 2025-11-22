// File: CreatePostModal.tsx
// Path: /src/components/feed/CreatePostModal.tsx
// Modal for creating new posts

'use client'

import { useState, useRef } from 'react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { createClient } from '@/lib/supabase/client'
import { 
  X, 
  Image as ImageIcon, 
  Video,
  Send
} from 'lucide-react'
import Image from 'next/image'

interface CreatePostModalProps {
  onClose: () => void
  onPostCreated?: () => void
}

export default function CreatePostModal({ onClose, onPostCreated }: CreatePostModalProps) {
  const { theme } = useTheme()
  const [content, setContent] = useState('')
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([])
  const [isPosting, setIsPosting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_CHARACTERS = 500
  const MAX_MEDIA_FILES = 4
  const characterCount = content.length

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (mediaFiles.length + files.length > MAX_MEDIA_FILES) {
      alert(`You can only upload up to ${MAX_MEDIA_FILES} files`)
      return
    }

    // Create previews
    const newFiles: File[] = []
    const newPreviews: string[] = []

    files.forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        newFiles.push(file)
        
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result as string)
          if (newPreviews.length === files.length) {
            setMediaFiles(prev => [...prev, ...newFiles])
            setMediaPreviews(prev => [...prev, ...newPreviews])
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
    setMediaPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handlePost = async () => {
    if (content.trim() === '' && mediaFiles.length === 0) {
      alert('Please write something or add media')
      return
    }

    setIsPosting(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Upload media files to Supabase Storage
      const mediaUrls: string[] = []

      for (const file of mediaFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('post-media')
          .getPublicUrl(fileName)

        mediaUrls.push(publicUrl)
      }

      // Create post
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          media_urls: mediaUrls.length > 0 ? mediaUrls : null,
          visibility: 'public'
        })

      if (postError) throw postError

      // Success!
      if (onPostCreated) onPostCreated()
      onClose()

    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden border border-[#009ae9] shadow-[0_0_8px_0_rgba(0,154,233,0.5)]"
        style={{
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-4 flex items-center justify-between border-b"
          style={{
            borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
          }}
        >
          <h2
            className="text-xl font-bold"
            style={{
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
            }}
          >
            CREATE POST
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
            style={{
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
            }}
          >
            <X size={20} style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Text Area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-4 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
            rows={6}
            maxLength={MAX_CHARACTERS}
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(42, 42, 42, 0.6)' : 'rgba(245, 245, 245, 0.6)',
              borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              fontFamily: 'var(--font-body)',
            }}
          />

          {/* Character Count */}
          <div className="flex justify-end mt-2">
            <span
              className="text-sm"
              style={{
                fontFamily: 'var(--font-body)',
                color: characterCount > MAX_CHARACTERS - 50
                  ? '#ef4444'
                  : theme === 'dark' ? '#b3b3b3' : '#666666',
              }}
            >
              {characterCount} / {MAX_CHARACTERS}
            </span>
          </div>

          {/* Media Previews */}
          {mediaPreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {mediaPreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{
                      backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
                      aspectRatio: '16/9',
                    }}
                  >
                    {mediaFiles[index].type.startsWith('image/') ? (
                      <Image
                        src={preview}
                        alt={`Media ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <video
                        src={preview}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                  </div>
                  <button
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 p-1 rounded-full"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Media Buttons */}
          {mediaPreviews.length < MAX_MEDIA_FILES && (
            <div className="mt-6 flex items-center gap-2">
              <p
                className="text-sm font-medium mr-2"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#b3b3b3' : '#666666',
                }}
              >
                Add to post:
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-lg hover:bg-opacity-80 transition-all"
                style={{
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
                }}
                title="Add Image/Video"
              >
                <ImageIcon size={20} style={{ color: '#10b981' }} />
              </button>
              <button
                onClick={() => {
                  fileInputRef.current?.setAttribute('accept', 'video/*')
                  fileInputRef.current?.click()
                }}
                className="p-3 rounded-lg hover:bg-opacity-80 transition-all"
                style={{
                  backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
                }}
                title="Add Video"
              >
                <Video size={20} style={{ color: '#ef4444' }} />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-4 flex items-center justify-end gap-3 border-t"
          style={{
            borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
          }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold transition-all"
            style={{
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              fontFamily: 'var(--font-body)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={isPosting || (content.trim() === '' && mediaFiles.length === 0)}
            className="px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
            style={{
              backgroundColor: isPosting || (content.trim() === '' && mediaFiles.length === 0)
                ? '#666666'
                : '#009ae9',
              color: 'white',
              fontFamily: 'var(--font-body)',
              opacity: isPosting || (content.trim() === '' && mediaFiles.length === 0) ? 0.6 : 1,
              cursor: isPosting || (content.trim() === '' && mediaFiles.length === 0) ? 'not-allowed' : 'pointer',
            }}
          >
            <Send size={18} />
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  )
}
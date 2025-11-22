// File: AddStoryModal.tsx
// Path: /src/components/feed/AddStoryModal.tsx
// Modal for creating new stories

'use client'

import { useState, useRef } from 'react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { createClient } from '@/lib/supabase/client'
import { X, Image as ImageIcon, Video, Type } from 'lucide-react'
import Image from 'next/image'

interface AddStoryModalProps {
  onClose: () => void
  currentUserId: string
  onStoryCreated?: () => void
}

export default function AddStoryModal({ onClose, currentUserId, onStoryCreated }: AddStoryModalProps) {
  const { theme } = useTheme()
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string>('')
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
  const [caption, setCaption] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const MAX_CAPTION_LENGTH = 150
  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      alert('File size must be less than 50MB')
      return
    }

    // Check file type
    const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null
    if (!type) {
      alert('Please select an image or video file')
      return
    }

    setMediaFile(file)
    setMediaType(type)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setMediaPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveMedia = () => {
    setMediaFile(null)
    setMediaPreview('')
    setMediaType(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (!mediaFile || !mediaType) {
      alert('Please select a photo or video')
      return
    }

    setIsUploading(true)

    try {
      const supabase = createClient()

      // Upload media to Supabase Storage
      const fileExt = mediaFile.name.split('.').pop()
      const fileName = `${currentUserId}/${Date.now()}.${fileExt}`
      const bucketName = 'stories'

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, mediaFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName)

      // Calculate duration (default 5 seconds for images)
      let duration = 5
      if (mediaType === 'video' && videoRef.current) {
        duration = Math.ceil(videoRef.current.duration) || 5
      }

      // Create story record in Supabase
      const { error: storyError } = await supabase
        .from('stories')
        .insert({
          user_id: currentUserId,
          media_url: publicUrl,
          media_type: mediaType,
          thumbnail_url: publicUrl, // Use same URL for thumbnail (can be optimized later)
          caption: caption.trim() || null,
          duration: duration,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        })

      if (storyError) throw storyError

      // Success!
      if (onStoryCreated) onStoryCreated()
      onClose()
    } catch (error) {
      console.error('Error uploading story:', error)
      alert('Failed to upload story. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-[#009ae9] shadow-[0_0_8px_0_rgba(0,154,233,0.5)] overflow-hidden"
        style={{
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between border-b flex-shrink-0"
          style={{
            borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
          }}
        >
          <h2
            className="text-2xl font-bold"
            style={{
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
            }}
          >
            CREATE STORY
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all hover:opacity-70"
            style={{
              backgroundColor: 'transparent',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {!mediaFile ? (
            // Upload prompt
            <div className="space-y-6">
              <p
                className="text-center text-base mb-8"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: theme === 'dark' ? '#b3b3b3' : '#666666',
                }}
              >
                Share a photo or video to your story. It will be visible for 24 hours.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Main Upload Area */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-12 rounded-xl border-2 border-dashed transition-all hover:border-[#009ae9] hover:bg-opacity-50"
                style={{
                  borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                  backgroundColor: theme === 'dark' ? 'rgba(42, 42, 42, 0.3)' : 'rgba(245, 245, 245, 0.3)',
                }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: '#009ae9',
                    }}
                  >
                    <ImageIcon size={40} style={{ color: 'white' }} />
                  </div>
                  <div className="text-center">
                    <p
                      className="font-bold text-lg mb-2"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      }}
                    >
                      Choose Photo or Video
                    </p>
                    <p
                      className="text-sm"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#b3b3b3' : '#666666',
                      }}
                    >
                      Max file size: 50MB
                    </p>
                  </div>
                </div>
              </button>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    fileInputRef.current?.setAttribute('accept', 'image/*')
                    fileInputRef.current?.click()
                  }}
                  className="p-6 rounded-lg transition-all hover:opacity-80"
                  style={{
                    backgroundColor: theme === 'dark' 
                      ? 'rgba(26, 26, 26, 0.6)' 
                      : 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(12px)',
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                    border: '1px solid',
                  }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <ImageIcon size={32} style={{ color: '#10b981' }} />
                    <span
                      className="text-base font-semibold"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      }}
                    >
                      Photo
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    fileInputRef.current?.setAttribute('accept', 'video/*')
                    fileInputRef.current?.click()
                  }}
                  className="p-6 rounded-lg transition-all hover:opacity-80"
                  style={{
                    backgroundColor: theme === 'dark' 
                      ? 'rgba(26, 26, 26, 0.6)' 
                      : 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(12px)',
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                    border: '1px solid',
                  }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Video size={32} style={{ color: '#ef4444' }} />
                    <span
                      className="text-base font-semibold"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      }}
                    >
                      Video
                    </span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            // Preview and caption
            <div className="space-y-6">
              {/* Media Preview */}
              <div
                className="relative rounded-xl overflow-hidden"
                style={{
                  backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f5f5f5',
                  aspectRatio: '9/16',
                  maxHeight: '50vh',
                }}
              >
                {mediaType === 'image' && mediaPreview ? (
                  <Image
                    src={mediaPreview}
                    alt="Story preview"
                    fill
                    className="object-contain"
                  />
                ) : mediaType === 'video' && mediaPreview ? (
                  <video
                    ref={videoRef}
                    src={mediaPreview}
                    className="w-full h-full object-contain"
                    controls
                    playsInline
                  />
                ) : null}

                {/* Remove button */}
                <button
                  onClick={handleRemoveMedia}
                  className="absolute top-3 right-3 p-2 rounded-full transition-all hover:opacity-80"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Caption Input */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Type size={20} style={{ color: '#009ae9' }} />
                  <label
                    className="text-base font-semibold"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    }}
                  >
                    Add Caption (Optional)
                  </label>
                </div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION_LENGTH))}
                  placeholder="Write a caption..."
                  className="w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#009ae9]"
                  rows={3}
                  maxLength={MAX_CAPTION_LENGTH}
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgba(42, 42, 42, 0.6)' : 'rgba(245, 245, 245, 0.6)',
                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    fontFamily: 'var(--font-body)',
                  }}
                />
                <div className="flex justify-end mt-2">
                  <span
                    className="text-sm"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: caption.length > MAX_CAPTION_LENGTH - 20
                        ? '#ef4444'
                        : theme === 'dark' ? '#b3b3b3' : '#666666',
                    }}
                  >
                    {caption.length} / {MAX_CAPTION_LENGTH}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {mediaFile && (
          <div
            className="px-6 py-4 flex items-center justify-end gap-3 border-t flex-shrink-0"
            style={{
              borderColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
            }}
          >
            <button
              onClick={handleRemoveMedia}
              className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-80"
              style={{
                backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                fontFamily: 'var(--font-body)',
              }}
            >
              Change
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="px-6 py-3 rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: isUploading ? '#666666' : '#009ae9',
                color: 'white',
                fontFamily: 'var(--font-body)',
                opacity: isUploading ? 0.6 : 1,
                cursor: isUploading ? 'not-allowed' : 'pointer',
              }}
            >
              {isUploading ? 'Uploading...' : 'Share to Story'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
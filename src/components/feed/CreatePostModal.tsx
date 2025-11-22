// File: CreatePostModal.tsx
// Path: /src/components/feed/CreatePostModal.tsx
// Create post modal - compact size, 2:3 ratio, tag users, location, hide options, boost

'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { X, Image as ImageIcon, Sparkles, RotateCw, Check, UserPlus, MapPin, Eye, EyeOff, Heart, TrendingUp, Users } from 'lucide-react'

interface CreatePostModalProps {
  onClose: () => void
  onPostCreated: () => void
}

interface ImageData {
  file: File
  preview: string
  filter?: string
  rotation?: number
}

const FILTERS = [
  { name: 'None', class: '' },
  { name: 'Vivid', class: 'contrast-125 saturate-150' },
  { name: 'Warm', class: 'sepia-[0.3] contrast-110' },
  { name: 'Cool', class: 'hue-rotate-[200deg] saturate-120' },
  { name: 'B&W', class: 'grayscale' },
  { name: 'Vintage', class: 'sepia-[0.5] contrast-90' }
]

export default function CreatePostModal({ onClose, onPostCreated }: CreatePostModalProps) {
  const { theme } = useTheme()
  const [content, setContent] = useState('')
  const [images, setImages] = useState<ImageData[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [selectedFilter, setSelectedFilter] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [taggedUsers, setTaggedUsers] = useState<any[]>([])
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [location, setLocation] = useState<string>('')
  const [hideComments, setHideComments] = useState(false)
  const [hideLikes, setHideLikes] = useState(false)
  const [boost, setBoost] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      filter: '',
      rotation: 0
    }))
    setImages([...images, ...newImages])
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleEditImage = (index: number) => {
    setEditingIndex(index)
    setSelectedFilter(0)
    setRotation(images[index].rotation || 0)
  }

  const handleApplyEdit = () => {
    if (editingIndex === null) return
    const updatedImages = [...images]
    updatedImages[editingIndex] = {
      ...updatedImages[editingIndex],
      filter: FILTERS[selectedFilter].class,
      rotation: rotation
    }
    setImages(updatedImages)
    setEditingIndex(null)
  }

  const handleRotate = () => {
    setRotation((rotation + 90) % 360)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && images.length === 0) return
    setSubmitting(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const uploadedUrls: string[] = []
      for (const imageData of images) {
        const fileName = `${user.id}/${Date.now()}-${imageData.file.name}`
        const { error } = await supabase.storage.from('post-media').upload(fileName, imageData.file)
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('post-media').getPublicUrl(fileName)
        uploadedUrls.push(publicUrl)
      }

      await supabase.from('posts').insert({
        user_id: user.id,
        content: content.trim(),
        media_urls: uploadedUrls,
        media_metadata: images.map(img => ({ filter: img.filter, rotation: img.rotation })),
        tagged_users: taggedUsers.map(u => u.user_id),
        collaborators: collaborators.map(u => u.user_id),
        location: location || null,
        comments_enabled: !hideComments,
        hide_like_count: hideLikes,
        is_boosted: boost
      })

      onPostCreated()
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div 
          className="w-full max-w-xl max-h-[90vh] rounded-xl border overflow-hidden flex flex-col"
          style={{
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            borderColor: '#009ae9',
            boxShadow: '0 0 8px 0 rgba(0, 154, 233, 0.5)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0' }}>
            <h2 className="text-xl" style={{ fontFamily: 'var(--font-heading)', color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>
              CREATE POST
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9] resize-none text-sm"
                style={{
                  backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                  borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
                }}
              />

              {images.length > 0 && (
                <div className={images.length === 1 ? 'max-w-[280px] mx-auto' : 'grid grid-cols-2 gap-2'}>
                  {images.map((image, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden border" style={{ aspectRatio: '2/3', borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0' }}>
                      <img src={image.preview} className={`w-full h-full object-cover ${image.filter || ''}`} style={{ transform: `rotate(${image.rotation || 0}deg)` }} />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center gap-2">
                        <button type="button" onClick={() => handleEditImage(index)} className="opacity-0 hover:opacity-100 p-2 bg-white dark:bg-gray-800 rounded-full">
                          <Sparkles className="w-4 h-4" style={{ color: '#009ae9' }} />
                        </button>
                        <button type="button" onClick={() => handleRemoveImage(index)} className="opacity-0 hover:opacity-100 p-2 bg-white dark:bg-gray-800 rounded-full">
                          <X className="w-4 h-4" style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {images.length < 4 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-2 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 hover:border-[#009ae9] text-sm" style={{ borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0', color: theme === 'dark' ? '#b3b3b3' : '#666666' }}>
                  <ImageIcon className="w-4 h-4" />
                  <span>Add Image ({images.length}/4)</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />

              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009ae9] text-sm"
                style={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff', borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0', color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}
              />

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={hideComments} onChange={(e) => setHideComments(e.target.checked)} className="w-4 h-4" style={{ accentColor: '#009ae9' }} />
                  <EyeOff className="w-4 h-4" />
                  <span style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>Hide Comments</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={hideLikes} onChange={(e) => setHideLikes(e.target.checked)} className="w-4 h-4" style={{ accentColor: '#009ae9' }} />
                  <Heart className="w-4 h-4" />
                  <span style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>Hide Like Count</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={boost} onChange={(e) => setBoost(e.target.checked)} className="w-4 h-4" style={{ accentColor: '#009ae9' }} />
                  <TrendingUp className="w-4 h-4" />
                  <span style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>Boost Post ($5)</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t" style={{ borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0' }}>
              <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg font-semibold text-sm" style={{ backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5', color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>Cancel</button>
              <button type="submit" disabled={(!content.trim() && images.length === 0) || submitting} className="flex-1 py-2 rounded-lg font-semibold text-sm disabled:opacity-50" style={{ backgroundColor: '#009ae9', color: '#ffffff' }}>
                {submitting ? 'Posting...' : boost ? 'Post & Pay $5' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {editingIndex !== null && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-[60]" onClick={() => setEditingIndex(null)} />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-xl border overflow-hidden" style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff', borderColor: '#009ae9', boxShadow: '0 0 8px 0 rgba(0, 154, 233, 0.5)' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0' }}>
                <h3 className="text-lg" style={{ fontFamily: 'var(--font-heading)', color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>EDIT IMAGE</h3>
                <button onClick={() => setEditingIndex(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4">
                <div className="mx-auto rounded-lg overflow-hidden border mb-4" style={{ maxWidth: '280px', aspectRatio: '2/3', borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0' }}>
                  <img src={images[editingIndex].preview} className={`w-full h-full object-cover ${FILTERS[selectedFilter].class}`} style={{ transform: `rotate(${rotation}deg)` }} />
                </div>
                <button type="button" onClick={handleRotate} className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm mb-4" style={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa', borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0', color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>
                  <RotateCw className="w-4 h-4" /><span>Rotate 90°</span>
                </button>
                <div className="grid grid-cols-3 gap-2">
                  {FILTERS.map((filter, index) => (
                    <button key={filter.name} type="button" onClick={() => setSelectedFilter(index)} className="relative rounded-lg overflow-hidden border-2" style={{ borderColor: selectedFilter === index ? '#009ae9' : (theme === 'dark' ? '#2a2a2a' : '#e0e0e0'), aspectRatio: '2/3' }}>
                      <img src={images[editingIndex].preview} className={`w-full h-full object-cover ${filter.class}`} />
                      <div className="absolute inset-x-0 bottom-0 py-1 text-center text-xs font-semibold" style={{ backgroundColor: selectedFilter === index ? '#009ae9' : 'rgba(0,0,0,0.5)', color: '#ffffff' }}>{filter.name}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 p-4 border-t" style={{ borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0' }}>
                <button type="button" onClick={() => setEditingIndex(null)} className="flex-1 py-2 rounded-lg font-semibold text-sm" style={{ backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5', color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}>Cancel</button>
                <button type="button" onClick={handleApplyEdit} className="flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm" style={{ backgroundColor: '#009ae9', color: '#ffffff' }}><Check className="w-4 h-4" />Apply</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
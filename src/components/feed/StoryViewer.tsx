// File: StoryViewer.tsx
// Path: /src/components/feed/StoryViewer.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface Story {
  id: string
  user_id: string
  username: string
  display_name: string
  avatar_url: string | null
  media_url: string
  media_type: 'image' | 'video'
  thumbnail_url: string | null
  caption: string | null
  duration: number
  views_count: number
  created_at: string
  expires_at: string
  has_viewed: boolean
}

interface UserStories {
  user_id: string
  username: string
  display_name: string
  avatar_url: string | null
  stories: Story[]
  has_viewed: boolean
  story_count: number
}

interface StoryViewerProps {
  userStories: UserStories
  startIndex: number
  onClose: () => void
  currentUserId: string
}

export default function StoryViewer({ userStories, startIndex, onClose, currentUserId }: StoryViewerProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(startIndex)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout>()

  const currentStory = userStories.stories[currentStoryIndex]
  const isVideo = currentStory.media_type === 'video'
  const duration = isVideo && videoRef.current ? videoRef.current.duration * 1000 : currentStory.duration * 1000

  useEffect(() => {
    markAsViewed(currentStory.id)
  }, [currentStoryIndex])

  useEffect(() => {
    if (isPaused) return
    const progressIncrement = 100 / (duration / 50)
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext()
          return 0
        }
        return prev + progressIncrement
      })
    }, 50)
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [currentStoryIndex, duration, isPaused])

  const markAsViewed = async (storyId: string) => {
    try {
      const supabase = createClient()
      await supabase.from('story_views').insert({ story_id: storyId, viewer_id: currentUserId })
    } catch (error) {
      console.error('Error marking story as viewed:', error)
    }
  }

  const handleNext = () => {
    if (currentStoryIndex < userStories.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1)
      setProgress(0)
    } else {
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1)
      setProgress(0)
    }
  }

  const handlePause = () => {
    setIsPaused(true)
    if (videoRef.current) videoRef.current.pause()
  }

  const handleResume = () => {
    setIsPaused(false)
    if (videoRef.current) videoRef.current.play()
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const posted = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - posted.getTime()) / 60000)
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h`
    return '1d'
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
        {userStories.stories.map((_, index) => (
          <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-100" style={{ width: index < currentStoryIndex ? '100%' : index === currentStoryIndex ? `${progress}%` : '0%' }} />
          </div>
        ))}
      </div>

      <div className="absolute top-4 left-0 right-0 z-10 flex items-center justify-between px-4 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
            {userStories.avatar_url ? (
              <Image src={userStories.avatar_url} alt={userStories.display_name} width={32} height={32} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-xs">
                {userStories.display_name[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{userStories.display_name}</p>
            <p className="text-white/70 text-xs">{getTimeAgo(currentStory.created_at)}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white hover:text-white/70 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="w-full h-full flex items-center justify-center" onMouseDown={handlePause} onMouseUp={handleResume} onTouchStart={handlePause} onTouchEnd={handleResume}>
        {isVideo ? (
          <video ref={videoRef} src={currentStory.media_url} className="max-w-full max-h-full object-contain" autoPlay playsInline onLoadedMetadata={() => { if (videoRef.current) setProgress(0) }} onEnded={handleNext} />
        ) : (
          <Image src={currentStory.media_url} alt="Story" width={1080} height={1920} className="max-w-full max-h-full object-contain" priority />
        )}
      </div>

      {currentStory.caption && (
        <div className="absolute bottom-20 left-0 right-0 z-10 px-4">
          <p className="text-white text-center text-sm bg-black/50 rounded-lg py-2 px-4">{currentStory.caption}</p>
        </div>
      )}

      <div className="absolute inset-0 flex">
        <button onClick={handlePrevious} className="flex-1" disabled={currentStoryIndex === 0} />
        <button onClick={handleNext} className="flex-1" />
      </div>

      {currentStory.user_id !== currentUserId && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <input type="text" placeholder={`Reply to ${userStories.display_name}...`} className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-full text-white placeholder-white/60 focus:outline-none focus:border-white/50 backdrop-blur-sm" onFocus={handlePause} onBlur={handleResume} />
        </div>
      )}

      {currentStory.user_id === currentUserId && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-black/50 rounded-full px-3 py-2">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-white text-sm font-medium">{currentStory.views_count}</span>
        </div>
      )}
    </div>
  )
}
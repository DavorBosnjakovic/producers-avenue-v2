// File: StoryRing.tsx
// Path: /src/components/feed/StoryRing.tsx

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import AddStoryModal from './AddStoryModal'

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
  story_count: number
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

interface StoryRingProps {
  currentUserId: string
  onStoryClick: (userStories: UserStories, startIndex?: number) => void
}

export default function StoryRing({ currentUserId, onStoryClick }: StoryRingProps) {
  const [userStories, setUserStories] = useState<UserStories[]>([])
  const [currentUserStories, setCurrentUserStories] = useState<UserStories | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddStoryModal, setShowAddStoryModal] = useState(false)

  useEffect(() => {
    loadStories()
  }, [currentUserId])

  const loadStories = async () => {
    try {
      const supabase = createClient()
      const { data: stories, error } = await supabase.rpc('get_feed_stories', { requesting_user_id: currentUserId })
      if (error) throw error

      const grouped = stories?.reduce((acc: { [key: string]: UserStories }, story: Story) => {
        if (!acc[story.user_id]) {
          acc[story.user_id] = {
            user_id: story.user_id,
            username: story.username,
            display_name: story.display_name,
            avatar_url: story.avatar_url,
            stories: [],
            has_viewed: true,
            story_count: story.story_count
          }
        }
        acc[story.user_id].stories.push(story)
        if (!story.has_viewed) acc[story.user_id].has_viewed = false
        return acc
      }, {})

      const userStoriesArray = grouped ? Object.values(grouped) : []
      const currentUser = userStoriesArray.find(us => us.user_id === currentUserId)
      const otherUsers = userStoriesArray.filter(us => us.user_id !== currentUserId)
      
      setCurrentUserStories(currentUser || null)
      setUserStories(otherUsers)
    } catch (error) {
      console.error('Error loading stories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
        <button
          onClick={() => currentUserStories ? onStoryClick(currentUserStories, 0) : setShowAddStoryModal(true)}
          className="flex-shrink-0 flex flex-col items-center gap-1"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-[#009ae9] p-[2px]">
              <div className="w-full h-full rounded-full bg-white dark:bg-[#1a1a1a] p-[2px] flex items-center justify-center">
                {currentUserStories ? (
                  <div className="w-full h-full rounded-full overflow-hidden">
                    {currentUserStories.avatar_url ? (
                      <Image src={currentUserStories.avatar_url} alt="Your story" width={60} height={60} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-xl">
                        {currentUserStories.display_name[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            {!currentUserStories && (
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#009ae9] rounded-full border-2 border-white dark:border-[#1a1a1a] flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            )}
          </div>
          <span className="text-xs text-gray-900 dark:text-white max-w-[70px] truncate">
            {currentUserStories ? 'Your Story' : 'Add Story'}
          </span>
        </button>

        {userStories.map((userStory) => (
          <button key={userStory.user_id} onClick={() => onStoryClick(userStory, 0)} className="flex-shrink-0 flex flex-col items-center gap-1">
            <div className="relative">
              <div className={`w-16 h-16 rounded-full p-[2px] ${userStory.has_viewed ? 'bg-gray-300 dark:bg-gray-600' : 'bg-[#009ae9]'}`}>
                <div className="w-full h-full rounded-full bg-white dark:bg-[#1a1a1a] p-[2px] flex items-center justify-center">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    {userStory.avatar_url ? (
                      <Image src={userStory.avatar_url} alt={userStory.display_name} width={60} height={60} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-xl">
                        {userStory.display_name[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {userStory.story_count > 1 && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-[#009ae9] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-white dark:border-[#1a1a1a]">
                  {userStory.story_count}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-900 dark:text-white max-w-[70px] truncate">{userStory.display_name}</span>
          </button>
        ))}

        {userStories.length === 0 && !currentUserStories && (
          <div className="flex-1 flex items-center justify-center py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">No stories yet. Be the first to share!</p>
          </div>
        )}
      </div>

      {/* Add Story Modal */}
      {showAddStoryModal && (
        <AddStoryModal
          onClose={() => setShowAddStoryModal(false)}
          currentUserId={currentUserId}
          onStoryCreated={() => {
            setShowAddStoryModal(false)
            loadStories() // Reload stories after creating new one
          }}
        />
      )}
    </>
  )
}
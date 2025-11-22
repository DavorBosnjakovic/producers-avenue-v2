// File: page.tsx
// Path: /src/app/(protected)/feed/page.tsx
// Instagram-like feed with stories and suggestions

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/contexts/ThemeContext'
import Image from 'next/image'
import StoryRing from '@/components/feed/StoryRing'
import StoryViewer from '@/components/feed/StoryViewer'
import SuggestedUsers from '@/components/feed/SuggestedUsers'
import CreatePostModal from '@/components/feed/CreatePostModal'

interface Post {
  id: string
  user_id: string
  content: string
  media_urls: string[]
  created_at: string
  user_profiles: {
    username: string
    display_name: string
    avatar_url: string | null
  }
  post_likes: { count: number }[]
  post_comments: { count: number }[]
}

interface UserStories {
  user_id: string
  username: string
  display_name: string
  avatar_url: string | null
  stories: any[]
  has_viewed: boolean
  story_count: number
}

export default function FeedPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showStoryViewer, setShowStoryViewer] = useState(false)
  const [selectedStories, setSelectedStories] = useState<UserStories | null>(null)
  const [storyStartIndex, setStoryStartIndex] = useState(0)
  const [showCreatePostModal, setShowCreatePostModal] = useState(false)

  useEffect(() => {
    checkUser()
    loadFeed()
  }, [])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }
    
    setUser(user)
  }

  const loadFeed = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user_profiles (
            username,
            display_name,
            avatar_url
          ),
          post_likes (count),
          post_comments (count)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      
      setPosts(data || [])
    } catch (error) {
      console.error('Error loading feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStoryClick = (userStories: UserStories, startIndex: number) => {
    setSelectedStories(userStories)
    setStoryStartIndex(startIndex)
    setShowStoryViewer(true)
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const posted = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - posted.getTime()) / 60000)
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d`
    return new Date(timestamp).toLocaleDateString()
  }

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009ae9] mx-auto mb-4"></div>
          <p style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}>
            Loading feed...
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div 
        className="min-h-screen pb-20"
        style={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Feed Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Stories Section */}
              <div 
                className="rounded-xl border p-4"
                style={{
                  backgroundColor: theme === 'dark' 
                    ? 'rgba(26, 26, 26, 0.6)' 
                    : 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(12px)',
                  borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                }}
              >
                <StoryRing 
                  currentUserId={user?.id || ''} 
                  onStoryClick={handleStoryClick}
                />
              </div>

              {/* Create Post Card */}
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-[0_0_8px_0_rgba(0,154,233,0.5)] border border-[#009ae9] p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    {user?.user_metadata?.avatar_url ? (
                      <Image
                        src={user.user_metadata.avatar_url}
                        alt="Your avatar"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#009ae9] to-[#0076b9] flex items-center justify-center text-white font-semibold">
                        {user?.email?.[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <button
                      onClick={() => setShowCreatePostModal(true)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-left text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      What's on your mind?
                    </button>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setShowCreatePostModal(true)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          title="Add image"
                        >
                          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => setShowCreatePostModal(true)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          title="Add video"
                        >
                          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                      <button 
                        onClick={() => setShowCreatePostModal(true)}
                        className="btn btn-primary px-6 py-2"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts Feed */}
              <div className="space-y-6">
                {posts.length === 0 ? (
                  <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-[0_0_8px_0_rgba(0,154,233,0.5)] border border-[#009ae9] p-12 text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      No posts yet. Be the first to share something!
                    </p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-[0_0_8px_0_rgba(0,154,233,0.5)] border border-[#009ae9] p-6"
                    >
                      {/* Post Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            {post.user_profiles.avatar_url ? (
                              <Image
                                src={post.user_profiles.avatar_url}
                                alt={post.user_profiles.display_name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#009ae9] to-[#0076b9] flex items-center justify-center text-white font-semibold">
                                {post.user_profiles.display_name[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {post.user_profiles.display_name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {getTimeAgo(post.created_at)}
                            </p>
                          </div>
                        </div>
                        <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>

                      {/* Post Content */}
                      <p className="text-gray-900 dark:text-white mb-4 whitespace-pre-wrap" style={{ fontFamily: 'var(--font-body)' }}>
                        {post.content}
                      </p>

                      {/* Post Media (if any) */}
                      {post.media_urls && post.media_urls.length > 0 && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <Image
                            src={post.media_urls[0]}
                            alt="Post media"
                            width={800}
                            height={600}
                            className="w-full object-cover"
                          />
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#009ae9] transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="text-sm font-semibold">0</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#009ae9] transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-sm font-semibold">0</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#009ae9] transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                        <button className="ml-auto text-gray-600 dark:text-gray-400 hover:text-[#009ae9] transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sidebar Column (Desktop only) */}
            <div className="hidden lg:block space-y-6">
              
              {/* Suggested Users */}
              <div 
                className="rounded-xl border p-4"
                style={{
                  backgroundColor: theme === 'dark' 
                    ? 'rgba(26, 26, 26, 0.6)' 
                    : 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(12px)',
                  borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                }}
              >
                <SuggestedUsers currentUserId={user?.id || ''} limit={5} />
              </div>

              {/* Footer Links */}
              <div 
                className="text-xs space-y-2"
                style={{ color: theme === 'dark' ? '#666666' : '#999999' }}
              >
                <div className="flex flex-wrap gap-2">
                  <a href="/about" className="hover:text-[#009ae9] transition-colors">About</a>
                  <span>·</span>
                  <a href="/help" className="hover:text-[#009ae9] transition-colors">Help</a>
                  <span>·</span>
                  <a href="/terms" className="hover:text-[#009ae9] transition-colors">Terms</a>
                  <span>·</span>
                  <a href="/privacy" className="hover:text-[#009ae9] transition-colors">Privacy</a>
                </div>
                <p>© 2025 Producers Avenue</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Story Viewer Modal */}
      {showStoryViewer && selectedStories && (
        <StoryViewer
          userStories={selectedStories}
          startIndex={storyStartIndex}
          onClose={() => setShowStoryViewer(false)}
          currentUserId={user?.id || ''}
        />
      )}

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <CreatePostModal
          onClose={() => setShowCreatePostModal(false)}
          onPostCreated={() => {
            setShowCreatePostModal(false)
            loadFeed() // Reload feed after creating post
          }}
        />
      )}

      {/* Custom CSS */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}
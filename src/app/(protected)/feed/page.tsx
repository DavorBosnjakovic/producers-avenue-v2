// File: page.tsx
// Path: /src/app/(protected)/feed/page.tsx
// Instagram-like feed with complete functionality - UPDATED

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/contexts/ThemeContext'
import Image from 'next/image'
import { Heart, MessageCircle, Share2, MoreVertical, Flag, EyeOff, Link as LinkIcon, Edit, MessageSquareOff, X, Trash } from 'lucide-react'
import StoryRing from '@/components/feed/StoryRing'
import StoryViewer from '@/components/feed/StoryViewer'
import SuggestedUsers from '@/components/feed/SuggestedUsers'
import CreatePostModal from '@/components/feed/CreatePostModal'
import CommentModal from '@/components/feed/CommentModal'
import ShareModal from '@/components/feed/ShareModal'
import ReportModal from '@/components/feed/ReportModal'
import EditPostModal from '@/components/feed/EditPostModal'

interface Post {
  id: string
  user_id: string
  content: string
  media_urls: string[]
  media_metadata?: Array<{
    filter?: string
    rotation?: number
  }>
  created_at: string
  likes_count: number
  comments_count: number
  shares_count: number
  comments_enabled: boolean
  user_profiles: {
    username: string
    display_name: string
    avatar_url: string | null
  }
  is_liked?: boolean
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
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showEditPostModal, setShowEditPostModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadFeed()
    }
  }, [user])

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
      
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (postsError) throw postsError
      if (!postsData || postsData.length === 0) {
        setPosts([])
        return
      }

      // Get unique user IDs
      const userIds = [...new Set(postsData.map(p => p.user_id).filter(Boolean))]
      
      // Fetch user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', userIds)

      if (profilesError) throw profilesError

      // Create a map of user profiles
      const profilesMap = new Map(
        (profilesData || []).map(p => [p.user_id, p])
      )

      // Check which posts the current user has liked
      const postIds = postsData.map(p => p.id)
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds)

      const likedPostIds = new Set((likesData || []).map(l => l.post_id))

      // Combine posts with profiles and like status
      const postsWithProfiles = postsData.map(post => ({
        ...post,
        user_profiles: profilesMap.get(post.user_id) || {
          username: 'unknown',
          display_name: 'Unknown User',
          avatar_url: null
        },
        is_liked: likedPostIds.has(post.id),
        comments_enabled: post.comments_enabled ?? true
      }))
      
      setPosts(postsWithProfiles)
    } catch (error) {
      console.error('Error loading feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) return

    const supabase = createClient()
    const post = posts.find(p => p.id === postId)
    if (!post) return

    try {
      if (post.is_liked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)

        await supabase
          .from('posts')
          .update({ likes_count: Math.max(0, post.likes_count - 1) })
          .eq('id', postId)

        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, is_liked: false, likes_count: Math.max(0, p.likes_count - 1) }
            : p
        ))
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id })

        await supabase
          .from('posts')
          .update({ likes_count: post.likes_count + 1 })
          .eq('id', postId)

        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, is_liked: true, likes_count: p.likes_count + 1 }
            : p
        ))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleComment = (post: Post) => {
    setSelectedPost(post)
    setShowCommentModal(true)
  }

  const handleShare = (post: Post) => {
    setSelectedPost(post)
    setShowShareModal(true)
  }

  const handleReport = (post: Post) => {
    setSelectedPost(post)
    setShowReportModal(true)
    setOpenMenuPostId(null)
  }

  const handleNotInterested = async (postId: string) => {
    // Hide post from feed
    setPosts(posts.filter(p => p.id !== postId))
    setOpenMenuPostId(null)
    
    // You can optionally save this preference to database
    // For now, just removing from UI
  }

  const handleCopyLink = async (post: Post) => {
    const url = `${window.location.origin}/post/${post.id}`
    await navigator.clipboard.writeText(url)
    alert('Link copied to clipboard!')
    setOpenMenuPostId(null)
  }

  const handleEdit = (post: Post) => {
    setSelectedPost(post)
    setShowEditPostModal(true)
    setOpenMenuPostId(null)
  }

  const handleToggleComments = async (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return

    const supabase = createClient()
    const newCommentsEnabled = !post.comments_enabled

    try {
      await supabase
        .from('posts')
        .update({ comments_enabled: newCommentsEnabled })
        .eq('id', postId)

      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, comments_enabled: newCommentsEnabled }
          : p
      ))
      
      setOpenMenuPostId(null)
    } catch (error) {
      console.error('Error toggling comments:', error)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    const supabase = createClient()
    
    try {
      // Delete the post from database
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      // Remove from UI
      setPosts(posts.filter(p => p.id !== postId))
      setOpenMenuPostId(null)
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post. Please try again.')
    }
  }

  const handleStoryClick = (userStories: UserStories, startIndex: number) => {
    setSelectedStories(userStories)
    setStoryStartIndex(startIndex)
    setShowStoryViewer(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa' }}
    >
      <div className="max-w-4xl mx-auto px-2 py-4">
        <div className="flex gap-6">
          {/* Main Feed */}
          <div className="flex-1 max-w-xl mx-auto">
            {/* Story Ring */}
            <div className="mb-4">
              <StoryRing
                currentUserId={user?.id || ''}
                onStoryClick={handleStoryClick}
              />
            </div>

            {/* Posts Feed */}
            <div className="space-y-3">
              {posts.length === 0 ? (
                <div 
                  className="rounded-xl p-12 text-center border"
                  style={{
                    backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
                    borderColor: '#009ae9',
                    boxShadow: '0 0 8px 0 rgba(0, 154, 233, 0.5)'
                  }}
                >
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    No posts yet. Be the first to share something!
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-xl p-4 border relative"
                    style={{
                      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fafafa',
                      borderColor: '#009ae9',
                      borderWidth: '1px',
                      boxShadow: '0 0 8px 0 rgba(0, 154, 233, 0.5)'
                    }}
                  >
                    {/* Three-Dot Menu */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)}
                        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }} />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuPostId === post.id && (
                        <>
                          {/* Backdrop */}
                          <div 
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenMenuPostId(null)}
                          />
                          
                          {/* Menu */}
                          <div 
                            className="absolute right-0 mt-2 w-56 rounded-lg border shadow-lg z-50"
                            style={{
                              backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
                              borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0'
                            }}
                          >
                            {post.user_id === user?.id ? (
                              // Own post menu
                              <>
                                <button
                                  onClick={() => handleEdit(post)}
                                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleToggleComments(post.id)}
                                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}
                                >
                                  <MessageSquareOff className="w-4 h-4" />
                                  <span>{post.comments_enabled ? 'Turn off commenting' : 'Turn on commenting'}</span>
                                </button>
                                <button
                                  onClick={() => handleShare(post)}
                                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}
                                >
                                  <Share2 className="w-4 h-4" />
                                  <span>Share</span>
                                </button>
                                <button
                                  onClick={() => handleCopyLink(post)}
                                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}
                                >
                                  <LinkIcon className="w-4 h-4" />
                                  <span>Copy Link</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(post.id)}
                                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-t"
                                  style={{ 
                                    color: '#ef4444',
                                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0'
                                  }}
                                >
                                  <Trash className="w-4 h-4" />
                                  <span>Delete</span>
                                </button>
                                <button
                                  onClick={() => setOpenMenuPostId(null)}
                                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  style={{ 
                                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                  <span>Cancel</span>
                                </button>
                              </>
                            ) : (
                              // Other user's post menu
                              <>
                                <button
                                  onClick={() => handleReport(post)}
                                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}
                                >
                                  <Flag className="w-4 h-4" />
                                  <span>Report</span>
                                </button>
                                <button
                                  onClick={() => handleNotInterested(post.id)}
                                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}
                                >
                                  <EyeOff className="w-4 h-4" />
                                  <span>Not Interested</span>
                                </button>
                                <button
                                  onClick={() => handleShare(post)}
                                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}
                                >
                                  <Share2 className="w-4 h-4" />
                                  <span>Share to</span>
                                </button>
                                <button
                                  onClick={() => handleCopyLink(post)}
                                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}
                                >
                                  <LinkIcon className="w-4 h-4" />
                                  <span>Copy Link</span>
                                </button>
                                <button
                                  onClick={() => setOpenMenuPostId(null)}
                                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-t"
                                  style={{ 
                                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                                    borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0'
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                  <span>Cancel</span>
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Post Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#009ae9] to-[#0076b9]">
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
                      <div>
                        <p 
                          className="font-semibold"
                          style={{
                            color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                            fontFamily: 'var(--font-body)'
                          }}
                        >
                          {post.user_profiles?.display_name || post.user_profiles?.username || 'Unknown User'}
                        </p>
                        <p 
                          className="text-sm"
                          style={{
                            color: theme === 'dark' ? '#b3b3b3' : '#666666',
                            fontFamily: 'var(--font-body)'
                          }}
                        >
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Post Content */}
                    <p 
                      className="mb-4"
                      style={{
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                        fontFamily: 'var(--font-body)'
                      }}
                    >
                      {post.content}
                    </p>

                    {/* Post Media */}
                    {post.media_urls && post.media_urls.length > 0 && (
                      <div className={`mb-4 ${post.media_urls.length === 1 ? 'max-w-[420px] mx-auto' : 'grid grid-cols-2 gap-2'}`}>
                        {post.media_urls.map((url, index) => (
                          <div key={index} className="relative rounded-lg overflow-hidden" style={{
                            aspectRatio: '2/3'
                          }}>
                            {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <Image
                                src={url}
                                alt={`Post media ${index + 1}`}
                                fill
                                className={`object-cover ${post.media_metadata?.[index]?.filter || ''}`}
                                style={{
                                  transform: `rotate(${post.media_metadata?.[index]?.rotation || 0}deg)`
                                }}
                              />
                            ) : (
                              <video
                                src={url}
                                className="w-full h-full object-cover"
                                controls
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center gap-6 pt-4 border-t" style={{
                      borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0'
                    }}>
                      {/* Like Button */}
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-2 transition-colors"
                        style={{
                          color: post.is_liked ? '#ef4444' : (theme === 'dark' ? '#b3b3b3' : '#666666')
                        }}
                      >
                        <Heart 
                          className="w-6 h-6" 
                          fill={post.is_liked ? '#ef4444' : 'none'}
                        />
                        <span>{post.likes_count || 0}</span>
                      </button>

                      {/* Comment Button */}
                      <button 
                        onClick={() => handleComment(post)}
                        className="flex items-center gap-2 hover:text-[#009ae9] transition-colors"
                        style={{
                          color: theme === 'dark' ? '#b3b3b3' : '#666666'
                        }}
                      >
                        <MessageCircle className="w-6 h-6" />
                        <span>{post.comments_count || 0}</span>
                      </button>

                      {/* Share Button */}
                      <button 
                        onClick={() => handleShare(post)}
                        className="flex items-center gap-2 hover:text-[#009ae9] transition-colors"
                        style={{
                          color: theme === 'dark' ? '#b3b3b3' : '#666666'
                        }}
                      >
                        <Share2 className="w-6 h-6" />
                        <span>{post.shares_count || 0}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Suggested Users Sidebar */}
          <div className="hidden lg:block w-80">
            <div className="sticky top-20">
              <SuggestedUsers currentUserId={user?.id || ''} />
            </div>
          </div>
        </div>
      </div>

      {/* Story Viewer Modal */}
      {showStoryViewer && selectedStories && (
        <StoryViewer
          userStories={selectedStories}
          startIndex={storyStartIndex}
          onClose={() => {
            setShowStoryViewer(false)
            setSelectedStories(null)
          }}
          currentUserId={user?.id || ''}
        />
      )}

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <CreatePostModal
          onClose={() => setShowCreatePostModal(false)}
          onPostCreated={() => {
            setShowCreatePostModal(false)
            loadFeed()
          }}
        />
      )}

      {/* Comment Modal */}
      {showCommentModal && selectedPost && (
        <CommentModal
          post={selectedPost}
          onClose={() => {
            setShowCommentModal(false)
            setSelectedPost(null)
          }}
          onCommentAdded={() => {
            loadFeed()
          }}
        />
      )}

      {/* Share Modal */}
      {showShareModal && selectedPost && (
        <ShareModal
          post={selectedPost}
          onClose={() => {
            setShowShareModal(false)
            setSelectedPost(null)
          }}
        />
      )}

      {/* Report Modal */}
      {showReportModal && selectedPost && (
        <ReportModal
          post={selectedPost}
          onClose={() => {
            setShowReportModal(false)
            setSelectedPost(null)
          }}
          onReported={() => {
            setShowReportModal(false)
            setSelectedPost(null)
          }}
        />
      )}

      {/* Edit Post Modal */}
      {showEditPostModal && selectedPost && (
        <EditPostModal
          post={selectedPost}
          onClose={() => {
            setShowEditPostModal(false)
            setSelectedPost(null)
          }}
          onPostUpdated={() => {
            setShowEditPostModal(false)
            setSelectedPost(null)
            loadFeed()
          }}
        />
      )}
    </div>
  )
}
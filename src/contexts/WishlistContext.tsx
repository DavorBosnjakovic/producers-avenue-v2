// File: WishlistContext.tsx
// Path: /src/contexts/WishlistContext.tsx
// Wishlist context and provider

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

interface WishlistItem {
  id: string
  type: 'product' | 'service'
  itemId: string
  title: string
  price: number
  image_url: string | null
  seller_id: string
  seller_name: string
  added_at: string
}

interface WishlistContextType {
  items: WishlistItem[]
  itemCount: number
  addToWishlist: (item: Omit<WishlistItem, 'id' | 'added_at'>) => Promise<boolean>
  removeFromWishlist: (itemId: string) => Promise<boolean>
  toggleWishlist: (item: Omit<WishlistItem, 'id' | 'added_at'>) => Promise<boolean>
  isInWishlist: (itemId: string) => boolean
  clearWishlist: () => void
  loading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    loadWishlist()
  }, [])

  const loadWishlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserId(user.id)
        
        // Load wishlist from database
        const { data, error } = await supabase
          .from('wishlist_items')
          .select('*')
          .eq('user_id', user.id)
          .order('added_at', { ascending: false })

        if (!error && data) {
          // Validate items
          const validItems = data.filter(item => {
            const isValid = !!(
              item.itemId && 
              item.type && 
              typeof item.price === 'number' &&
              item.title
            )
            
            if (!isValid) {
              console.warn('Invalid wishlist item found:', item)
            }
            
            return isValid
          })
          
          // Cleanup invalid items
          const invalidIds = data
            .filter(item => !validItems.includes(item))
            .map(item => item.id)
          
          if (invalidIds.length > 0) {
            await supabase
              .from('wishlist_items')
              .delete()
              .in('id', invalidIds)
            
            console.log(`🧹 Cleaned up ${invalidIds.length} invalid wishlist items`)
          }
          
          setItems(validItems)
          console.log(`✅ Loaded ${validItems.length} wishlist items`)
        }
      } else {
        // Load wishlist from localStorage for non-authenticated users
        const savedWishlist = localStorage.getItem('wishlist')
        if (savedWishlist) {
          try {
            const parsedWishlist = JSON.parse(savedWishlist)
            
            const validItems = Array.isArray(parsedWishlist) 
              ? parsedWishlist.filter((item: any) => {
                  const isValid = !!(
                    item.itemId && 
                    item.type && 
                    typeof item.price === 'number' &&
                    item.title
                  )
                  
                  if (!isValid) {
                    console.warn('Invalid wishlist item in localStorage:', item)
                  }
                  
                  return isValid
                })
              : []
            
            if (validItems.length !== parsedWishlist.length) {
              localStorage.setItem('wishlist', JSON.stringify(validItems))
              console.log(`🧹 Cleaned up ${parsedWishlist.length - validItems.length} invalid wishlist items`)
            }
            
            setItems(validItems)
            console.log(`✅ Loaded ${validItems.length} wishlist items from localStorage`)
          } catch (error) {
            console.error('❌ Error parsing wishlist:', error)
            localStorage.removeItem('wishlist')
            setItems([])
          }
        }
      }
    } catch (error) {
      console.error('❌ Error loading wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveWishlist = async (newItems: WishlistItem[]) => {
    if (userId) {
      try {
        // Clear existing wishlist items
        await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', userId)

        // Insert new items
        if (newItems.length > 0) {
          await supabase
            .from('wishlist_items')
            .insert(
              newItems.map(item => ({
                ...item,
                user_id: userId,
              }))
            )
        }
        
        console.log(`💾 Saved ${newItems.length} wishlist items to database`)
      } catch (error) {
        console.error('❌ Error saving wishlist to database:', error)
      }
    } else {
      localStorage.setItem('wishlist', JSON.stringify(newItems))
      console.log(`💾 Saved ${newItems.length} wishlist items to localStorage`)
    }
  }

  const addToWishlist = async (item: Omit<WishlistItem, 'id' | 'added_at'>): Promise<boolean> => {
    try {
      const existingItem = items.find(
        (i) => i.itemId === item.itemId && i.type === item.type
      )

      if (existingItem) {
        console.log('⚠️ Item already in wishlist:', item.itemId)
        return false
      }

      const newItem: WishlistItem = {
        ...item,
        id: `${item.type}-${item.itemId}`,
        added_at: new Date().toISOString(),
      }

      const newItems = [newItem, ...items]
      setItems(newItems)
      await saveWishlist(newItems)
      console.log(`✅ Added to wishlist: ${item.title}`)
      return true
    } catch (error) {
      console.error('❌ Error adding to wishlist:', error)
      return false
    }
  }

  const removeFromWishlist = async (itemId: string): Promise<boolean> => {
    try {
      const newItems = items.filter((item) => item.itemId !== itemId)
      setItems(newItems)
      await saveWishlist(newItems)
      console.log(`✅ Removed from wishlist: ${itemId}`)
      return true
    } catch (error) {
      console.error('❌ Error removing from wishlist:', error)
      return false
    }
  }

  const toggleWishlist = async (item: Omit<WishlistItem, 'id' | 'added_at'>): Promise<boolean> => {
    const isCurrentlyInWishlist = isInWishlist(item.itemId)
    
    if (isCurrentlyInWishlist) {
      await removeFromWishlist(item.itemId)
      return false // Removed, so now NOT in wishlist
    } else {
      await addToWishlist(item)
      return true // Added, so now IN wishlist
    }
  }

  const clearWishlist = () => {
    setItems([])
    saveWishlist([])
    console.log('🗑️ Wishlist cleared')
  }

  const isInWishlist = (itemId: string): boolean => {
    if (loading) return false
    return items.some((item) => item.itemId === itemId)
  }

  const itemCount = items.length

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
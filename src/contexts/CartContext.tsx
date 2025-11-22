// File: CartContext.tsx
// Path: /src/contexts/CartContext.tsx
// Shopping cart context - FIXED to match actual database schema

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CartItem {
  id: string
  type: 'product' | 'service'
  itemId: string
  title: string
  price: number
  image_url: string | null
  seller_id: string
  seller_name: string
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  totalAmount: number
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  isInCart: (itemId: string) => boolean
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    loadCart()
    
    // Reload cart when page becomes visible (e.g., coming back from checkout)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadCart()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const loadCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserId(user.id)
        
        // Load cart from database with proper joins
        const { data, error } = await supabase
          .from('cart_items')
          .select(`
            id,
            product_id,
            added_price,
            products (
              title,
              slug,
              thumbnail_url,
              seller_id
            )
          `)
          .eq('user_id', user.id)

        if (error) {
          console.error('❌ Error loading cart from database:', error)
          setLoading(false)
          return
        }

        if (data && data.length > 0) {
          // Get unique seller IDs
          const sellerIds = [...new Set(data.map((item: any) => item.products?.seller_id).filter(Boolean))]
          
          // Fetch seller profiles separately
          const { data: profiles } = await supabase
            .from('user_profiles')
            .select('user_id, username, display_name')
            .in('user_id', sellerIds)
          
          // Create seller map
          const sellerMap: Record<string, any> = {}
          profiles?.forEach(profile => {
            sellerMap[profile.user_id] = profile
          })

          // Transform database items to CartItem format
          const cartItems: CartItem[] = data
            .filter((item: any) => item.products) // Only keep items with valid products
            .map((item: any) => {
              const seller = sellerMap[item.products.seller_id]
              return {
                id: item.id,
                type: 'product' as const,
                itemId: item.product_id,
                title: item.products.title || 'Unknown Product',
                price: item.added_price,
                image_url: item.products.thumbnail_url || null,
                seller_id: item.products.seller_id,
                seller_name: seller?.display_name || seller?.username || 'Unknown Seller',
              }
            })
          
          setItems(cartItems)
          console.log(`✅ Loaded ${cartItems.length} cart items from database`)
        }
      } else {
        // Load cart from localStorage for non-authenticated users
        const savedCart = localStorage.getItem('shopping_cart')
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart)
            const validItems = Array.isArray(parsedCart) 
              ? parsedCart.filter((item: any) => {
                  const isValid = !!(
                    item.itemId && 
                    item.type && 
                    typeof item.price === 'number' &&
                    item.title
                  )
                  return isValid
                })
              : []
            
            setItems(validItems)
            console.log(`✅ Loaded ${validItems.length} cart items from localStorage`)
          } catch (error) {
            console.error('❌ Error parsing cart from localStorage:', error)
            localStorage.removeItem('shopping_cart')
            setItems([])
          }
        }
      }
    } catch (error) {
      console.error('❌ Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (item: CartItem) => {
    try {
      // Check if item already exists
      const existingItem = items.find((i) => i.itemId === item.itemId && i.type === item.type)

      if (existingItem) {
        console.log('⚠️ Item already in cart:', item.itemId)
        return
      }

      if (userId) {
        // Save to database for authenticated users
        // cart_items table only supports products right now
        if (item.type === 'product') {
          // Check if item exists in database first
          const { data: existingDbItem } = await supabase
            .from('cart_items')
            .select('id')
            .eq('user_id', userId)
            .eq('product_id', item.itemId)
            .maybeSingle()

          if (existingDbItem) {
            console.log('⚠️ Item already exists in database, reloading cart...')
            // Item exists in DB but not in state - reload cart
            await loadCart()
            return
          }

          const { data, error } = await supabase
            .from('cart_items')
            .insert({
              user_id: userId,
              product_id: item.itemId,
              added_price: item.price,
            })
            .select()
            .single()

          if (error) {
            // If duplicate key error, reload cart to sync state
            if (error.code === '23505') {
              console.log('⚠️ Duplicate key error, reloading cart to sync state...')
              await loadCart()
              return
            }
            console.error('❌ Error adding to cart (database):', error)
            alert(`Failed to add to cart: ${error.message || 'Unknown error'}`)
            return
          }

          // Add to state with database ID
          const newItem = { ...item, id: data.id }
          setItems((prevItems) => [...prevItems, newItem])
          console.log(`✅ Added to cart (database): ${item.title}`)
        } else {
          console.warn('⚠️ Services not yet supported in cart database')
          // Fallback to localStorage for services
          const newItem = { ...item, id: `${item.type}-${item.itemId}` }
          setItems((prevItems) => [...prevItems, newItem])
          localStorage.setItem('shopping_cart', JSON.stringify([...items, newItem]))
        }
      } else {
        // Save to localStorage for non-authenticated users
        const newItem = { ...item, id: `${item.type}-${item.itemId}` }
        const newItems = [...items, newItem]
        setItems(newItems)
        localStorage.setItem('shopping_cart', JSON.stringify(newItems))
        console.log(`✅ Added to cart (localStorage): ${item.title}`)
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error)
    }
  }

  const removeFromCart = async (id: string) => {
    try {
      if (userId) {
        // Remove from database
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('❌ Error removing from cart (database):', error)
          return
        }

        setItems((prevItems) => prevItems.filter((item) => item.id !== id))
        console.log(`✅ Removed from cart (database): ${id}`)
      } else {
        // Remove from localStorage
        const newItems = items.filter((item) => item.id !== id)
        setItems(newItems)
        localStorage.setItem('shopping_cart', JSON.stringify(newItems))
        console.log(`✅ Removed from cart (localStorage): ${id}`)
      }
    } catch (error) {
      console.error('❌ Error removing from cart:', error)
    }
  }

  const clearCart = async () => {
    try {
      if (userId) {
        // Clear from database
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)

        if (error) {
          console.error('❌ Error clearing cart (database):', error)
          return
        }

        console.log('🗑️ Cart cleared (database)')
      } else {
        // Clear from localStorage
        localStorage.removeItem('shopping_cart')
        console.log('🗑️ Cart cleared (localStorage)')
      }

      setItems([])
    } catch (error) {
      console.error('❌ Error clearing cart:', error)
    }
  }

  const isInCart = (itemId: string): boolean => {
    if (loading) return false
    return items.some((item) => item.itemId === itemId)
  }

  const itemCount = items.length
  const totalAmount = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
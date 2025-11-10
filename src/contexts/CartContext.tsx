// File: CartContext.tsx
// Path: /src/contexts/CartContext.tsx
// Shopping cart context and provider

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
  }, [])

  const loadCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserId(user.id)
        
        // Load cart from database
        const { data, error } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)

        if (!error && data) {
          setItems(data)
        }
      } else {
        // Load cart from localStorage for non-authenticated users
        const savedCart = localStorage.getItem('shopping_cart')
        if (savedCart) {
          setItems(JSON.parse(savedCart))
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveCart = async (newItems: CartItem[]) => {
    if (userId) {
      // Save to database for authenticated users
      try {
        // Clear existing cart items
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)

        // Insert new items
        if (newItems.length > 0) {
          await supabase
            .from('cart_items')
            .insert(
              newItems.map(item => ({
                ...item,
                user_id: userId,
              }))
            )
        }
      } catch (error) {
        console.error('Error saving cart to database:', error)
      }
    } else {
      // Save to localStorage for non-authenticated users
      localStorage.setItem('shopping_cart', JSON.stringify(newItems))
    }
  }

  const addToCart = (item: CartItem) => {
    setItems((prevItems) => {
      // Check if item already exists
      const existingItem = prevItems.find(
        (i) => i.itemId === item.itemId && i.type === item.type
      )

      if (existingItem) {
        // Item already in cart, don't add duplicate
        return prevItems
      }

      const newItems = [...prevItems, { ...item, id: `${item.type}-${item.itemId}` }]
      saveCart(newItems)
      return newItems
    })
  }

  const removeFromCart = (id: string) => {
    setItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.id !== id)
      saveCart(newItems)
      return newItems
    })
  }

  const clearCart = () => {
    setItems([])
    saveCart([])
  }

  const isInCart = (itemId: string): boolean => {
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
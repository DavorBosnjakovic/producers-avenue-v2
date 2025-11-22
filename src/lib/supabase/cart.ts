// File: cart.ts
// Path: /src/lib/supabase/cart.ts
// Cart operations using Supabase

import { createClient } from './client'

export interface CartItem {
  id: string
  cart_item_id: string
  product_id: string
  title: string
  slug: string
  price: number
  current_price: number
  added_price: number
  thumbnail_url: string | null
  file_size_mb: number | null
  seller_username: string
  seller_avatar: string | null
  added_at: string
}

/**
 * Get user's cart with full product details
 */
export async function getCart(userId: string): Promise<{ data: CartItem[] | null; error: any }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id:cart_item_id,
      cart_item_id:id,
      added_price,
      added_at:created_at,
      product:products (
        id:product_id,
        product_id:id,
        title,
        slug,
        price:current_price,
        current_price:price,
        thumbnail_url,
        file_size_mb,
        seller:user_profiles!seller_id (
          seller_username:username,
          seller_avatar:avatar_url
        )
      )
    `)
    .eq('user_id', userId)
    .eq('products.status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching cart:', error)
    return { data: null, error }
  }

  // Flatten the nested structure
  const cartItems: CartItem[] = (data || []).map((item: any) => ({
    id: item.id,
    cart_item_id: item.cart_item_id,
    product_id: item.product.product_id,
    title: item.product.title,
    slug: item.product.slug,
    price: item.product.price,
    current_price: item.product.current_price,
    added_price: item.added_price,
    thumbnail_url: item.product.thumbnail_url,
    file_size_mb: item.product.file_size_mb,
    seller_username: item.product.seller.seller_username,
    seller_avatar: item.product.seller.seller_avatar,
    added_at: item.added_at,
  }))

  return { data: cartItems, error: null }
}

/**
 * Get cart count for badge
 */
export async function getCartCount(userId: string): Promise<{ count: number; error: any }> {
  const supabase = createClient()

  const { count, error } = await supabase
    .from('cart_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching cart count:', error)
    return { count: 0, error }
  }

  return { count: count || 0, error: null }
}

/**
 * Add product to cart
 */
export async function addToCart(
  userId: string,
  productId: string,
  currentPrice: number
): Promise<{ success: boolean; error: any }> {
  const supabase = createClient()

  const { error } = await supabase
    .from('cart_items')
    .insert({
      user_id: userId,
      product_id: productId,
      added_price: currentPrice,
    })
    // ON CONFLICT DO NOTHING is handled by unique constraint
    .select()
    .single()

  if (error) {
    // If it's a duplicate key error (23505), that's okay - item already in cart
    if (error.code === '23505') {
      return { success: true, error: null }
    }
    console.error('Error adding to cart:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

/**
 * Remove product from cart
 */
export async function removeFromCart(
  userId: string,
  productId: string
): Promise<{ success: boolean; error: any }> {
  const supabase = createClient()

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)

  if (error) {
    console.error('Error removing from cart:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

/**
 * Check if product is in cart
 */
export async function isInCart(userId: string, productId: string): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('cart_items')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()

  if (error || !data) {
    return false
  }

  return true
}

/**
 * Clear cart (after purchase or manually)
 */
export async function clearCart(
  userId: string,
  productIds?: string[]
): Promise<{ success: boolean; error: any }> {
  const supabase = createClient()

  let query = supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)

  // If specific product IDs provided, only clear those
  if (productIds && productIds.length > 0) {
    query = query.in('product_id', productIds)
  }

  const { error } = await query

  if (error) {
    console.error('Error clearing cart:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

/**
 * Get cart total price
 */
export async function getCartTotal(userId: string): Promise<{ total: number; error: any }> {
  const { data, error } = await getCart(userId)

  if (error || !data) {
    return { total: 0, error }
  }

  const total = data.reduce((sum, item) => sum + item.current_price, 0)

  return { total, error: null }
}
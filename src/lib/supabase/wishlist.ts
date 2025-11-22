// File: wishlist.ts
// Path: /src/lib/supabase/wishlist.ts
// Wishlist operations using Supabase

import { createClient } from './client'

export interface WishlistItem {
  id: string
  wishlist_item_id: string
  product_id: string
  title: string
  slug: string
  price: number
  thumbnail_url: string | null
  rating_average: number
  reviews_count: number
  seller_username: string
  seller_avatar: string | null
  notes: string | null
  added_at: string
}

/**
 * Get user's wishlist with full product details
 */
export async function getWishlist(userId: string): Promise<{ data: WishlistItem[] | null; error: any }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('wishlist_items')
    .select(`
      id:wishlist_item_id,
      wishlist_item_id:id,
      notes,
      added_at:created_at,
      product:products (
        product_id:id,
        title,
        slug,
        price,
        thumbnail_url,
        rating_average,
        reviews_count,
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
    console.error('Error fetching wishlist:', error)
    return { data: null, error }
  }

  // Flatten the nested structure
  const wishlistItems: WishlistItem[] = (data || []).map((item: any) => ({
    id: item.id,
    wishlist_item_id: item.wishlist_item_id,
    product_id: item.product.product_id,
    title: item.product.title,
    slug: item.product.slug,
    price: item.product.price,
    thumbnail_url: item.product.thumbnail_url,
    rating_average: item.product.rating_average,
    reviews_count: item.product.reviews_count,
    seller_username: item.product.seller.seller_username,
    seller_avatar: item.product.seller.seller_avatar,
    notes: item.notes,
    added_at: item.added_at,
  }))

  return { data: wishlistItems, error: null }
}

/**
 * Get wishlist count for badge
 */
export async function getWishlistCount(userId: string): Promise<{ count: number; error: any }> {
  const supabase = createClient()

  const { count, error } = await supabase
    .from('wishlist_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching wishlist count:', error)
    return { count: 0, error }
  }

  return { count: count || 0, error: null }
}

/**
 * Toggle wishlist (add if not exists, remove if exists)
 * Returns: { added: true } if added, { added: false } if removed
 */
export async function toggleWishlist(
  userId: string,
  productId: string
): Promise<{ added: boolean; error: any }> {
  const supabase = createClient()

  // Check if already wishlisted
  const { data: existing } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()

  if (existing) {
    // Remove from wishlist
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (error) {
      console.error('Error removing from wishlist:', error)
      return { added: false, error }
    }

    return { added: false, error: null }
  } else {
    // Add to wishlist
    const { error } = await supabase
      .from('wishlist_items')
      .insert({
        user_id: userId,
        product_id: productId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding to wishlist:', error)
      return { added: false, error }
    }

    return { added: true, error: null }
  }
}

/**
 * Add product to wishlist with optional notes
 */
export async function addToWishlist(
  userId: string,
  productId: string,
  notes?: string
): Promise<{ success: boolean; error: any }> {
  const supabase = createClient()

  const { error } = await supabase
    .from('wishlist_items')
    .insert({
      user_id: userId,
      product_id: productId,
      notes: notes || null,
    })
    .select()
    .single()

  if (error) {
    // If it's a duplicate key error (23505), that's okay - item already wishlisted
    if (error.code === '23505') {
      return { success: true, error: null }
    }
    console.error('Error adding to wishlist:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(
  userId: string,
  productId: string
): Promise<{ success: boolean; error: any }> {
  const supabase = createClient()

  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)

  if (error) {
    console.error('Error removing from wishlist:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

/**
 * Check if product is wishlisted
 */
export async function isWishlisted(userId: string, productId: string): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('wishlist_items')
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
 * Update wishlist item notes
 */
export async function updateWishlistNotes(
  userId: string,
  productId: string,
  notes: string
): Promise<{ success: boolean; error: any }> {
  const supabase = createClient()

  const { error } = await supabase
    .from('wishlist_items')
    .update({ notes })
    .eq('user_id', userId)
    .eq('product_id', productId)

  if (error) {
    console.error('Error updating wishlist notes:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

/**
 * Clear entire wishlist
 */
export async function clearWishlist(userId: string): Promise<{ success: boolean; error: any }> {
  const supabase = createClient()

  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Error clearing wishlist:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}
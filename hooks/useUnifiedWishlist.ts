"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useWishlist } from './useWishlist'
import { useGuestWishlist } from './useGuestWishlist'

interface WishlistItem {
  id: number | string
  product: {
    id: number | string
    name: string
    price: number
    stock: number
    category: {
      id: number
      name: string
    }
    images: Array<{
      id: number
      url: string
      altText?: string
      isPrimary: boolean
    }>
  }
  addedAt: string
}

export function useUnifiedWishlist() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const authenticatedWishlist = useWishlist()
  const guestWishlist = useGuestWishlist()
  const [hasMerged, setHasMerged] = useState(false)

  // Merge guest wishlist when user logs in
  useEffect(() => {
    const mergeGuestWishlist = async () => {
      if (isAuthenticated && !hasMerged && guestWishlist.items.length > 0) {
        try {
          // Add each guest wishlist item to authenticated wishlist
          for (const item of guestWishlist.items) {
            await authenticatedWishlist.toggleWishlistItem(item.productId)
          }
          guestWishlist.clearWishlist()
          setHasMerged(true)
        } catch (error) {
          console.error('Error merging guest wishlist:', error)
        }
      }
    }

    if (!authLoading) {
      mergeGuestWishlist()
    }
  }, [isAuthenticated, hasMerged, guestWishlist, authenticatedWishlist, authLoading])

  // Reset merge flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setHasMerged(false)
    }
  }, [isAuthenticated])

  // Get current wishlist items
  const getCurrentItems = useCallback((): WishlistItem[] => {
    if (isAuthenticated) {
      return authenticatedWishlist.items
    } else {
      return guestWishlist.items
    }
  }, [isAuthenticated, authenticatedWishlist.items, guestWishlist.items])

  // Toggle wishlist item (works for both guest and authenticated)
  const toggleWishlistItem = useCallback(async (productId: string) => {
    if (isAuthenticated) {
      return await authenticatedWishlist.toggleWishlistItem(productId)
    } else {
      return await guestWishlist.toggleWishlistItem(productId)
    }
  }, [isAuthenticated, authenticatedWishlist, guestWishlist])

  // Remove from wishlist (works for both guest and authenticated)
  const removeFromWishlist = useCallback(async (productId: string) => {
    if (isAuthenticated) {
      return await authenticatedWishlist.removeFromWishlist(productId)
    } else {
      guestWishlist.removeFromWishlist(productId)
    }
  }, [isAuthenticated, authenticatedWishlist, guestWishlist])

  // Clear wishlist (works for both guest and authenticated)
  const clearWishlist = useCallback(async () => {
    if (isAuthenticated) {
      return await authenticatedWishlist.clearWishlist()
    } else {
      guestWishlist.clearWishlist()
    }
  }, [isAuthenticated, authenticatedWishlist, guestWishlist])

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId: string) => {
    if (isAuthenticated) {
      return authenticatedWishlist.isInWishlist(productId)
    } else {
      return guestWishlist.isInWishlist(productId)
    }
  }, [isAuthenticated, authenticatedWishlist, guestWishlist])

  // Get wishlist count
  const getCount = useCallback(() => {
    if (isAuthenticated) {
      return authenticatedWishlist.count
    } else {
      return guestWishlist.count
    }
  }, [isAuthenticated, authenticatedWishlist.count, guestWishlist.count])

  const currentItems = getCurrentItems()

  return {
    items: currentItems,
    loading: isAuthenticated ? authenticatedWishlist.isLoading : guestWishlist.loading,
    error: isAuthenticated ? authenticatedWishlist.error : null,
    count: getCount(),
    toggleWishlistItem,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    fetchWishlist: isAuthenticated ? authenticatedWishlist.fetchWishlist : () => {},
    isAuthenticated,
    hasMerged
  }
}

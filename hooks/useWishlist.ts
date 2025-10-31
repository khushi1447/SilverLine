"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { api } from '@/lib/api'

interface WishlistItem {
  id: number
  product: {
    id: number
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

interface WishlistState {
  items: WishlistItem[]
  isLoading: boolean
  error: string | null
}

export function useWishlist() {
  const [state, setState] = useState<WishlistState>({
    items: [],
    isLoading: false,
    error: null,
  })
  const [wishlistStatus, setWishlistStatus] = useState<Record<string, boolean>>({})
  const { isAuthenticated } = useAuth()

  // Fetch wishlist items
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setState({ items: [], isLoading: false, error: null })
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await api.wishlist.get()
      
      if (response.error) {
        throw new Error(response.error)
      }

      setState({
        items: response.data || [],
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState({
        items: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch wishlist',
      })
    }
  }, [isAuthenticated])

  // Check if product is in wishlist
  const checkWishlistStatus = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      setWishlistStatus(prev => ({ ...prev, [productId]: false }))
      return false
    }

    try {
      const response = await fetch(`/api/wishlist/${productId}`)
      const data = await response.json()
      
      if (response.ok) {
        setWishlistStatus(prev => ({ ...prev, [productId]: data.isInWishlist }))
        return data.isInWishlist
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error)
    }
    
    setWishlistStatus(prev => ({ ...prev, [productId]: false }))
    return false
  }, [isAuthenticated])

  // Toggle wishlist item
  const toggleWishlistItem = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login'
      return false
    }

    try {
      const response = await api.wishlist.addItem(productId)
      
      if (response.error) {
        throw new Error(response.error)
      }

      const isInWishlist = response.data?.isInWishlist ?? false
      setWishlistStatus(prev => ({ ...prev, [productId]: isInWishlist }))
      
      // Refresh wishlist if item was added
      if (isInWishlist) {
        await fetchWishlist()
      } else {
        // Remove from local state if removed
        setState(prev => ({
          ...prev,
          items: prev.items.filter(item => item.product.id.toString() !== productId)
        }))
      }

      return isInWishlist
    } catch (error) {
      console.error('Error toggling wishlist item:', error)
      return false
    }
  }, [isAuthenticated, fetchWishlist])

  // Remove item from wishlist
  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!isAuthenticated) return false

    try {
      const response = await api.wishlist.removeItem(productId)
      
      if (response.error) {
        throw new Error(response.error)
      }

      setWishlistStatus(prev => ({ ...prev, [productId]: false }))
      setState(prev => ({
        ...prev,
        items: prev.items.filter(item => item.product.id.toString() !== productId)
      }))

      return true
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      return false
    }
  }, [isAuthenticated])

  // Clear wishlist
  const clearWishlist = useCallback(async () => {
    if (!isAuthenticated) return false

    try {
      // Remove all items one by one
      const removePromises = state.items.map(item => 
        api.wishlist.removeItem(item.product.id.toString())
      )
      
      await Promise.all(removePromises)
      
      setState(prev => ({ ...prev, items: [] }))
      setWishlistStatus({})
      
      return true
    } catch (error) {
      console.error('Error clearing wishlist:', error)
      return false
    }
  }, [isAuthenticated, state.items])

  // Get wishlist count
  const getWishlistCount = useCallback(() => {
    return state.items.length
  }, [state.items])

  // Check if product is in wishlist (from local state)
  const isInWishlist = useCallback((productId: string) => {
    return wishlistStatus[productId] ?? false
  }, [wishlistStatus])

  // Load wishlist on mount and when auth status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist()
    }
  }, [fetchWishlist, isAuthenticated])

  return {
    // State
    items: state.items,
    isLoading: state.isLoading,
    error: state.error,
    count: getWishlistCount(),
    
    // Actions
    fetchWishlist,
    toggleWishlistItem,
    removeFromWishlist,
    clearWishlist,
    checkWishlistStatus,
    isInWishlist,
  }
}

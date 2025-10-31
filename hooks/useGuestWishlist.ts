"use client"

import { useState, useEffect, useCallback } from 'react'

interface GuestWishlistItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    price: number
    comparePrice?: number
    sku: string
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

const GUEST_WISHLIST_KEY = 'guest_wishlist'

export function useGuestWishlist() {
  const [items, setItems] = useState<GuestWishlistItem[]>([])
  const [wishlistStatus, setWishlistStatus] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)

  // Load wishlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(GUEST_WISHLIST_KEY)
        if (stored) {
          const parsedItems = JSON.parse(stored)
          setItems(parsedItems)
          
          // Update wishlist status
          const status: Record<string, boolean> = {}
          parsedItems.forEach((item: GuestWishlistItem) => {
            status[item.productId] = true
          })
          setWishlistStatus(status)
        }
      } catch (error) {
        console.error('Error loading guest wishlist:', error)
      }
    }
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items))
      } catch (error) {
        console.error('Error saving guest wishlist:', error)
      }
    }
  }, [items])

  // Fetch product details for a product ID
  const fetchProductDetails = useCallback(async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (response.ok) {
        const product = await response.json()
        return product
      }
    } catch (error) {
      console.error('Error fetching product details:', error)
    }
    return null
  }, [])

  // Add item to guest wishlist
  const addToWishlist = useCallback(async (productId: string) => {
    setLoading(true)
    
    try {
      // Check if item already exists
      const existingItem = items.find(item => item.productId === productId)
      
      if (!existingItem) {
        const product = await fetchProductDetails(productId)
        
        if (product) {
          const newItem: GuestWishlistItem = {
            id: `guest_wishlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            productId,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              comparePrice: product.comparePrice,
              sku: product.sku,
              stock: product.stock,
              category: product.category,
              images: product.images || []
            },
            addedAt: new Date().toISOString()
          }
          
          setItems(prev => [...prev, newItem])
          setWishlistStatus(prev => ({ ...prev, [productId]: true }))
        }
      }
    } catch (error) {
      console.error('Error adding to guest wishlist:', error)
    } finally {
      setLoading(false)
    }
  }, [items, fetchProductDetails])

  // Remove item from guest wishlist
  const removeFromWishlist = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.productId !== productId))
    setWishlistStatus(prev => ({ ...prev, [productId]: false }))
  }, [])

  // Toggle wishlist item
  const toggleWishlistItem = useCallback(async (productId: string) => {
    const isInWishlist = wishlistStatus[productId]
    
    if (isInWishlist) {
      removeFromWishlist(productId)
      return false
    } else {
      await addToWishlist(productId)
      return true
    }
  }, [wishlistStatus, addToWishlist, removeFromWishlist])

  // Clear entire wishlist
  const clearWishlist = useCallback(() => {
    setItems([])
    setWishlistStatus({})
  }, [])

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId: string) => {
    return wishlistStatus[productId] ?? false
  }, [wishlistStatus])

  // Get wishlist count
  const getCount = useCallback(() => {
    return items.length
  }, [items])

  return {
    items,
    loading,
    count: getCount(),
    addToWishlist,
    removeFromWishlist,
    toggleWishlistItem,
    clearWishlist,
    isInWishlist
  }
}

"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useGuestSession } from './useGuestSession'

interface GuestCartItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    price: number
    images: Array<{
      id: string
      url: string
      altText?: string
      isPrimary: boolean
    }>
  }
  quantity: number
  price: number
  addedAt: string
}

interface GuestCart {
  items: GuestCartItem[]
  total: number
  itemCount: number
}

const GUEST_CART_KEY = 'guest_cart'

export function useGuestCart() {
  const { sessionId } = useGuestSession()
  const [cart, setCart] = useState<GuestCart>({
    items: [],
    total: 0,
    itemCount: 0
  })
  const [loading, setLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const isUpdatingRef = useRef(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      try {
        const stored = localStorage.getItem(GUEST_CART_KEY)
        if (stored) {
          const parsedCart = JSON.parse(stored)
          setCart(parsedCart)
        }
        setIsInitialized(true)
      } catch (error) {
        console.error('Error loading guest cart:', error)
        setIsInitialized(true)
      }
    }
  }, [isInitialized])

  // Save cart to localStorage whenever it changes (but only after initialization)
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      try {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart))
      } catch (error) {
        console.error('Error saving guest cart:', error)
      }
    }
  }, [cart, isInitialized])

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

  // Add item to guest cart
  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    if (!isInitialized || isUpdatingRef.current) {
      console.log('Cart not ready for updates')
      return
    }
    
    isUpdatingRef.current = true
    setLoading(true)
    
    try {
      // Fetch product details first
      const product = await fetchProductDetails(productId)
      
      if (!product) {
        console.error('Failed to fetch product details')
        return
      }

      // Update cart state
      setCart(currentCart => {
        // Check if item already exists in cart
        const existingItemIndex = currentCart.items.findIndex(item => item.productId === productId)
        
        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const updatedItems = [...currentCart.items]
          updatedItems[existingItemIndex].quantity += quantity
          updatedItems[existingItemIndex].price = updatedItems[existingItemIndex].product.price * updatedItems[existingItemIndex].quantity
          
          const newCart = {
            items: updatedItems,
            total: updatedItems.reduce((sum, item) => sum + item.price, 0),
            itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
          }
          console.log('Guest cart updated (existing item):', newCart)
          return newCart
        } else {
          // Add new item to cart
          const newItem: GuestCartItem = {
            id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            productId,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              images: product.images || []
            },
            quantity,
            price: product.price * quantity,
            addedAt: new Date().toISOString()
          }
          
          const updatedItems = [...currentCart.items, newItem]
          const newCart = {
            items: updatedItems,
            total: updatedItems.reduce((sum, item) => sum + item.price, 0),
            itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
          }
          console.log('Guest cart updated (new item):', newCart)
          return newCart
        }
      })
    } catch (error) {
      console.error('Error adding to guest cart:', error)
    } finally {
      setLoading(false)
      isUpdatingRef.current = false
    }
  }, [fetchProductDetails, isInitialized])

  // Update item quantity in guest cart
  const updateCartItem = useCallback((productId: string, quantity: number) => {
    console.log('Updating cart item:', productId, 'to quantity:', quantity)
    setCart(currentCart => {
      // If quantity is 0 or less, remove the item
      if (quantity <= 0) {
        const updatedItems = currentCart.items.filter(item => item.productId !== productId)
        const newCart = {
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + item.price, 0),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        }
        console.log('Guest cart after removing (quantity 0):', newCart)
        return newCart
      }

      const updatedItems = currentCart.items.map(item => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity,
            price: item.product.price * quantity
          }
        }
        return item
      })

      const newCart = {
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.price, 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      }
      console.log('Guest cart after quantity update:', newCart)
      return newCart
    })
  }, [])

  // Remove item from guest cart
  const removeFromCart = useCallback((productId: string) => {
    console.log('Removing product from guest cart:', productId)
    setCart(currentCart => {
      const updatedItems = currentCart.items.filter(item => item.productId !== productId)
      
      const newCart = {
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.price, 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      }
      console.log('Guest cart after removal:', newCart)
      return newCart
    })
  }, [])

  // Clear entire guest cart
  const clearCart = useCallback(() => {
    setCart({
      items: [],
      total: 0,
      itemCount: 0
    })
  }, [])

  // Get cart data for merging with authenticated cart
  const getCartForMerge = useCallback(() => {
    return cart.items.map(item => ({
      productId: parseInt(item.productId),
      quantity: item.quantity
    }))
  }, [cart])

  // Debug function to check cart state
  const debugCart = useCallback(() => {
    console.log('=== Guest Cart Debug ===')
    console.log('isInitialized:', isInitialized)
    console.log('isUpdating:', isUpdatingRef.current)
    console.log('cart:', cart)
    console.log('localStorage:', localStorage.getItem(GUEST_CART_KEY))
    console.log('========================')
  }, [isInitialized, cart])

  return {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartForMerge,
    itemCount: cart.itemCount,
    total: cart.total,
    debugCart
  }
}

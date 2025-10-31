"use client"

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/hooks/useWishlist'
import { useAuth } from '@/hooks/useAuth'

interface WishlistButtonProps {
  productId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  variant?: 'default' | 'outline' | 'ghost'
}

export default function WishlistButton({ 
  productId, 
  className = "",
  size = 'md',
  showText = false,
  variant = 'default'
}: WishlistButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const { isInWishlist, toggleWishlistItem, checkWishlistStatus } = useWishlist()

  // Check wishlist status on mount
  useEffect(() => {
    if (isAuthenticated) {
      checkWishlistStatus(productId)
    }
  }, [productId, checkWishlistStatus, isAuthenticated])

  // Don't render for non-authenticated users
  if (!isAuthenticated) {
    return null
  }

  const handleToggle = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const wasAdded = await toggleWishlistItem(productId)
      
      if (wasAdded) {
        setMessage("Added to wishlist")
      } else {
        setMessage("Removed from wishlist")
      }
      
      // Clear message after 2 seconds
      setTimeout(() => setMessage(null), 2000)
    } catch (error) {
      setMessage("Failed to update wishlist")
      setTimeout(() => setMessage(null), 2000)
    } finally {
      setIsLoading(false)
    }
  }

  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variantClasses = {
    default: "border border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
    outline: "border border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-500",
    ghost: "text-gray-600 hover:bg-gray-50 hover:text-purple-600 focus:ring-purple-500"
  }

  const sizeClasses = {
    sm: "p-2 text-sm",
    md: "p-3 text-sm",
    lg: "p-4 text-base"
  }

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  }

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
  const isInWishlistState = isInWishlist(productId)

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`${buttonClasses} ${isLoading ? "opacity-50 cursor-not-allowed" : ""} group`}
        title={isInWishlistState ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart 
          className={`${iconSizes[size]} ${
            isInWishlistState 
              ? 'fill-red-500 text-red-500' 
              : 'text-gray-400 group-hover:text-red-500'
          } transition-colors`} 
        />
        {showText && (
          <span className="ml-2">
            {isInWishlistState ? 'Saved' : 'Save'}
          </span>
        )}
      </button>
      
      {message && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-10">
          {message}
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { ShoppingCart, Loader2 } from "lucide-react"
import { addToCartAction } from "@/lib/actions"
import { useAuth } from "@/hooks/useAuth"
import { useUnifiedCart } from "@/hooks/useUnifiedCart"
import { useToast } from "@/hooks/use-toast"

interface AddToCartButtonProps {
  productId: string
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
}

export default function AddToCartButton({
  productId,
  className = "",
  variant = "default",
  size = "md",
  disabled = false
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const { isAuthenticated } = useAuth()
  const { addToCart, refetch } = useUnifiedCart()
  const { toast } = useToast()

  const handleAddToCart = async () => {
    setIsLoading(true)

    try {
      if (isAuthenticated) {
        // Use server action for authenticated users
        const result = await addToCartAction(productId, 1)
        
        if (result.success) {
          setIsAdded(true)
          // Refresh cart data
          await refetch()
          // Show success toast
          toast({
            title: "Added to cart!",
            description: result.message || "Product has been added to your cart.",
          })
        } else {
          // Show error toast
          toast({
            title: "Error",
            description: result.error || "Failed to add to cart",
            variant: "destructive",
          })
        }
      } else {
        // Use unified cart for guest users
        await addToCart(productId, 1)
        setIsAdded(true)
        // Show success toast
        toast({
          title: "Added to cart!",
          description: "Product has been added to your cart.",
        })
      }
      
      // Reset button text after 3 seconds
      setTimeout(() => setIsAdded(false), 3000)
    } catch (error) {
      // Show error toast
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variantClasses = {
    default: "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500",
    outline: "border border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-500",
    ghost: "text-purple-600 hover:bg-purple-50 focus:ring-purple-500"
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading}
      className={`${buttonClasses} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : (
        <ShoppingCart className="w-4 h-4 mr-2" />
      )}
      {isLoading ? "Adding..." : isAdded ? "Added!" : "Add to Cart"}
    </button>
  )
}

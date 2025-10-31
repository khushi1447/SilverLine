"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react"
import { useUnifiedCart } from "@/hooks/useUnifiedCart"
import { useAuth } from "@/hooks/useAuth"

export default function CartContent() {
  const MAX_QUANTITY = 9;
  const { isAuthenticated } = useAuth()
  const { cart, loading, error, updateCartItem, removeFromCart, debugCart } = useUnifiedCart()

  // Expose debug function globally for testing
  if (typeof window !== 'undefined') {
    (window as any).debugGuestCart = debugCart
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId)
    } else {
      // Limit quantity to MAX_QUANTITY
      const limitedQuantity = Math.min(quantity, MAX_QUANTITY);
      await updateCartItem(productId, limitedQuantity)
    }
  }

  const removeItem = async (productId: string) => {
    await removeFromCart(productId)
  }


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading cart</h3>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center animate-fade-in">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Discover our beautiful jewelry collection</p>
          <Link href="/shop" className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const shipping = cart.total > 500 ? 0 : 25
  const total = cart.total + shipping

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <p className="text-sm text-blue-800">
              <strong>Guest Mode:</strong> Your cart is saved locally. 
              <Link href="/login" className="text-blue-600 hover:text-blue-800 underline ml-1">
                Sign in
              </Link> to save permanently and access from any device.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={`cart-item-${item.productId}`} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <Link href={`/product/${item.productId}`} className="flex-shrink-0">
                  <Image
                    src={item.product.images.find(img => img.isPrimary)?.url || item.product.images[0]?.url || "/placeholder.svg"}
                    alt={item.product.name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover hover:opacity-75 transition-opacity"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.productId}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-purple-600 transition-colors truncate">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-gray-600 mt-1">₹{item.price.toFixed(2)}</p>
                  {item.quantity >= MAX_QUANTITY && (
                    <p className="text-xs text-amber-600 mt-1">Max quantity reached</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-semibold text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= MAX_QUANTITY}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg p-6 shadow-sm h-fit animate-slide-up">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{cart.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {isAuthenticated ? (
            <Link
              href="/checkout"
              className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors text-center block"
            >
              Proceed to Checkout
            </Link>
          ) : (
            <div className="space-y-3">
              <Link
                href="/login"
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors text-center block"
              >
                Sign In to Checkout
              </Link>
              <p className="text-xs text-gray-500 text-center">
                Guest checkout coming soon
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

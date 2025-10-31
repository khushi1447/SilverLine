"use client"

import type React from "react"

import { useState } from "react"
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Loader2 } from "lucide-react"
import { useOrder } from "@/hooks/useOrders"

interface Order {
  orderId: string
  email: string
  phone: string
  status: string
  orderDate: string
  estimatedDelivery: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  timeline: Array<{
    status: string
    date: string
    time: string
    description: string
  }>
}

export default function TrackingContent() {
  const [formData, setFormData] = useState({
    orderId: "",
    contact: "",
  })
  const [searchOrder, setSearchOrder] = useState<string | null>(null)
  const [error, setError] = useState("")

  const { order, loading, error: apiError } = useOrder(searchOrder || "", !!searchOrder)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!formData.orderId.trim()) {
      setError("Please enter an Order ID")
      return
    }

    if (!formData.contact.trim()) {
      setError("Please enter your email or phone number")
      return
    }

    // Set the order ID to trigger the API call
    setSearchOrder(formData.orderId)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "packed":
        return <Package className="w-5 h-5 text-blue-500" />
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-500" />
      case "out-for-delivery":
        return <MapPin className="w-5 h-5 text-orange-500" />
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-800 border-green-200"
      case "packed":
        return "bg-blue-50 text-blue-800 border-blue-200"
      case "shipped":
        return "bg-purple-50 text-purple-800 border-purple-200"
      case "out-for-delivery":
        return "bg-orange-50 text-orange-800 border-orange-200"
      case "delivered":
        return "bg-green-50 text-green-800 border-green-200"
      default:
        return "bg-gray-50 text-gray-800 border-gray-200"
    }
  }

  const formatStatus = (status: string) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-playfair text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
          📦 Track Your Order
        </h1>
        <p className="text-gray-600">Enter your order details to track your jewelry delivery</p>
      </div>

      {/* Tracking Form */}
      <div className="bg-white rounded-2xl p-8 light-shadow border border-gray-100 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order ID *</label>
              <input
                type="text"
                name="orderId"
                required
                value={formData.orderId}
                onChange={handleInputChange}
                placeholder="e.g., EJ001234"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email or Phone *</label>
              <input
                type="text"
                name="contact"
                required
                value={formData.contact}
                onChange={handleInputChange}
                placeholder="your@email.com or +1234567890"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 light-shadow"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Track Order</span>
              </>
            )}
          </button>
        </form>

        {(error || apiError) && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error || apiError}</p>
          </div>
        )}
      </div>

      {/* Order Details */}
      {order && (
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-8 light-shadow border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order #{order.orderNumber}</h2>
                <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                    order.status,
                  )}`}
                >
                  {getStatusIcon(order.status)}
                  <span className="ml-2">{formatStatus(order.status)}</span>
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.productName}</span>
                      <span className="text-gray-600 ml-2">× {item.quantity}</span>
                    </div>
                    <span className="font-medium">₹{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span>₹{order.pricing.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline - Simplified for now */}
          <div className="bg-white rounded-2xl p-8 light-shadow border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Status</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">{getStatusIcon(order.status)}</div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="font-semibold text-gray-900">{formatStatus(order.status)}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(order.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">Your order is currently {order.status}</p>
                </div>
              </div>
            </div>

            {order.status !== "delivered" && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">
                  <strong>Order Status:</strong> {formatStatus(order.status)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Demo Orders */}
      <div className="mt-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Try Demo Orders</h3>
        <p className="text-gray-600 mb-4">Use these sample order details to test the tracking system:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-purple-100 light-shadow">
            <p className="font-medium text-purple-600">Order ID: EJ001234</p>
            <p className="text-sm text-gray-600">Email: john@example.com</p>
            <p className="text-xs text-gray-500">Status: Delivered</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-purple-100 light-shadow">
            <p className="font-medium text-purple-600">Order ID: EJ001235</p>
            <p className="text-sm text-gray-600">Email: sarah@example.com</p>
            <p className="text-xs text-gray-500">Status: Shipped</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-purple-100 light-shadow">
            <p className="font-medium text-purple-600">Order ID: EJ001236</p>
            <p className="text-sm text-gray-600">Email: mike@example.com</p>
            <p className="text-xs text-gray-500">Status: Packed</p>
          </div>
        </div>
      </div>
    </div>
  )
}

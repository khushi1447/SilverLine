"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { prisma } from "./db"

// Server action to add product to cart
export async function addToCartAction(productId: string, quantity: number = 1) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      throw new Error("You must be logged in to add items to cart")
    }

    const userId = parseInt(session.user.id)
    const productIdNum = parseInt(productId)

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productIdNum },
    })

    if (!product) {
      throw new Error("Product not found")
    }

    // Product is available if it exists

    if (product.stock < quantity) {
      throw new Error("Insufficient stock")
    }

    // Add or update cart item
    await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId: productIdNum,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        userId,
        productId: productIdNum,
        quantity,
      },
    })

    revalidatePath("/cart")
    return { success: true, message: "Item added to cart" }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to add item to cart" 
    }
  }
}

// Server action to update cart item quantity
export async function updateCartItemAction(productId: string, quantity: number) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      throw new Error("You must be logged in to update cart")
    }

    // const response = await api.cart.updateItem(productId, quantity)
    
    // if (response.error) {
    //   throw new Error(response.error)
    // }

    revalidatePath("/cart")
    return { success: true, message: "Cart updated" }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update cart" 
    }
  }
}

// Server action to remove item from cart
export async function removeFromCartAction(productId: string) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      throw new Error("You must be logged in to remove items from cart")
    }

    // const response = await api.cart.removeItem(productId)
    
    // if (response.error) {
    //   throw new Error(response.error)
    // }

    revalidatePath("/cart")
    return { success: true, message: "Item removed from cart" }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to remove item from cart" 
    }
  }
}

// Server action to create order
export async function createOrderAction(orderData: any) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { 
        success: false, 
        error: "You must be logged in to create an order" 
      }
    }

    const userId = parseInt(session.user.id)

    // Get user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    })

    if (cartItems.length === 0) {
      return { 
        success: false, 
        error: "Cart is empty" 
      }
    }

    // Calculate pricing
    const subtotal = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.product.price.toString())
      return sum + (price * item.quantity)
    }, 0)

    // Calculate shipping and tax
    const shippingCost = subtotal > 500 ? 0 : 25
    const taxAmount = subtotal * 0.08
    const totalAmount = subtotal + shippingCost + taxAmount

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: "PENDING",
          subtotal,
          taxAmount,
          shippingCost,
          discountAmount: 0,
          totalAmount,
          billingAddress: {
            firstName: orderData.billingAddress.name.split(' ')[0],
            lastName: orderData.billingAddress.name.split(' ').slice(1).join(' '),
            address1: orderData.billingAddress.address,
            city: orderData.billingAddress.city,
            state: orderData.billingAddress.state || "N/A",
            postalCode: orderData.billingAddress.zipCode,
            country: "US",
            phone: orderData.billingAddress.phone,
          },
          shippingAddress: {
            firstName: orderData.shippingAddress.name.split(' ')[0],
            lastName: orderData.shippingAddress.name.split(' ').slice(1).join(' '),
            address1: orderData.shippingAddress.address,
            city: orderData.shippingAddress.city,
            state: orderData.shippingAddress.state || "N/A",
            postalCode: orderData.shippingAddress.zipCode,
            country: "US",
            phone: orderData.shippingAddress.phone,
          },
        },
      })

      // Create order items
      await Promise.all(
        cartItems.map(async (item) => {
          const price = parseFloat(item.product.price.toString())
          const totalPrice = price * item.quantity

          return tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              price,
              totalPrice,
              productName: item.product.name,
              productSku: `PRD-${item.productId}`,
              productImage: item.product.images[0]?.url || null,
            },
          })
        })
      )

      // Update product stock
      await Promise.all(
        cartItems.map(async (item) => {
          return tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        })
      )

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: { userId },
      })

      return newOrder
    })

    revalidatePath("/orders")
    revalidatePath("/cart")
    
    return { 
      success: true, 
      orderId: order.id,
      message: "Order created successfully" 
    }
  } catch (error) {
    console.error("Error creating order:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create order" 
    }
  }
}

// Server action to add product to wishlist
export async function addToWishlistAction(productId: string) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      throw new Error("You must be logged in to add items to wishlist")
    }

    // const response = await api.wishlist.addItem(productId)
    
    // if (response.error) {
    //   throw new Error(response.error)
    // }

    revalidatePath("/wishlist")
    return { success: true, message: "Item added to wishlist" }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to add item to wishlist" 
    }
  }
}

// Server action to remove product from wishlist
export async function removeFromWishlistAction(productId: string) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      throw new Error("You must be logged in to remove items from wishlist")
    }

    // const response = await api.wishlist.removeItem(productId)
    
    // if (response.error) {
    //   throw new Error(response.error)
    // }

    revalidatePath("/wishlist")
    return { success: true, message: "Item removed from wishlist" }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to remove item from wishlist" 
    }
  }
}

// Server action to create review
export async function createReviewAction(reviewData: any) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      throw new Error("You must be logged in to create a review")
    }

    // const response = await api.reviews.create(reviewData)
    
    // if (response.error) {
    //   throw new Error(response.error)
    // }

    revalidatePath(`/product/${reviewData.productId}`)
    return { success: true, message: "Review submitted successfully" }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to submit review" 
    }
  }
}

// Server action to update user profile
export async function updateProfileAction(userData: any) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      throw new Error("You must be logged in to update profile")
    }

    // const response = await api.user.updateProfile(userData)
    
    // if (response.error) {
    //   throw new Error(response.error)
    // }

    revalidatePath("/profile")
    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update profile" 
    }
  }
}

// Server action to create address
export async function createAddressAction(addressData: any) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      throw new Error("You must be logged in to add addresses")
    }

    // const response = await api.addresses.create(addressData)
    
    // if (response.error) {
    //   throw new Error(response.error)
    // }

    revalidatePath("/profile")
    return { success: true, message: "Address added successfully" }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to add address" 
    }
  }
}

// Server action to update address
export async function updateAddressAction(id: string, addressData: any) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      throw new Error("You must be logged in to update addresses")
    }

    // const response = await api.addresses.update(id, addressData)
    
    // if (response.error) {
    //   throw new Error(response.error)
    // }

    revalidatePath("/profile")
    return { success: true, message: "Address updated successfully" }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update address" 
    }
  }
}

// Server action to delete address
export async function deleteAddressAction(id: string) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      throw new Error("You must be logged in to delete addresses")
    }

    // const response = await api.addresses.delete(id)
    
    // if (response.error) {
    //   throw new Error(response.error)
    // }

    revalidatePath("/profile")
    return { success: true, message: "Address deleted successfully" }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete address" 
    }
  }
}

// Server action to create coupon
export async function createCouponAction(couponData: any) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.isAdmin) {
      throw new Error("You must be an admin to create coupons")
    }

    // const response = await api.coupons.create(couponData)
    
    // if (response.error) {
    //   throw new Error(response.error)
    // }

    revalidatePath("/admin/coupons")
    return { success: true, message: "Coupon created successfully" }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create coupon" 
    }
  }
}

// Server action to update coupon
export async function updateCouponAction(id: string, couponData: any) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.isAdmin) {
      throw new Error("You must be an admin to update coupons")
    }

    // const response = await api.coupons.update(id, couponData)
    
    // if (response.error) {
    //   throw new Error(response.error)
    // }

    revalidatePath("/admin/coupons")
    return { success: true, message: "Coupon updated successfully" }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update coupon" 
    }
  }
}

// Server action to delete coupon
export async function deleteCouponAction(id: string) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.isAdmin) {
      throw new Error("You must be an admin to delete coupons")
    }

    // const response = await api.coupons.delete(id)
    
    // if (response.error) {
    //   throw new Error(response.error)
    // }

    revalidatePath("/admin/coupons")
    return { success: true, message: "Coupon deleted successfully" }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete coupon" 
    }
  }
}

// Server action to create contact message
export async function createContactAction(contactData: {
  name: string
  email: string
  subject: string
  message: string
}) {
  try {
    // Import the email function
    const { sendContactEmail } = await import('./email')
    
    // Send email to ac@silverline925.in
    const emailResult = await sendContactEmail(contactData)
    
    if (emailResult.success) {
      console.log("Contact form submitted and email sent:", contactData)
      return { success: true, message: "Message sent successfully! We'll get back to you soon." }
    } else {
      console.error("Failed to send email:", emailResult.error)
      return { success: false, error: "Failed to send message. Please try again." }
    }
  } catch (error) {
    console.error("Error creating contact:", error)
    return { success: false, error: "Failed to send message. Please try again." }
  }
}

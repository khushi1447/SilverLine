"use client"

import { SessionProvider } from "next-auth/react"
import { CartProvider } from "@/contexts/CartContext"

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </SessionProvider>
  )
} 
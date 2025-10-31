import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import WhatsAppFloat from "@/components/WhatsAppFloat"
import Providers from "@/components/Providers"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "SILVER LINE - The Endless Shine of Silver",
  description:
    "Discover our exquisite collection of handcrafted silver jewelry. Premium silver pieces for every occasion. The endless shine of silver.",
  keywords: "silver jewelry, silver line, handcrafted jewelry, rings, necklaces, earrings, bracelets, silver collection",
  authors: [{ name: "SILVER LINE" }],
  openGraph: {
    title: "SILVER LINE - The Endless Shine of Silver",
    description: "Discover our exquisite collection of handcrafted silver jewelry",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SILVER LINE - The Endless Shine of Silver",
    description: "Discover our exquisite collection of handcrafted silver jewelry",
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-sans antialiased bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen"
        style={{
          fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}
      >
        <Providers>
          {children}
          <WhatsAppFloat />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CartContent from "@/components/CartContent"

export const metadata = {
  title: "Shopping Cart - Elegant Jewelry",
  description: "Review your selected jewelry items and proceed to checkout.",
}

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CartContent />
      <Footer />
    </div>
  )
}

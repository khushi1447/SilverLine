import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ShopContent from "@/components/ShopContent"

export const metadata = {
  title: "Shop - Elegant Jewelry Collection",
  description: "Browse our complete collection of handcrafted jewelry. Filter by category, price, and metal type.",
}

export default function ShopPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <ShopContent />
      <Footer />
    </div>
  )
}

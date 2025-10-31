import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">
            Sorry, we couldn't find the product you're looking for.
          </p>
          <div className="space-y-4">
            <Link 
              href="/shop"
              className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse All Products
            </Link>
            <div>
              <Link 
                href="/"
                className="text-purple-600 hover:text-purple-700 underline"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

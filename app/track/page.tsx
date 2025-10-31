import Header from "@/components/Header"
import Footer from "@/components/Footer"
import TrackingContent from "@/components/TrackingContent"

export const metadata = {
  title: "Track Your Order - Elegant Jewelry",
  description: "Track your jewelry order status and delivery information.",
}

export default function TrackPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <TrackingContent />
      <Footer />
    </div>
  )
}

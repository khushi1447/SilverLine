import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Award, Users, Heart, Gem } from "lucide-react"

const metadata = {
  title: "About Us - Silver Line",
  description: "Learn about Silver Line's story, craftsmanship, and commitment to creating beautiful jewelry. Discover our values and passion for excellence.",
  keywords: "about Silver Line, jewelry story, craftsmanship, handmade jewelry, our values",
  openGraph: {
    title: "About Us - Silver Line",
    description: "Learn about Silver Line's story, craftsmanship, and commitment to creating beautiful jewelry.",
    url: "https://silverline925.in/about",
    siteName: "Silver Line",
    images: [
      {
        url: "/placeholder.jpg",
        width: 1200,
        height: 630,
        alt: "About Silver Line",
      },
    ],
    locale: "en_US",
    type: "website",
  },
}


export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-slide-up">
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Story</h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              For over two decades, <span className="font-semibold text-pink-600">Silver Line</span> has been crafting timeless pieces that celebrate life's most
              precious moments. Each piece tells a story of artistry, passion, and dedication.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center animate-fade-in bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 rounded-2xl shadow-md p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gem className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Premium Quality</h3>
              <p className="text-gray-700">We use only the finest materials and gemstones in our creations.</p>
            </div>
            <div className="text-center animate-fade-in bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 rounded-2xl shadow-md p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Expert Craftsmanship</h3>
              <p className="text-gray-700">Our master jewelers bring decades of experience to every piece.</p>
            </div>
            <div className="text-center animate-fade-in bg-gradient-to-br from-blue-100 via-pink-100 to-purple-100 rounded-2xl shadow-md p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Made with Love</h3>
              <p className="text-gray-700">Every piece is crafted with passion and attention to detail.</p>
            </div>
            <div className="text-center animate-fade-in bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100 rounded-2xl shadow-md p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Customer First</h3>
              <p className="text-gray-700">Your satisfaction and happiness are our top priorities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Divider */}
      <div className="h-2 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 opacity-60 rounded-full my-8 max-w-4xl mx-auto" />

      {/* Story Section */}
      <section className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-6">Crafting Beauty Since 2000</h2>
              <p className="text-gray-600 mb-4">
                What started as a small family workshop has grown into a trusted name in fine jewelry. Our founder's
                vision was simple: create beautiful, lasting pieces that bring joy to people's lives.
              </p>
              <p className="text-gray-600 mb-4">
                Today, we continue that tradition with the same commitment to quality and craftsmanship. Every piece in
                our collection is carefully designed and meticulously crafted by skilled artisans who share our passion
                for excellence.
              </p>
              <p className="text-gray-600">
                We believe that jewelry is more than just an accessory – it's a way to express your unique style and
                commemorate life's special moments.
              </p>
            </div>

            <div className="animate-fade-in">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src="/images/about.jpeg"
                  alt="Jewelry crafting process"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

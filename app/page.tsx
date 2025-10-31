'use client'

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ProductCard from "@/components/ProductCard"
import ProductCardSkeleton from "@/components/ProductCardSkeleton"
import { useProducts } from "@/hooks/useProducts"
import { Star, Truck, Shield, Headphones } from "lucide-react"
import { useRouter } from "next/navigation"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"
import { useState, useEffect } from "react"

const metadata = {
  title: "Silver Line - Handcrafted Jewelry for Every Occasion",
  description: "Discover Silver Line's exquisite collection of handcrafted jewelry. Shop rings, necklaces, earrings, and more. Free shipping, premium quality, and lifetime warranty.",
  keywords: "jewelry, silver, rings, necklaces, earrings, handcrafted, shop, Silver Line, buy jewelry online",
  openGraph: {
    title: "Silver Line - Handcrafted Jewelry for Every Occasion",
    description: "Discover Silver Line's exquisite collection of handcrafted jewelry. Shop rings, necklaces, earrings, and more.",
    url: "https://silverline925.in/",
    siteName: "Silver Line",
    images: [
      {
        url: "/placeholder.jpg",
        width: 1200,
        height: 630,
        alt: "Silver Line Jewelry Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function Home() {
  const router = useRouter()
  const { products, loading, error } = useProducts({ 
    page: 1, 
    limit: 4, 
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  // Fetch 8 most recent products for banner slider
  const { products: bannerProducts, loading: bannerLoading } = useProducts({ 
    page: 1, 
    limit: 8, 
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaApi, setEmblaApi] = useState<CarouselApi | undefined>(undefined);
  
  // Create dynamic slider images from recent products
  const sliderImages = bannerProducts.map(product => {
    const primaryImage = product.images.find(img => img.isPrimary);
    return {
      src: primaryImage?.url || product.images[0]?.url || "/placeholder.svg",
      alt: product.name,
      productId: product.id
    };
  });
  
  const totalSlides = sliderImages.length;

  useEffect(() => {
    if (emblaApi) {
      const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
      emblaApi.on("select", onSelect);
      setSelectedIndex(emblaApi.selectedScrollSnap());
      return () => {
        emblaApi.off("select", onSelect);
      };
    }
  }, [emblaApi]);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Banner Slider */}
      <section className="w-full mb-6">
        <div className="relative w-full">
          {bannerLoading ? (
            <div className="aspect-[4/3] sm:aspect-[3/2] lg:aspect-[32/9] flex items-center justify-center bg-gray-100" style={{ minHeight: '400px' }}>
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base">Loading featured products...</p>
              </div>
            </div>
          ) : sliderImages.length > 0 ? (
            <Carousel className="w-full relative overflow-hidden" setApi={setEmblaApi}>
              <CarouselContent>
                {sliderImages.map((img, i) => (
                  <CarouselItem key={i} className="aspect-[4/3] sm:aspect-[3/2] lg:aspect-[32/9] flex items-center justify-center w-full">
                    <div 
                      className="relative w-full h-full cursor-pointer group"
                      onClick={() => router.push(`/product/${img.productId}`)}
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        style={{ minHeight: '400px' }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 px-3 py-2 sm:px-4 sm:py-2 rounded-full">
                          <span className="text-gray-800 font-semibold text-sm sm:text-base">View Product</span>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          ) : (
            <div className="aspect-[4/3] sm:aspect-[3/2] lg:aspect-[32/9] flex items-center justify-center bg-gray-100" style={{ minHeight: '400px' }}>
              <div className="text-center">
                <p className="text-gray-600 text-sm sm:text-base">No products available</p>
              </div>
            </div>
          )}
          
          {/* Dot Indicators: Only show previous, current, and next */}
          {sliderImages.length > 0 && (
            <div className="flex justify-center gap-2 sm:gap-3 mt-3 sm:mt-4">
              {sliderImages.map((_, idx) => {
                // Only show the previous, current, and next dot
                if (Math.abs(selectedIndex - idx) > 2) return null;
                return (
                  <button
                    key={idx}
                    onClick={() => emblaApi && emblaApi.scrollTo(idx)}
                    className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all duration-300 ${selectedIndex === idx ? 'bg-gray-500' : 'bg-gray-300'} focus:outline-none`}
                    aria-label={`Go to slide ${idx + 1}`}
                    type="button"
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-200/40 rounded-full blur-xl animate-float"></div>
          <div
            className="absolute top-32 right-20 w-16 h-16 bg-pink-200/40 rounded-full blur-xl animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-200/40 rounded-full blur-xl animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 right-1/3 w-12 h-12 bg-purple-200/40 rounded-full blur-xl animate-float"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-slide-up">
            <h1 className="font-playfair text-4xl md:text-6xl font-bold text-gray-800 mb-6 drop-shadow-sm">
              ✨Timeless Elegance✨
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover our exquisite collection of handcrafted jewelry, where every piece tells a story of beauty and
              sophistication. 💎
            </p>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-lg font-semibold light-shadow-lg hover:light-shadow-xl transform hover:scale-105" onClick={() => router.push("/shop")}>
              🛍️ Shop Collection
            </button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
              ✨ Featured Collection ✨
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our carefully curated selection of premium jewelry pieces, each designed to celebrate life's most
              precious moments. 💎
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Failed to load products: {error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
 
      {/* Features */}
      <section className="py-16 bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center animate-fade-in group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 light-shadow group-hover:light-shadow-lg">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-800">🚚 Free Shipping</h3>
              <p className="text-gray-600 text-sm">Free shipping on orders over ₹5000</p>
            </div>
            <div className="text-center animate-fade-in group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4 light-shadow group-hover:light-shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-800">🛡️ Lifetime Warranty</h3>
              <p className="text-gray-600 text-sm">Lifetime warranty on all jewelry</p>
            </div>
            <div className="text-center animate-fade-in group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 light-shadow group-hover:light-shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-800">⭐ Premium Quality</h3>
              <p className="text-gray-600 text-sm">Handcrafted with finest materials</p>
            </div>
            <div className="text-center animate-fade-in group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 light-shadow group-hover:light-shadow-lg">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-800">🎧 24/7 Support</h3>
              <p className="text-gray-600 text-sm">Expert customer support</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
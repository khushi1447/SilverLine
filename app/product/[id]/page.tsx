import { notFound } from "next/navigation"
import { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ProductDetails from "@/components/ProductDetails"
import { getProductById } from "@/lib/services/product"

interface ProductPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {    
  try {
    const { id } = await params
    const productId = parseInt(id)
    
    if (isNaN(productId)) {
      return {
        title: "Product Not Found",
      }
    }
    
    const product = await getProductById(productId)
    
    if (!product) {
      return {
        title: "Product Not Found",
      }
    }

    return {
      title: `${product.name} - Elegant Jewelry`,
      description: product.shortDescription || product.description,
      openGraph: {
        title: product.name,
        description: product.shortDescription || product.description || undefined,
        images: product.images.map(img => img.url),
      },
    }
  } catch (error) {
    return {
      title: "Product Not Found",
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const { id } = await params
    
    // Validate ID format
    if (!id || isNaN(Number(id))) {
      console.error('Invalid product ID:', id)
      notFound()
    }
    
    const productId = parseInt(id)
    console.log('Fetching product with ID:', productId)
    
    const product = await getProductById(productId)
    
    if (!product) {
      console.error('Product not found for ID:', productId)
      notFound()
    }

    console.log('Product found:', product.name)

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <ProductDetails product={product as any} />
        <Footer />
      </div>
    )
  } catch (error) {
    console.error('Error in ProductPage:', error)
    notFound()
  }
}

// Note: We can't use generateStaticParams with dynamic API data
// If you want static generation, you'll need to fetch all product IDs at build time
// export async function generateStaticParams() {
//   const response = await api.products.getAll({ limit: 1000 })
//   if (response.data?.products) {
//     return response.data.products.map((product) => ({
//       id: product.id,
//     }))
//   }
//   return []
// }

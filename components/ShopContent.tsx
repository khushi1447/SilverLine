"use client"

import { useState, useMemo, useEffect } from "react"
import { Filter, Grid, List, Loader2 } from "lucide-react"
import ProductCard from "@/components/ProductCard"
import ProductCardSkeleton from "@/components/ProductCardSkeleton"
import CustomSelect from "@/components/ui/custom-select"
import { useProducts } from "@/hooks/useProducts"
import { useCategories } from "@/hooks/useCategories"
import { useCategoryStats } from "@/hooks/useCategoryStats"
import type { Product } from "@/contexts/CartContext"

export default function ShopContent() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState("featured")
  const [currentPage, setCurrentPage] = useState(1)

  // Use our custom hooks
  const { categories } = useCategories()
  const { categoryStats, loading: statsLoading } = useCategoryStats()
  
  const { products, pagination, loading, error, refetch } = useProducts({
    page: currentPage,
    limit: 12,
    search,
    categoryId: selectedCategory !== "all" && categories ? 
      categories.find(cat => cat.name === selectedCategory)?.id : undefined,
    sortBy: sortBy === "featured" ? "createdAt" : "price",
    sortOrder: sortBy === "price-high" ? "desc" : "asc",
  })

  // Convert API products to CartContext Product format
  const convertedProducts: Product[] = useMemo(() => {
    return products.map((apiProduct) => ({
      id: apiProduct.id,
      name: apiProduct.name,
      price: apiProduct.price,
      image: apiProduct.images.find(img => img.isPrimary)?.url || apiProduct.images[0]?.url || "/placeholder.svg",
      description: apiProduct.shortDescription || apiProduct.description || "",
      category: apiProduct.category.name,
      metalType: "Silver", // You might want to add this to your API
      inStock: apiProduct.stock > 0,
    }))
  }, [products])

  // Create category options for custom select
  const categoryOptions = useMemo(() => {
    const totalCount = pagination?.totalCount || products.length
    const options = [
      { value: "all", label: `All (${totalCount})` }
    ]
    
    if (categories && categories.length > 0) {
      categories.forEach((category) => {
        const count = categoryStats[category.name] || 0
        options.push({
          value: category.name,
          label: `${category.name} (${count})`
        })
      })
    }
    
    return options
  }, [categories, categoryStats, pagination?.totalCount, products.length])

  // Create sort options for custom select
  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" }
  ]

  // No need for client-side filtering since we're using server-side filtering
  const filteredProducts = convertedProducts

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1) // Reset to first page when category changes
  }

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  if (loading && products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
            ✨ Shop Our Collection ✨
          </h1>
          <p className="text-gray-600 text-lg">Handcrafted jewelry pieces designed to celebrate life's precious moments</p>
        </div>

        {/* Controls: Search, Filters, Sort */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        {/* Search, Category, and Sort in one row */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search for jewelry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Category and Sort Dropdowns in one row on mobile */}
          <div className="flex flex-row gap-2 sm:gap-4 min-w-0">
            {/* Category Dropdown */}
            <div className="flex-1 sm:w-64 min-w-0">
              <CustomSelect
                value={selectedCategory}
                onChange={handleCategoryChange}
                options={categoryOptions}
                placeholder="Loading categories..."
                className="w-full"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex-1 sm:w-[200px] min-w-0">
              <CustomSelect
                value={sortBy}
                onChange={setSortBy}
                options={sortOptions}
                placeholder="Sort by..."
                className="w-full"
              />
            </div>
          </div>
        </div>
        </div>

        {/* Product Count */}
        <div className="mb-4 text-gray-600 text-sm">
          Loading products...
        </div>

        {/* Skeleton Products Grid */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-12 bg-white rounded-2xl light-shadow">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading products</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="font-playfair text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
          ✨ Shop Our Collection ✨
        </h1>
        <p className="text-gray-600 text-lg">Handcrafted jewelry pieces designed to celebrate life's precious moments</p>
      </div>

      {/* Controls: Search, Filters, Sort */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        {/* Search, Category, and Sort in one row */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search for jewelry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Category and Sort Dropdowns in one row on mobile */}
          <div className="flex flex-row gap-2 sm:gap-4 min-w-0">
            {/* Category Dropdown */}
            <div className="flex-1 sm:w-64 min-w-0">
              <CustomSelect
                value={selectedCategory}
                onChange={handleCategoryChange}
                options={categoryOptions}
                placeholder="Loading categories..."
                className="w-full"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex-1 sm:w-[200px] min-w-0">
              <CustomSelect
                value={sortBy}
                onChange={setSortBy}
                options={sortOptions}
                placeholder="Sort by..."
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Count */}
      <div className="mb-4 text-gray-600 text-sm">
        {selectedCategory === "all" 
          ? `${pagination?.totalCount || filteredProducts.length} products found` 
          : `${pagination?.totalCount || filteredProducts.length} products found in ${selectedCategory}`
        }
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
          {filteredProducts.map((product) => {
            // Find the original API product
            const apiProduct = products.find(p => p.id === product.id);
            return apiProduct ? <ProductCard key={product.id} product={apiProduct} /> : null;
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl light-shadow">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">Try a different search or filter</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
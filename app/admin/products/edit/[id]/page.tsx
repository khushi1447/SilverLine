"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useImageUpload, type UploadedImage } from "@/hooks/useImageUpload"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/ui/image-upload"

interface ProductFormData {
  name: string
  description: string
  price: string
  stock: string
  categoryId: string
  weight: string
  size: string
  images: UploadedImage[]
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    weight: "",
    size: "",
    images: []
  })

  const { uploadImages, uploading: imageUploading } = useImageUpload()

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        } else {
          console.error('Failed to fetch categories')
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch product')
        }
        const productData = await response.json()
        setProduct(productData)
        
        // Convert product data to form data
        setFormData({
          name: productData.name || "",
          description: productData.description || "",
          price: productData.price?.toString() || "",
          stock: productData.stock?.toString() || "",
          categoryId: productData.category?.id?.toString() || "",
          weight: productData.weight?.toString() || "",
          size: productData.size || "",
          images: productData.images?.map((img: any, index: number) => ({
            url: img.url,
            altText: img.altText || `${productData.name} - Image ${index + 1}`,
            isPrimary: img.isPrimary || index === 0,
          })) || []
        })
      } catch (error) {
        console.error('Error fetching product:', error)
        toast({
          title: "Error",
          description: "Failed to fetch product data",
          variant: "destructive",
        })
        router.push('/admin/products')
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, router, toast])

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImagesChange = (images: UploadedImage[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }))
  }

  const validateForm = () => {
    const errors: string[] = []

    if (!formData.name.trim()) errors.push("Product name is required")
    if (!formData.description.trim()) errors.push("Description is required")
    if (!formData.price || parseFloat(formData.price) <= 0) errors.push("Valid price is required")
    if (!formData.stock || parseInt(formData.stock) < 0) errors.push("Valid stock quantity is required")
    if (!formData.categoryId) errors.push("Category is required")
    if (!formData.size.trim()) errors.push("Size is required")
    if (formData.images.length < 3) errors.push("Minimum 3 images required")
    if (formData.images.length > 10) errors.push("Maximum 10 images allowed")

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateForm()
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // First upload images if they haven't been uploaded yet
      let uploadedImages = formData.images
      const imagesToUpload = formData.images.filter(img => img.file && !img.url)

      if (imagesToUpload.length > 0) {
        toast({
          title: "Uploading images...",
          description: "Please wait while images are being uploaded.",
        })

        // Create FormData for image upload
        const formDataForUpload = new FormData()
        imagesToUpload.forEach(img => {
          if (img.file) {
            formDataForUpload.append('images', img.file)
          }
        })

        // Upload images directly
        const uploadResponse = await fetch('/api/upload/images', {
          method: 'POST',
          body: formDataForUpload,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || 'Image upload failed')
        }

        const { images: uploadedImageResults } = await uploadResponse.json()

        // Update the images with uploaded URLs
        let uploadIndex = 0
        uploadedImages = formData.images.map(img => {
          if (img.file && !img.url) {
            const uploadedImage = uploadedImageResults[uploadIndex]
            uploadIndex++
            return {
              ...img,
              url: uploadedImage.url,
              file: undefined, // Remove file reference after upload
            }
          }
          return img
        })

        // Update form data with uploaded images
        setFormData(prev => ({
          ...prev,
          images: uploadedImages
        }))
      }

      // Prepare image data for API
      const imageData = uploadedImages.map(img => ({
        url: img.url,
        altText: img.altText || `${formData.name} - Product Image`,
        isPrimary: img.isPrimary
      }))

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: parseInt(formData.categoryId),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        size: formData.size.trim() || null,
        images: imageData
      }

      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update product')
      }

      const result = await response.json()
      
      toast({
        title: "Product Updated",
        description: "Product has been successfully updated.",
      })

      // Redirect to products page
      router.push('/admin/products')
      
    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/products')
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-muted-foreground">Loading product...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hover:bg-primary/10 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">Update product information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <p className="text-sm text-muted-foreground">Update product details below</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                    className="focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => handleInputChange("categoryId", value)} disabled={categoriesLoading}>
                    <SelectTrigger className="focus:ring-primary focus:border-primary">
                      <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                  className="focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            {/* Pricing & Stock */}
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="0.00"
                    className="focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange("stock", e.target.value)}
                    placeholder="0"
                    className="focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="size">Size *</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => handleInputChange("size", e.target.value)}
                    placeholder="e.g., Ring size 7, 18 inches chain"
                    className="focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (grams)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    placeholder="0.0"
                    className="focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
            {/* Product Images */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Product Images *</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add minimum 3 high-quality product images. First image will be the primary display image.
                </p>
              </div>
              <ImageUpload
                value={formData.images}
                onChange={handleImagesChange}
                maxImages={10}
                minImages={3}
                required
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                disabled={loading || imageUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="hover:bg-primary/90"
                disabled={loading || imageUploading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Update Product
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

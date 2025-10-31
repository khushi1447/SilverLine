"use client";

import Image from "next/image";
import { useState } from "react";
import { ShoppingCart, Heart, Share2, Star, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { type ApiProduct } from "@/types/api";
import { type ProductWithDetails } from "@/lib/services/product";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";
import ProductReviews from "./ProductReviews";

interface ProductDetailsProps {
  product: ApiProduct | ProductWithDetails;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const MAX_QUANTITY = 9;
  const [quantity, setQuantity] = useState(1);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  
  const images = product.images || [];
  const maxThumbnails = 4; // Number of thumbnails to show at once

  // Thumbnail navigation functions
  const canScrollLeft = thumbnailStartIndex > 0;
  const canScrollRight = thumbnailStartIndex + maxThumbnails < images.length;
  
  const scrollThumbnailsLeft = () => {
    if (canScrollLeft) {
      setThumbnailStartIndex(prev => Math.max(0, prev - 1));
    }
  };
  
  const scrollThumbnailsRight = () => {
    if (canScrollRight) {
      setThumbnailStartIndex(prev => Math.min(images.length - maxThumbnails, prev + 1));
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out this beautiful ${product.name} - ₹${product.price}`,
      url: window.location.href,
    };

    // Check if Web Share API is supported
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare(shareData)
    ) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled sharing or error occurred
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: Copy link to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy link:", error);
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 2000);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image Gallery */}
        <div className="animate-fade-in">
          {/* Main Image Display */}
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4 relative group">
            <Image
              src={images[selectedImageIndex]?.url || "/placeholder.svg"}
              alt={images[selectedImageIndex]?.altText || product.name}
              width={600}
              height={600}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Rating overlay */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">
                {"stats" in product ? product.stats.averageRating : 4.8}
              </span>
              <span className="text-gray-500 text-sm">
                | {("stats" in product ? product.stats.reviewCount : product.reviewCount || 0)}
              </span>
            </div>
            
            {/* Action icon overlay */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Share2 className="w-5 h-5 text-gray-600" />
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="relative">
              {/* Left Arrow */}
              {canScrollLeft && (
                <button
                  onClick={scrollThumbnailsLeft}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  aria-label="Previous images"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
              )}

              {/* Thumbnail Container */}
              <div className="flex space-x-2 overflow-hidden px-2">
                {images
                  .slice(thumbnailStartIndex, thumbnailStartIndex + maxThumbnails)
                  .map((image, index) => {
                    const actualIndex = thumbnailStartIndex + index;
                    const isSelected = actualIndex === selectedImageIndex;
                    
                    return (
                      <button
                        key={actualIndex}
                        onClick={() => setSelectedImageIndex(actualIndex)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                          isSelected
                            ? "border-gray-900 ring-2 ring-gray-900 ring-opacity-20 scale-105"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                        aria-label={`View image ${actualIndex + 1} of ${images.length}`}
                      >
                        <Image
                          src={image.url}
                          alt={image.altText || `${product.name} - Image ${actualIndex + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
              </div>

              {/* Right Arrow */}
              {canScrollRight && (
                <button
                  onClick={scrollThumbnailsRight}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  aria-label="Next images"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              )}

              {/* Image Counter */}
              {images.length > maxThumbnails && (
                <div className="text-center mt-2">
                  <span className="text-sm text-gray-500">
                    {selectedImageIndex + 1} of {images.length}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="animate-slide-up">

          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          <p className="text-3xl font-bold text-gray-900 mb-6">
            ₹{product.price}
          </p>

          <p className="text-gray-600 mb-8 leading-relaxed">
            {product.description}
          </p>

          <div className="space-y-6">
            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity {quantity >= MAX_QUANTITY && <span className="text-xs text-gray-500">(Max: {MAX_QUANTITY})</span>}
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(MAX_QUANTITY, quantity + 1))}
                  disabled={quantity >= MAX_QUANTITY}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                >
                  +
                </button>
              </div>
              {quantity >= MAX_QUANTITY && (
                <p className="text-xs text-amber-600 mt-1">Maximum quantity reached</p>
              )}
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Product Details</h3>
              <ul className="space-y-2 text-gray-600">
                {product.category && (
                  <li>• <span className="font-medium">Category:</span> {product.category.name}</li>
                )}
                {product.size && (
                  <li>• <span className="font-medium">Size:</span> {product.size}</li>
                )}
                {product.weight && (
                  <li>• <span className="font-medium">Weight:</span> {product.weight}g</li>
                )}
                <li>• <span className="font-medium">Stock:</span> {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <AddToCartButton
                productId={product.id}
                className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
              />

              <WishlistButton
                productId={product.id}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              />

              <button
                onClick={handleShare}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group relative"
                title="Share this product"
              >
                {isLinkCopied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Share2 className="w-5 h-5 group-hover:text-purple-600 transition-colors" />
                )}
                {isLinkCopied && (
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Link copied!
                  </div>
                )}
              </button>
            </div>

            {/* Product Details */}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {/* {"reviews" in product && "stats" in product && (
        <ProductReviews
          reviews={product.reviews}
          averageRating={product.stats.averageRating}
          reviewCount={product.stats.reviewCount}
          productId={product.id}
        />
      )} */}
    </div>
  );
}

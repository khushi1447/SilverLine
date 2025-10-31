"use client"

import { Star, ThumbsUp, CheckCircle, MessageSquare } from "lucide-react"
import { useState } from "react"
import ReviewForm from "./ReviewForm"

interface Review {
  id: number;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  helpfulCount: number;
  user: {
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
}

interface ProductReviewsProps {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  productId: string;
}

export default function ProductReviews({ reviews, averageRating, reviewCount, productId }: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [helpfulLoading, setHelpfulLoading] = useState<number | null>(null)
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => {
      const starNumber = i + 1;
      const isFullStar = starNumber <= Math.floor(rating);
      const isHalfStar = starNumber === Math.ceil(rating) && rating % 1 !== 0;
      
      return (
        <div key={i} className="relative">
          <Star
            className={`w-4 h-4 ${
              isFullStar ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
          {isHalfStar && (
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          )}
        </div>
      );
    });
  };

  const handleHelpfulVote = async (reviewId: number) => {
    setHelpfulLoading(reviewId)
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
      })
      
      if (response.ok) {
        // Refresh the page to show updated helpful count
        window.location.reload()
      }
    } catch (error) {
      console.error('Error voting helpful:', error)
    } finally {
      setHelpfulLoading(null)
    }
  }

  return (
    <div className="mt-16 border-t pt-12">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>
        
        {/* Rating Summary */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {renderStars(averageRating)}
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <span className="text-gray-600">
            Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-8">
          <ReviewForm 
            productId={productId} 
            onReviewSubmitted={() => {
              setShowReviewForm(false)
              window.location.reload()
            }} 
          />
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-8">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">
                      {review.user.firstName.charAt(0)}{review.user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">
                        {review.user.firstName} {review.user.lastName}
                      </span>
                      {review.isVerified && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ml-13">
                <h3 className="font-semibold text-gray-900 mb-2">{review.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{review.comment}</p>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleHelpfulVote(review.id)}
                    disabled={helpfulLoading === review.id}
                    className="flex items-center space-x-2 text-sm text-gray-500 hover:text-purple-600 transition-colors disabled:opacity-50"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>
                      {helpfulLoading === review.id 
                        ? "Updating..." 
                        : `${review.helpfulCount} people found this helpful`
                      }
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600">
            Be the first to review this product and help other customers make their decision.
          </p>
        </div>
      )}
    </div>
  );
}

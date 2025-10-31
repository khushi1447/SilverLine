import { Skeleton } from "@/components/ui/skeleton"

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image skeleton */}
      <Skeleton className="w-full h-48 bg-gray-200" />
      
      {/* Content skeleton */}
      <div className="p-4">
        {/* Title skeleton */}
        <Skeleton className="h-5 w-3/4 mb-2 bg-gray-200" />
        
        {/* Price skeleton */}
        <Skeleton className="h-6 w-1/2 mb-3 bg-gray-200" />
        
        {/* Rating skeleton */}
        <div className="flex items-center mb-3">
          <Skeleton className="h-4 w-20 bg-gray-200" />
        </div>
        
        {/* Button skeleton */}
        <Skeleton className="h-10 w-full bg-gray-200" />
      </div>
    </div>
  )
}

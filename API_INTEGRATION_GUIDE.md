# API Integration Guide for Next.js E-commerce

This guide explains how to replace static data with real API data in your Next.js application while maintaining performance and user experience.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [API Service Layer](#api-service-layer)
3. [Custom Hooks](#custom-hooks)
4. [Server Actions](#server-actions)
5. [Performance Optimizations](#performance-optimizations)
6. [Error Handling](#error-handling)
7. [Authentication](#authentication)
8. [Examples](#examples)
9. [Best Practices](#best-practices)

## Architecture Overview

Our API integration follows a layered architecture:

```
Components → Custom Hooks → API Service Layer → Backend APIs
     ↓              ↓              ↓              ↓
UI Layer    State Management   HTTP Client    Database
```

### Key Benefits:
- **Separation of Concerns**: Each layer has a specific responsibility
- **Reusability**: API functions can be used across components
- **Type Safety**: Full TypeScript support with proper interfaces
- **Error Handling**: Centralized error handling and user feedback
- **Performance**: Optimized with caching and server actions

## API Service Layer

The API service layer (`lib/api.ts`) provides a centralized way to interact with your backend APIs.

### Features:
- **Generic HTTP client** with error handling
- **Authentication support** with session management
- **Type-safe responses** with TypeScript interfaces
- **Consistent error handling** across all endpoints

### Example Usage:

```typescript
// Get all products with pagination and filters
const response = await api.products.getAll({
  page: 1,
  limit: 12,
  search: "ring",
  categoryId: 1,
  minPrice: 100,
  maxPrice: 500
})

// Get a single product
const product = await api.products.getById("123")

// Add item to cart
const cartResponse = await api.cart.addItem("123", 2)
```

## Custom Hooks

Custom hooks provide a clean interface for components to interact with APIs while managing loading states, errors, and data.

### Available Hooks:

#### `useProducts(options)`
```typescript
const { products, pagination, loading, error, refetch } = useProducts({
  page: 1,
  limit: 12,
  search: "ring",
  categoryId: 1,
  status: "active"
})
```

#### `useProduct(id)`
```typescript
const { product, loading, error, refetch } = useProduct("123")
```

#### `useCart()`
```typescript
const { cart, loading, error, addToCart, updateCartItem, removeFromCart } = useCart()
```

#### `useOrders(options)`
```typescript
const { orders, pagination, loading, error, createOrder } = useOrders({
  page: 1,
  limit: 10,
  status: "pending"
})
```

### Hook Features:
- **Automatic data fetching** on mount
- **Loading states** for better UX
- **Error handling** with user-friendly messages
- **Refetch capabilities** for data updates
- **Optimistic updates** for better performance

## Server Actions

Server actions provide a way to perform mutations on the server side with better performance and SEO.

### Benefits:
- **Better Performance**: No client-side JavaScript for mutations
- **SEO Friendly**: Actions work without JavaScript
- **Progressive Enhancement**: Works with or without JS
- **Automatic Revalidation**: Cache invalidation handled automatically

### Example Server Action:

```typescript
// lib/actions.ts
export async function addToCartAction(productId: string, quantity: number = 1) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      throw new Error("You must be logged in to add items to cart")
    }

    const response = await api.cart.addItem(productId, quantity)
    
    if (response.error) {
      throw new Error(response.error)
    }

    revalidatePath("/cart")
    return { success: true, message: "Item added to cart" }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to add item to cart" 
    }
  }
}
```

### Using Server Actions in Components:

```typescript
// components/AddToCartButton.tsx
export default function AddToCartButton({ productId }: { productId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleAddToCart = async () => {
    setIsLoading(true)
    const result = await addToCartAction(productId, 1)
    
    if (result.success) {
      setMessage(result.message)
    } else {
      setMessage(result.error)
    }
    setIsLoading(false)
  }

  return (
    <button onClick={handleAddToCart} disabled={isLoading}>
      {isLoading ? "Adding..." : "Add to Cart"}
    </button>
  )
}
```

## Performance Optimizations

### 1. Caching Strategies

#### Client-Side Caching
```typescript
// Custom hook with caching
export function useProducts(options) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const response = await api.products.getAll(options)
      setData(response.data)
      setLoading(false)
    }
    fetchData()
  }, [JSON.stringify(options)]) // Memoize options

  return { products: data?.products, loading }
}
```

#### Server-Side Caching
```typescript
// Next.js cache and revalidate
export async function getProducts() {
  const response = await fetch('/api/products', {
    next: { 
      revalidate: 3600, // Cache for 1 hour
      tags: ['products'] 
    }
  })
  return response.json()
}
```

### 2. Pagination and Infinite Scroll

```typescript
// Infinite scroll with React Query or SWR
export function useInfiniteProducts() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['products'],
    queryFn: ({ pageParam = 1 }) => api.products.getAll({ page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
  })

  return { data, fetchNextPage, hasNextPage, isLoading }
}
```

### 3. Optimistic Updates

```typescript
// Optimistic cart updates
const updateCartOptimistically = async (productId: string, quantity: number) => {
  // Update UI immediately
  setCart(prev => ({
    ...prev,
    items: prev.items.map(item => 
      item.productId === productId 
        ? { ...item, quantity } 
        : item
    )
  }))

  // Make API call in background
  try {
    await api.cart.updateItem(productId, quantity)
  } catch (error) {
    // Revert on error
    await refetch()
  }
}
```

## Error Handling

### 1. API Error Handling

```typescript
// lib/api.ts
class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }
    }
  }
}
```

### 2. Component Error Boundaries

```typescript
// components/ErrorBoundary.tsx
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className="text-center py-12">
        <h2>Something went wrong</h2>
        <button onClick={() => setHasError(false)}>Try again</button>
      </div>
    )
  }

  return children
}
```

### 3. User-Friendly Error Messages

```typescript
// hooks/useProducts.ts
const getErrorMessage = (error: string) => {
  switch (error) {
    case 'NETWORK_ERROR':
      return 'Please check your internet connection and try again'
    case 'UNAUTHORIZED':
      return 'Please sign in to continue'
    case 'NOT_FOUND':
      return 'The requested resource was not found'
    default:
      return 'Something went wrong. Please try again later'
  }
}
```

## Authentication

### 1. Session Management

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    session,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAdmin: session?.user?.isAdmin || false,
    user: session?.user,
  }
}
```

### 2. Protected Routes

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const session = await getServerSession()
    if (!session?.user?.isAdmin) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}
```

### 3. API Authentication

```typescript
// lib/api.ts
class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session
      ...options,
    }

    const response = await fetch(url, config)
    // ... rest of implementation
  }
}
```

## Examples

### 1. Product List with Search and Filters

```typescript
// components/ProductList.tsx
export default function ProductList() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [page, setPage] = useState(1)

  const { products, pagination, loading, error } = useProducts({
    page,
    search,
    categoryId: category !== "all" ? category : undefined,
    limit: 12
  })

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      <SearchInput value={search} onChange={setSearch} />
      <CategoryFilter value={category} onChange={setCategory} />
      <ProductGrid products={products} />
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  )
}
```

### 2. Shopping Cart with Real-time Updates

```typescript
// components/Cart.tsx
export default function Cart() {
  const { cart, loading, error, updateCartItem, removeFromCart } = useCart()

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  if (!cart?.items.length) return <EmptyCart />

  return (
    <div>
      {cart.items.map(item => (
        <CartItem
          key={item.id}
          item={item}
          onUpdateQuantity={(quantity) => updateCartItem(item.productId, quantity)}
          onRemove={() => removeFromCart(item.productId)}
        />
      ))}
      <CartSummary cart={cart} />
    </div>
  )
}
```

### 3. Order Management

```typescript
// components/OrderList.tsx
export default function OrderList() {
  const { orders, pagination, loading, error } = useOrders({
    page: 1,
    limit: 10
  })

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
      <Pagination pagination={pagination} />
    </div>
  )
}
```

## Best Practices

### 1. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 2. Type Safety

```typescript
// types/api.ts
export interface ApiProduct {
  id: string
  name: string
  price: number
  description: string
  images: Array<{
    id: string
    url: string
    isPrimary: boolean
  }>
  category: {
    id: number
    name: string
  }
  stock: number
  status: "draft" | "active" | "archived"
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  pagination?: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}
```

### 3. Loading States

```typescript
// components/LoadingSpinner.tsx
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  )
}
```

### 4. Error States

```typescript
// components/ErrorMessage.tsx
export function ErrorMessage({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="text-6xl mb-4">😔</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
```

### 5. Data Validation

```typescript
// lib/validation.ts
import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().positive("Price must be positive"),
  description: z.string().optional(),
  categoryId: z.number().int().positive("Category is required"),
})

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  }),
})
```

### 6. Testing

```typescript
// __tests__/hooks/useProducts.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useProducts } from '@/hooks/useProducts'

describe('useProducts', () => {
  it('should fetch products successfully', async () => {
    const { result } = renderHook(() => useProducts({ page: 1, limit: 12 }))
    
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.products).toBeDefined()
    expect(result.current.error).toBeNull()
  })
})
```

## Migration Checklist

When replacing static data with API data:

- [ ] Create API service layer (`lib/api.ts`)
- [ ] Define TypeScript interfaces for API responses
- [ ] Create custom hooks for data fetching
- [ ] Implement server actions for mutations
- [ ] Add loading states to all components
- [ ] Add error handling and user feedback
- [ ] Implement authentication checks
- [ ] Add pagination and filtering
- [ ] Optimize with caching strategies
- [ ] Test all functionality
- [ ] Update environment variables
- [ ] Document API endpoints and usage

## Performance Tips

1. **Use Server Components** for static data that doesn't need interactivity
2. **Implement Caching** with Next.js cache and revalidation
3. **Use Server Actions** for mutations to reduce client-side JavaScript
4. **Implement Pagination** to limit data transfer
5. **Add Loading States** for better perceived performance
6. **Use Optimistic Updates** for immediate UI feedback
7. **Implement Error Boundaries** to prevent app crashes
8. **Add Retry Logic** for failed requests
9. **Use Debouncing** for search inputs
10. **Implement Infinite Scroll** for large datasets

This guide provides a comprehensive approach to integrating APIs in your Next.js application while maintaining performance, user experience, and code quality.

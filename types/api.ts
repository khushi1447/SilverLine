export interface ApiProduct {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  category: {
    id: number;
    name: string;
  };
  weight?: number;
  size?: string;
  images: Array<{
    id: string;
    url: string;
    altText?: string;
    isPrimary: boolean;
  }>;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiProductsResponse {
  products: ApiProduct[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
} 
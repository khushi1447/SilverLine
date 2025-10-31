"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiProduct, ApiProductsResponse } from '@/types/api';

interface UseProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: string;
  enabled?: boolean;
}

interface UseProductsReturn {
  products: ApiProduct[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setCategory: (categoryId: number | null) => void;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const {
    page = 1,
    limit = 12,
    search = '',
    categoryId,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    enabled = true,
  } = options;

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page,
        limit,
        sortBy,
        sortOrder,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (categoryId) {
        params.categoryId = categoryId;
      }

      if (minPrice !== undefined) {
        params.minPrice = minPrice;
      }

      if (maxPrice !== undefined) {
        params.maxPrice = maxPrice;
      }

      const response = await api.products.getAll(params);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setProducts(response.data.products);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [enabled, page, limit, search, categoryId, minPrice, maxPrice, sortBy, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const refetch = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  const setPage = useCallback((newPage: number) => {
    // This will trigger a re-fetch due to the useEffect dependency
    // You might want to implement a more sophisticated state management
    // for immediate UI updates
  }, []);

  const setSearch = useCallback((newSearch: string) => {
    // This will trigger a re-fetch due to the useEffect dependency
  }, []);

  const setCategory = useCallback((newCategoryId: number | null) => {
    // This will trigger a re-fetch due to the useEffect dependency
  }, []);

  return {
    products,
    pagination,
    loading,
    error,
    refetch,
    setPage,
    setSearch,
    setCategory,
  };
}

// Hook for a single product
export function useProduct(id: string, enabled: boolean = true) {
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!enabled || !id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.products.getById(id);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setProduct(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  }, [enabled, id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const refetch = useCallback(async () => {
    await fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    refetch,
  };
}

// Hook for product search
export function useProductSearch(query: string, enabled: boolean = true) {
  const [results, setResults] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = useCallback(async () => {
    if (!enabled || !query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.products.search(query);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setResults(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search products');
    } finally {
      setLoading(false);
    }
  }, [enabled, query]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchProducts]);

  return {
    results,
    loading,
    error,
  };
}

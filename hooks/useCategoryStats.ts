"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface CategoryStats {
  [categoryName: string]: number;
}

interface UseCategoryStatsReturn {
  categoryStats: CategoryStats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCategoryStats(): UseCategoryStatsReturn {
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all products to get category counts
      // This is a temporary solution - ideally the API should provide category stats
      const response = await api.products.getAll({ 
        page: 1, 
        limit: 1000, // Get a large number to count all products
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        const stats: CategoryStats = {};
        
        // Count products by category
        response.data.products.forEach((product) => {
          const categoryName = product.category.name;
          stats[categoryName] = (stats[categoryName] || 0) + 1;
        });

        setCategoryStats(stats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch category stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategoryStats();
  }, [fetchCategoryStats]);

  const refetch = useCallback(async () => {
    await fetchCategoryStats();
  }, [fetchCategoryStats]);

  return {
    categoryStats,
    loading,
    error,
    refetch,
  };
}

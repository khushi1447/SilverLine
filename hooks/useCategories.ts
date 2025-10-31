"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  description?: string;
  slug?: string;
  image?: string;
  parentId?: number;
  createdAt: string;
  updatedAt: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.categories.getAll();

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const refetch = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch,
  };
}

// Hook for a single category
export function useCategory(id: string, enabled: boolean = true) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = useCallback(async () => {
    if (!enabled || !id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.categories.getById(id);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setCategory(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch category');
    } finally {
      setLoading(false);
    }
  }, [enabled, id]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  const refetch = useCallback(async () => {
    await fetchCategory();
  }, [fetchCategory]);

  return {
    category,
    loading,
    error,
    refetch,
  };
}

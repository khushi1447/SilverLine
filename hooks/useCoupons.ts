"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface Coupon {
  id: number;
  code: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
  applicableProducts?: string;
  applicableCategories?: string;
  createdAt: string;
  updatedAt: string;
}

interface UseCouponsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  isActive?: boolean;
  enabled?: boolean;
}

export function useCoupons(options: UseCouponsOptions = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    status,
    isActive,
    enabled = true,
  } = options;

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page,
        limit,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (status) {
        params.status = status;
      }

      if (isActive !== undefined) {
        params.isActive = isActive;
      }

      const response = await api.coupons.getAll(params);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        if (Array.isArray(response.data)) {
          setCoupons(response.data);
          setPagination(response.pagination || null);
        } else {
          setCoupons(response.data.coupons || response.data);
          setPagination(response.data.pagination || response.pagination || null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  }, [enabled, page, limit, search, status, isActive]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const createCoupon = useCallback(async (couponData: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.coupons.create(couponData);

      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh coupons after creating new coupon
      await fetchCoupons();

      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create coupon');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCoupons]);

  const updateCoupon = useCallback(async (id: string, couponData: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.coupons.update(id, couponData);

      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh coupons after updating
      await fetchCoupons();

      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update coupon');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCoupons]);

  const deleteCoupon = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.coupons.delete(id);

      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh coupons after deleting
      await fetchCoupons();

      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete coupon');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCoupons]);

  const refetch = useCallback(async () => {
    await fetchCoupons();
  }, [fetchCoupons]);

  return {
    coupons,
    pagination,
    loading,
    error,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    refetch,
  };
}

// Hook for a single coupon
export function useCoupon(id: string, enabled: boolean = true) {
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupon = useCallback(async () => {
    if (!enabled || !id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.coupons.getById(id);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setCoupon(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch coupon');
    } finally {
      setLoading(false);
    }
  }, [enabled, id]);

  useEffect(() => {
    fetchCoupon();
  }, [fetchCoupon]);

  const refetch = useCallback(async () => {
    await fetchCoupon();
  }, [fetchCoupon]);

  return {
    coupon,
    loading,
    error,
    refetch,
  };
}

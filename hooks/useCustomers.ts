"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  status?: 'active' | 'inactive' | 'vip';
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
  };
  orders?: Array<{
    total: number;
  }>;
  stats?: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
  };
}

interface UseCustomersOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  enabled?: boolean;
}

interface UseCustomersReturn {
  customers: Customer[];
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
}

export function useCustomers(options: UseCustomersOptions = {}): UseCustomersReturn {
  const {
    page = 1,
    limit = 50,
    search = '',
    status,
    enabled = true,
  } = options;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
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

      const response = await api.users.getAll(params);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        // Transform users to customers format
        const customersData = Array.isArray(response.data) ? response.data : response.data.users || [];
        
        const transformedCustomers = customersData.map((user: any) => ({
          ...user,
          status: user.status || 'active',
          totalOrders: user._count?.orders || 0,
          totalSpent: user.orders?.reduce((sum: number, order: any) => sum + (order.total || 0), 0) || 0,
        }));
        
        setCustomers(transformedCustomers);
        setPagination(response.data.pagination || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, [enabled, page, limit, search, status]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const refetch = useCallback(async () => {
    await fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    pagination,
    loading,
    error,
    refetch,
  };
}

// Hook for a single customer
export function useCustomer(id: string, enabled: boolean = true) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    if (!enabled || !id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.users.getById(id);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setCustomer(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer');
    } finally {
      setLoading(false);
    }
  }, [enabled, id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const refetch = useCallback(async () => {
    await fetchCustomer();
  }, [fetchCustomer]);

  return {
    customer,
    loading,
    error,
    refetch,
  };
}
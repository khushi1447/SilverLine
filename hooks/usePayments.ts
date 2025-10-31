"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface Payment {
  id: number;
  orderId: number;
  orderNumber: string;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  amount: number;
  currency: string;
  method: string;
  status: string;
  transactionId?: string;
  gateway?: string;
  failureReason?: string;
  createdAt: string;
  paidAt?: string;
  refundable: boolean;
}

interface UsePaymentsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  method?: string;
  enabled?: boolean;
}

interface UsePaymentsReturn {
  payments: Payment[];
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

export function usePayments(options: UsePaymentsOptions = {}): UsePaymentsReturn {
  const {
    page = 1,
    limit = 20,
    search = '',
    status,
    method,
    enabled = true,
  } = options;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
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

      if (status && status !== "all") {
        params.status = status;
      }

      if (method && method !== "all") {
        params.method = method;
      }

      const response = await api.payments.getAll(params);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setPayments(response.data.payments || []);
        setPagination(response.data.pagination || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, [enabled, page, limit, search, status, method]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const refetch = useCallback(async () => {
    await fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    pagination,
    loading,
    error,
    refetch,
  };
}

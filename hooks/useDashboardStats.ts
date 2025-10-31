"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface DashboardStats {
  overview: {
    totalRevenue: {
      value: string;
      change: number;
      current: number;
      previous: number;
    };
    totalOrders: {
      value: number;
      change: number;
      current: number;
      previous: number;
    };
    totalProducts: {
      value: number;
      change: number;
    };
    totalCustomers: {
      value: number;
      change: number;
    };
  };
  status: {
    pendingOrders: number;
    completedOrders: number;
    lowStockProducts: number;
  };
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    customer: {
      id: number;
      name: string;
      email: string;
    };
    totalAmount: number;
    status: string;
    itemCount: number;
    createdAt: string;
  }>;
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.admin.getStats();

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch,
  };
}

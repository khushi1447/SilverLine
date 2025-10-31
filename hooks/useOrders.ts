"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productImage: string | null;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  items: OrderItem[];
  pricing: {
    subtotal: number;
    taxAmount: number;
    shippingCost: number;
    discountAmount: number;
    totalAmount: number;
  };
  payment: {
    method: string;
    status: 'pending' | 'paid' | 'failed';
    amount: number;
    transactionId: string;
  } | null;
  shipping: {
    method: string;
    trackingNumber: string;
    carrier: string;
    status: string;
    estimatedDelivery: string;
  } | null;
  coupon: {
    code: string;
    name: string;
    discountValue: number;
  } | null;
  customerNotes: string;
  createdAt: string;
  updatedAt: string;
}

interface UseOrdersOptions {
  page?: number;
  limit?: number;
  status?: string;
  enabled?: boolean;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const {
    page = 1,
    limit = 10,
    status,
    enabled = true,
  } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page,
        limit,
      };

      if (status) {
        params.status = status;
      }

      const response = await api.orders.getAll(params);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        if (Array.isArray(response.data)) {
          setOrders(response.data);
          setPagination(response.pagination || null);
        } else {
          setOrders(response.data.orders || response.data);
          setPagination(response.data.pagination || response.pagination || null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [enabled, page, limit, status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = useCallback(async (orderData: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.orders.create(orderData);

      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh orders after creating new order
      await fetchOrders();

      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOrders]);

  const refetch = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    pagination,
    loading,
    error,
    createOrder,
    refetch,
  };
}

// Hook for a single order
export function useOrder(id: string, enabled: boolean = true) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!enabled || !id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.orders.getById(id);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setOrder(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  }, [enabled, id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const refetch = useCallback(async () => {
    await fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    loading,
    error,
    refetch,
  };
}

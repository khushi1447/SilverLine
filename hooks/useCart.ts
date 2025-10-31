"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';

interface CartItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: Array<{
      id: string;
      url: string;
      altText?: string;
      isPrimary: boolean;
    }>;
  };
  quantity: number;
  price: number;
}

interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  subtotal: number;
  tax: number;
  shipping: number;
}

export function useCart() {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.cart.get();

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setCart(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.cart.addItem(productId, quantity);

      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh cart after adding item
      await fetchCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const updateCartItem = useCallback(async (productId: string, quantity: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.cart.updateItem(productId, quantity);

      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh cart after updating item
      await fetchCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cart item');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.cart.removeItem(productId);

      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh cart after removing item
      await fetchCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const mergeCart = useCallback(async (guestCart: any[]) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.cart.merge(guestCart);

      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh cart after merging
      await fetchCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to merge cart');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    mergeCart,
    refetch: fetchCart,
    clearError,
  };
} 
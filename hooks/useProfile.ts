"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  stats: {
    orders: number;
    reviews: number;
    wishlistItems: number;
  };
  adminStats?: {
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    totalRevenue: number;
  };
}

interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.user.getProfile();

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setProfile(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.user.updateProfile(data);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        // Update local profile state
        setProfile(prev => prev ? { ...prev, ...response.data.user } : null);
        return { success: true };
      }

      return { success: false, error: 'No data returned' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refetch = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch,
    updateProfile,
  };
}

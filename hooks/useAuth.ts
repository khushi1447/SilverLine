"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const isAdmin = session?.user?.isAdmin || false;

  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const refreshSession = async () => {
    await update();
  };

  return {
    session,
    isLoading,
    isAuthenticated,
    isAdmin,
    user: session?.user,
    logout,
    refreshSession,
  };
} 
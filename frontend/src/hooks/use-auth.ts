"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const response = await apiClient.get<{ user: User }>("/auth/me");
      if (response.data?.user) {
        setState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout", {});
    } catch {
      // Ignore logout errors, still clear state
    } finally {
      setState({ user: null, isAuthenticated: false, isLoading: false });
      router.push("/login");
    }
  }, [router]);

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    logout,
    isLoading: state.isLoading,
  };
}
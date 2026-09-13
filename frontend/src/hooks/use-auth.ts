'use client';

import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { useApiMutation } from './use-api';
import type { User } from '@/types/user';

export function useAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<User | null>({
    queryKey: ['authUser'],
    queryFn: authService.getMe,
    retry: false,
  });

  const user = data || null;
  const isAuthenticated = !!user && !error;

  const loginMutation = useMutation<User, Error, { email: string; password: string }>({
    mutationFn: (creds) => authService.login(creds),
    onSuccess: (data) => {
      queryClient.setQueryData(['authUser'], data.user);
      toast.success('Connexion réussie');
    },
  });

  const registerMutation = useMutation<User, Error, { email: string; password: string; firstName: string; lastName: string }>({
    mutationFn: (data) => authService.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['authUser'], data.user);
      toast.success('Inscription réussie');
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['authUser'] });
      toast.success('Déconnexion réussie');
    },
  });

  const login = useCallback(
    (email: string, password: string) => loginMutation.mutate({ email, password }),
    [loginMutation],
  );

  const register = useCallback(
    (data: { email: string; password: string; firstName: string; lastName: string }) =>
      registerMutation.mutate(data),
    [registerMutation],
  );

  const logout = useCallback(() => logoutMutation.mutate(), [logoutMutation]);

  const refreshToken = useCallback(
    async (token: string) => {
      const result = await authService.refreshToken(token);
      authService.setTokens(result.accessToken, result.refreshToken);
      return result;
    },
    [],
  );

  const getToken = useCallback(() => authService.getToken(), []);

  useEffect(() => {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) return;

    const interval = setInterval(() => {
      refreshToken(refreshTokenValue).catch(() => {
        toast.error('Session expirée');
      });
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshToken]);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
    getToken,
  };
}

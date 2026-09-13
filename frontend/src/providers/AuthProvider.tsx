'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { queryClient } from '@/store';
import { QueryClientProvider } from '@tanstack/react-query';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; email: string; name: string; role: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('access_token')
  );
  const [user, setUser] = useState<AuthContextType['user']>(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = async (email: string, _password: string) => {
    // Simulated login
    setIsAuthenticated(true);
    setUser({ id: '1', email, name: 'Utilisateur', role: 'admin' });
    localStorage.setItem('access_token', 'mock_token');
    localStorage.setItem('user', JSON.stringify({ id: '1', email, name: 'Utilisateur', role: 'admin' }));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}

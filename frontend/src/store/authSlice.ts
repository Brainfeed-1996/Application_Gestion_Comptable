import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '@/types/user';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  permissions: string[];
  isAuthenticated: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setTokens: (access: string, refresh: string) => void;
  clearAuth: () => void;
  setPermissions: (permissions: string[]) => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        permissions: [],
        isAuthenticated: false,

        setUser: (user) => set({ user, isAuthenticated: !!user }, false, 'auth/setUser'),

        setTokens: (access, refresh) =>
          set({ accessToken: access, refreshToken: refresh }, false, 'auth/setTokens'),

        clearAuth: () =>
          set(
            {
              user: null,
              accessToken: null,
              refreshToken: null,
              permissions: [],
              isAuthenticated: false,
            },
            false,
            'auth/clearAuth',
          ),

        setPermissions: (permissions) => set({ permissions }, false, 'auth/setPermissions'),

        updateUser: (data) => {
          const currentUser = get().user;
          if (currentUser) {
            set({ user: { ...currentUser, ...data } }, false, 'auth/updateUser');
          }
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          permissions: state.permissions,
        }),
      },
    ),
  ),
);

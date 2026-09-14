import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useAuthStore, type AuthState, type AuthActions } from './authSlice';
import { useUIStore, type UIState, type UIActions } from './uiSlice';
import type { User } from '@/types/user';
import type { Notification } from './uiSlice';

export type RootState = AuthState & AuthActions & UIState & UIActions;

export const useStore = create<RootState>()(
  devtools((set, get) => ({
    ...useAuthStore.getState(),
    ...useUIStore.getState(),
    setUser: (user: User | null) => {
      useAuthStore.getState().setUser(user);
    },
    setTokens: (access: string, refresh: string) => {
      useAuthStore.getState().setTokens(access, refresh);
    },
    clearAuth: () => {
      useAuthStore.getState().clearAuth();
    },
    setPermissions: (permissions: string[]) => {
      useAuthStore.getState().setPermissions(permissions);
    },
    updateUser: (data: Partial<User>) => {
      useAuthStore.getState().updateUser(data);
    },
    toggleSidebar: () => {
      useUIStore.getState().toggleSidebar();
    },
    setDarkMode: (enabled: boolean) => {
      useUIStore.getState().setDarkMode(enabled);
    },
    addNotification: (notification) => {
      return useUIStore.getState().addNotification(notification);
    },
    removeNotification: (id: string) => {
      useUIStore.getState().removeNotification(id);
    },
    setMobileMenu: (open: boolean) => {
      useUIStore.getState().setMobileMenu(open);
    },
  }), false, 'root-store');
);

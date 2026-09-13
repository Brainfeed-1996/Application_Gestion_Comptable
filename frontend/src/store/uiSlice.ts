import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  createdAt: number;
}

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  notifications: Notification[];
  mobileMenuOpen: boolean;
}

interface UIActions {
  toggleSidebar: () => void;
  setDarkMode: (enabled: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  setMobileMenu: (open: boolean) => void;
}

export const useUIStore = create<UIState & UIActions>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        darkMode: false,
        notifications: [],
        mobileMenuOpen: false,

        toggleSidebar: () =>
          set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'ui/toggleSidebar'),

        setDarkMode: (enabled) =>
          set({ darkMode: enabled }, false, 'ui/setDarkMode'),

        addNotification: (notification) => {
          const id = Math.random().toString(36).substring(2, 9);
          const newNotification: Notification = { ...notification, id, createdAt: Date.now() };
          set((state) => ({ notifications: [...state.notifications, newNotification] }), false, 'ui/addNotification');
          return id;
        },

        removeNotification: (id) =>
          set(
            (state) => ({
              notifications: state.notifications.filter((n) => n.id !== id),
            }),
            false,
            'ui/removeNotification',
          ),

        setMobileMenu: (open) => set({ mobileMenuOpen: open }, false, 'ui/setMobileMenu'),
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({
          darkMode: state.darkMode,
        }),
      },
    ),
  ),
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface UserState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      setUser: (user) => set({ user }),

      setToken: (token) => set({ token }),

      login: (user, token) =>
        set({
          user,
          token,
          isLoggedIn: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isLoggedIn: false,
        }),

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    {
      name: 'user-storage',
    }
  )
);

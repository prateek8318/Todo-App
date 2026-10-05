import { create } from 'zustand';

interface AuthState {
  user: any | null;
  initializing: boolean;
  setUser: (user: any | null) => void;
  setInitializing: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initializing: true,
  setUser: (user) => set({ user }),
  setInitializing: (initializing) => set({ initializing }),
}));

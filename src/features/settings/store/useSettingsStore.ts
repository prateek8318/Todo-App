import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '@core/storage';

interface SettingsState {
  notificationsEnabled: boolean;
  toggleNotifications: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      toggleNotifications: (enabled: boolean) => set({ notificationsEnabled: enabled }),
    }),
    {
      name: 'settings-storage',
      storage: zustandStorage,
    }
  )
);

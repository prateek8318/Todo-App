import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '@core/storage';
import { WallpaperId } from '@core/theme/wallpapers';

interface SettingsState {
  notificationsEnabled: boolean;
  wallpaper: WallpaperId;
  setWallpaper: (wallpaper: WallpaperId) => void;
  toggleNotifications: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      wallpaper: 'none',
      setWallpaper: (wallpaper) => set({ wallpaper }),
      toggleNotifications: (enabled: boolean) => set({ notificationsEnabled: enabled }),
    }),
    {
      name: 'settings-storage',
      storage: zustandStorage,
    }
  )
);

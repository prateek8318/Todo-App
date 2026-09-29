import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '@core/storage';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  _hasHydrated: boolean;
  completeOnboarding: () => void;
  setHydrated: (state: boolean) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      _hasHydrated: false,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setHydrated: (state: boolean) => set({ _hasHydrated: state }),
    }),
    {
      name: 'onboarding-storage',
      storage: zustandStorage,
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          // migration logic if any
        }
        return persistedState as OnboardingState;
      },
      onRehydrateStorage: () => (state?: OnboardingState) => {
        state?.setHydrated(true);
      },
    }
  )
);

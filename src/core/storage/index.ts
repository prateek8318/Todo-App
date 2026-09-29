import { createMMKV } from 'react-native-mmkv';
import { StateStorage, createJSONStorage } from 'zustand/middleware';

export const storage = createMMKV({
  id: 'tickd-storage',
});

const mmkvAdapter: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return storage.remove(name);
  },
};

export const zustandStorage = createJSONStorage(() => mmkvAdapter);

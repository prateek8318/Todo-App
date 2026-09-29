import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, Theme } from './tokens';
import { storage } from '../storage';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
}

const THEME_PREF_KEY = 'tickd-theme-preference';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    const savedPref = storage.getString(THEME_PREF_KEY) as ThemePreference;
    if (savedPref) setPreferenceState(savedPref);
  }, []);

  useEffect(() => {
    if (preference === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(preference === 'dark');
    }
  }, [preference, systemColorScheme]);

  const setPreference = (pref: ThemePreference) => {
    setPreferenceState(pref);
    storage.set(THEME_PREF_KEY, pref);
  };
  
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

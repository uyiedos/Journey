'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ColorTheme = 'blue' | 'green' | 'purple';
export type ThemePreference = Theme | ColorTheme; // Support for legacy themes

const THEME_KEY = 'theme';
const DARK_MQ = '(prefers-color-scheme: dark)';

export type ThemeContextType = {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  themePreference: ThemePreference;
  colorTheme: ColorTheme;
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemePreference] = useState<ThemePreference>('dark');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('blue');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [isMounted, setIsMounted] = useState(false);

  // Set resolved theme based on preference and system settings
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as ThemePreference | null;
    const initialTheme = savedTheme || 'dark';
    setThemePreference(initialTheme);
    
    // Only set resolved theme if we're not in SSR
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      
      if (initialTheme === 'system') {
        const isDark = window.matchMedia(DARK_MQ).matches;
        setResolvedTheme(isDark ? 'dark' : 'light');
        root.classList.add(isDark ? 'dark' : 'light');
      } else if (initialTheme === 'light' || initialTheme === 'dark') {
        setResolvedTheme(initialTheme);
        root.classList.add(initialTheme);
      } else {
        // Handle legacy themes
        setResolvedTheme('dark');
        root.classList.add('dark');
        root.classList.add(`theme-${initialTheme}`);
      }
      
      setIsMounted(true);
    }
  }, []);

  // Handle system theme changes
  useEffect(() => {
    if (themePreference !== 'system') return;
    
    const mediaQuery = window.matchMedia(DARK_MQ);
    const handleChange = () => {
      setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', mediaQuery.matches);
      document.documentElement.classList.toggle('light', !mediaQuery.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themePreference]);

  const setTheme = (newTheme: ThemePreference) => {
    const root = document.documentElement;
    
    // Clean up old theme classes
    root.classList.remove('light', 'dark');
    ['blue', 'green', 'purple'].forEach(theme => 
      root.classList.remove(`theme-${theme}`)
    );
    
    // Set new theme
    if (newTheme === 'system') {
      const isDark = window.matchMedia(DARK_MQ).matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
      root.classList.add(isDark ? 'dark' : 'light');
    } else if (newTheme === 'light' || newTheme === 'dark') {
      setResolvedTheme(newTheme);
      root.classList.add(newTheme);
    } else {
      // Handle legacy themes
      setResolvedTheme('dark');
      root.classList.add('dark');
      root.classList.add(`theme-${newTheme}`);
    }
    
    setThemePreference(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  // Prevent hydration mismatch by only rendering after mount
  if (!isMounted) {
    return null;
  }

  return (
    <ThemeContext.Provider 
      value={{
        theme: themePreference === 'light' || themePreference === 'dark' || themePreference === 'system' 
          ? themePreference 
          : 'dark',
        resolvedTheme,
        themePreference,
        colorTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

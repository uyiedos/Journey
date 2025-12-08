'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  // Load theme from localStorage or use default dark theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    // Always use dark theme as default, even if system prefers light
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      setThemeState('dark'); // Default to dark theme
    }
  }, []);

  // Update the theme in localStorage and on the document
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Apply theme class to document
  useEffect(() => {
    // Remove all theme classes
    document.documentElement.classList.remove('light', 'dark', 'theme-blue', 'theme-green', 'theme-purple');
    
    // Add the current theme class
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.classList.add(theme);
    } else {
      document.documentElement.classList.add('light'); // Base theme
      document.documentElement.classList.add(`theme-${theme}`); // Custom theme
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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

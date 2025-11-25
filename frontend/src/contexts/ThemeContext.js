import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

const getStoredTheme = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedTheme = window.localStorage.getItem('theme');
  return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null;
};

const getInitialTheme = () => {
  const storedTheme = getStoredTheme();
  if (storedTheme) return storedTheme;

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);
  const [hasManualPreference, setHasManualPreference] = useState(() => Boolean(getStoredTheme()));

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    document.documentElement.setAttribute('data-theme', theme);
    if (hasManualPreference) {
      window.localStorage.setItem('theme', theme);
    } else {
      window.localStorage.removeItem('theme');
    }
  }, [theme, hasManualPreference]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event) => {
      if (!hasManualPreference) {
        setTheme(event.matches ? 'dark' : 'light');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, [hasManualPreference]);

  const value = useMemo(() => ({
    theme,
    toggleTheme: () => {
      setHasManualPreference(true);
      setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    },
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);


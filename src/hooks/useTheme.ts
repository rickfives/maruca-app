import { useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light';

export function useTheme(): [ThemeMode, () => void, (mode: ThemeMode) => void] {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('nutriradar_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return 'dark'; // Modo oscuro por defecto
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('nutriradar_theme', theme);
    } catch (e) {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return [theme, toggleTheme, setTheme];
}

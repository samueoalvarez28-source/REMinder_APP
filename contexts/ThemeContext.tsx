import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    primary: string;
    primaryLight: string;
    border: string;
    error: string;
    success: string;
    inactive: string;
    tabBar: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const lightColors = {
  background: '#f9fafb',
  card: '#ffffff',
  text: '#111827',
  textSecondary: '#6b7280',
  primary: '#6366f1',
  primaryLight: '#eef2ff',
  border: '#e5e7eb',
  error: '#ef4444',
  success: '#10b981',
  inactive: '#9ca3af',
  tabBar: '#ffffff',
};

export const darkColors = {
  background: '#0f172a',
  card: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  primary: '#818cf8',
  primaryLight: '#1e1b4b',
  border: '#334155',
  error: '#f87171',
  success: '#34d399',
  inactive: '#64748b',
  tabBar: '#1e293b',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_preferences')
          .select('theme')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data?.theme) {
          setTheme(data.theme as Theme);
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existing } = await supabase
          .from('user_preferences')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('user_preferences')
            .update({ theme: newTheme, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('user_preferences')
            .insert({ user_id: user.id, theme: newTheme });
        }
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
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

// File: ThemeToggle.tsx
// Path: /src/components/common/ThemeToggle.tsx
// Theme toggle button component

'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'icon' | 'button';
}

export default function ThemeToggle({ variant = 'icon' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          theme === 'dark'
            ? 'bg-[#2a2a2a] text-[#f5f5f5] hover:bg-[#3a3a3a]'
            : 'bg-[#f5f5f5] text-[#1a1a1a] hover:bg-[#e5e5e5]'
        }`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <>
            <Moon className="w-5 h-5" />
            <span>Dark Mode</span>
          </>
        ) : (
          <>
            <Sun className="w-5 h-5" />
            <span>Light Mode</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      style={{
        color: theme === 'dark' ? '#b3b3b3' : '#666666'
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
}
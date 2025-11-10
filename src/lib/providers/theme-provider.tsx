// File: theme-provider.tsx
// Path: /src/lib/providers/theme-provider.tsx
// Theme provider component - wraps the app with theme context

'use client'

import { ThemeProvider as ThemeContextProvider } from '@/lib/contexts/ThemeContext'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContextProvider>{children}</ThemeContextProvider>
}
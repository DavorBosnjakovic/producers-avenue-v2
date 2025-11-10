// File: ClientLayout.tsx
// Path: /src/components/ClientLayout.tsx

'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </ThemeProvider>
  );
}
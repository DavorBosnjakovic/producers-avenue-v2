// File: layout.tsx
// Path: /src/app/layout.tsx
// Root layout component - wraps all pages

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Producers Avenue - Where Music Creators Connect, Collaborate & Thrive',
  description: 'The ultimate platform for producers, musicians, and music professionals to connect, collaborate, and grow their careers.',
  keywords: 'music production, producers, musicians, collaboration, marketplace, beats, services',
  authors: [{ name: 'Producers Avenue' }],
  openGraph: {
    title: 'Producers Avenue',
    description: 'Where Music Creators Connect, Collaborate & Thrive',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Producers Avenue',
    description: 'Where Music Creators Connect, Collaborate & Thrive',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#009ae9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
}
// File: AboutSection.tsx
// Path: /src/components/home/AboutSection.tsx
// About section with platform value proposition

'use client'

import { useTheme } from '@/lib/contexts/ThemeContext'
import Link from 'next/link'

export default function AboutSection() {
  const { theme } = useTheme()

  const features = [
    {
      title: 'Connect',
      points: [
        'Network with music creators worldwide',
        'Join specialized groups by genre or skill',
        'Follow and discover new collaborators',
        'Real-time social feed and updates',
      ],
    },
    {
      title: 'Collaborate',
      points: [
        'Smart Collab Matcher finds your perfect partner',
        'Built-in messaging and project tools',
        'Share work-in-progress securely',
        'Build lasting creative relationships',
      ],
    },
    {
      title: 'Monetize',
      points: [
        'Sell beats, samples, and digital products',
        'Offer services (mixing, mastering, production)',
        'Host webinars and mentoring sessions',
        'Fair pricing: 10-40% commission based on your plan',
      ],
    },
  ]

  return (
    <section 
      className="relative py-20 md:py-32"
      style={{ zIndex: 2 }}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-12 md:mb-16">
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl mb-6"
            style={{
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
            }}
          >
            Built By Music Creators,
            <br />
            For Music Creators
          </h2>
          <p 
            className="text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto leading-relaxed"
            style={{
              fontFamily: 'var(--font-body)',
              color: theme === 'dark' ? '#b3b3b3' : '#666666'
            }}
          >
            Stop juggling multiple platforms. Producers Avenue is the all-in-one ecosystem where music professionals connect, collaborate, and monetize their craft. Whether you're a producer, musician, vocalist, or industry pro—everything you need is here.
          </p>
        </div>

        {/* Three Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-12">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="p-8 rounded-xl border transition-all duration-300 hover:shadow-lg backdrop-blur-md"
              style={{
                backgroundColor: theme === 'dark' 
                  ? 'rgba(26, 26, 26, 0.6)' 
                  : 'rgba(255, 255, 255, 0.6)',
                borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#009ae9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e0e0e0'
              }}
            >
              {/* Title */}
              <h3 
                className="text-2xl md:text-3xl mb-6"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
                }}
              >
                {feature.title}
              </h3>

              {/* Points */}
              <ul className="space-y-3">
                {feature.points.map((point, i) => (
                  <li 
                    key={i}
                    className="flex items-start gap-3"
                  >
                    {/* Checkmark icon */}
                    <svg 
                      className="w-5 h-5 mt-0.5 flex-shrink-0" 
                      style={{ color: '#009ae9' }}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2.5} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                    <span 
                      className="text-base"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#b3b3b3' : '#666666'
                      }}
                    >
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link 
            href="/register" 
            className="btn btn-cta inline-flex items-center gap-2 text-xl px-10 py-5"
          >
            Join the Community
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 7l5 5m0 0l-5 5m5-5H6" 
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
// File: FeatureCards.tsx
// Path: /src/components/home/FeatureCards.tsx
// Three feature cards with scroll animations

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/lib/contexts/ThemeContext'

interface FeatureCard {
  title: string
  description: string
  image: string
  link: string
  slideFrom: 'left' | 'bottom' | 'right'
}

const features: FeatureCard[] = [
  {
    title: 'Community',
    description: 'Connect with fellow creators, share your work, and collaborate on projects. Build your network and grow together.',
    image: '/images/community-card.jpg',
    link: '/community',
    slideFrom: 'left',
  },
  {
    title: 'Marketplace',
    description: 'Buy and sell beats, samples, services, and more. Turn your skills into income and find exactly what you need.',
    image: '/images/marketplace-card.jpg',
    link: '/marketplace',
    slideFrom: 'bottom',
  },
  {
    title: 'Tools',
    description: 'Access powerful tools for collaboration, project management, and workflow optimization. Everything you need in one place.',
    image: '/images/tools-card.jpg',
    link: '/tools',
    slideFrom: 'right',
  },
]

export default function FeatureCards() {
  const { theme } = useTheme()
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 md:py-32"
      style={{ zIndex: 2 }}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl mb-4"
            style={{
              fontFamily: 'var(--font-heading)',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
            }}
          >
            What We Offer
          </h2>
          <p 
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{
              fontFamily: 'var(--font-body)',
              color: theme === 'dark' ? '#b3b3b3' : '#666666'
            }}
          >
            Everything you need to succeed in the music industry
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            // Calculate transform based on slide direction
            let initialTransform = 'translateY(30px)'
            if (isVisible) {
              initialTransform = 'translate(0, 0)'
            } else {
              if (feature.slideFrom === 'left') {
                initialTransform = 'translateX(-100px)'
              } else if (feature.slideFrom === 'right') {
                initialTransform = 'translateX(100px)'
              } else if (feature.slideFrom === 'bottom') {
                initialTransform = 'translateY(100px)'
              }
            }

            return (
              <Link
                key={feature.title}
                href={feature.link}
                className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                style={{
                  height: '300px',
                  transform: initialTransform,
                  transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-110"
                    style={{
                      opacity: isVisible ? 0.5 : 1,
                      transition: 'opacity 0.8s ease-in-out, transform 0.7s ease'
                    }}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={index === 0}
                  />
                  
                  {/* Dark Overlay */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                  />
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
                  {/* Title */}
                  <h3 
                    className="text-2xl md:text-3xl mb-3 text-white"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      opacity: isVisible ? 1 : 0,
                      transition: 'opacity 0.8s ease-in-out 0.3s'
                    }}
                  >
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p 
                    className="text-base text-gray-200 mb-4 opacity-90"
                    style={{
                      fontFamily: 'var(--font-body)',
                      opacity: isVisible ? 0.9 : 0,
                      transition: 'opacity 0.8s ease-in-out 0.5s'
                    }}
                  >
                    {feature.description}
                  </p>

                  {/* Link Arrow */}
                  <div 
                    className="flex items-center gap-2 text-white group-hover:gap-3 transition-all"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transition: 'opacity 0.8s ease-in-out 0.7s, gap 0.3s ease'
                    }}
                  >
                    <span 
                      className="font-semibold"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      Explore
                    </span>
                    <svg 
                      className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17 8l4 4m0 0l-4 4m4-4H3" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Hover border effect */}
                <div 
                  className="absolute inset-0 border-2 border-transparent group-hover:border-[#009ae9] rounded-xl transition-colors duration-300"
                  style={{ pointerEvents: 'none' }}
                />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
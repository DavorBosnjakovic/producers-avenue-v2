// File: Hero.tsx
// Path: /src/components/home/Hero.tsx
// Hero section with video that fades linearly to 20% opacity

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTheme } from '@/lib/contexts/ThemeContext'

// Typewriter component
function TypewriterText({ text, startDelay }: { text: string; startDelay: number }) {
  const [displayedText, setDisplayedText] = useState('')
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setHasStarted(true)
    }, startDelay)

    return () => clearTimeout(startTimer)
  }, [startDelay])

  useEffect(() => {
    if (!hasStarted) return
    
    if (displayedText.length < text.length) {
      const typingTimer = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1))
      }, 24)
      
      return () => clearTimeout(typingTimer)
    }
  }, [hasStarted, displayedText, text])

  return <span>{displayedText}</span>
}

export default function Hero() {
  const { theme } = useTheme()
  const [randomVideo, setRandomVideo] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [videoOpacity, setVideoOpacity] = useState(1)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  
  const rotatingWords = ['Connect', 'Collaborate', 'Create', 'Thrive', 'Grow', 'Succeed', 'Build', 'Excel', 'Shine']

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const TOTAL_VIDEOS = 5
    const videoNumber = Math.floor(Math.random() * TOTAL_VIDEOS) + 1
    const videoPath = `/videos/hero-${videoNumber}${isMobile ? '-mobile' : ''}.mp4`
    setRandomVideo(videoPath)
  }, [isMobile])

  // Rotate words every 1.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length)
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  // Update opacity as video plays - linear fade from 1 to 0.2
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const video = videoRef.current
      const progress = video.currentTime / video.duration
      // Linear interpolation from 1.0 to 0.2
      const opacity = 1 - (progress * 0.8) // 1.0 -> 0.2
      setVideoOpacity(opacity)
    }
  }

  const handleVideoEnd = () => {
    console.log('Video ended - staying at 20% opacity')
    setVideoOpacity(0.2)
  }

  return (
    <>
      {/* Fixed Video Background - stays in place when scrolling */}
      {randomVideo && (
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnd}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: videoOpacity
            }}
          >
            <source src={randomVideo} type="video/mp4" />
          </video>

          {/* Dark overlay - also fades out linearly */}
          <div 
            className="absolute inset-0 bg-black"
            style={{
              opacity: videoOpacity > 0.2 ? 0.4 * ((videoOpacity - 0.2) / 0.8) : 0
            }}
          />
        </div>
      )}

      {/* Hero Section - NO BACKGROUND, transparent */}
      <section 
        className="relative h-screen flex items-start justify-center pt-32 md:pt-40"
        style={{ zIndex: 1 }}
      >
        {/* Content */}
        <div className="relative z-10 w-full mx-auto" style={{ maxWidth: '1280px', paddingLeft: '0', paddingRight: '0' }}>
          
          {/* Heading - fixed left side with animated rotating word */}
          <h1 
            className={isMobile ? "text-6xl mb-8 opacity-0 px-4" : "opacity-0"}
            style={{
              fontFamily: 'var(--font-heading)',
              animation: 'fadeIn 3s ease-in 1s forwards',
              color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              display: 'flex',
              justifyContent: 'flex-start',
              flexDirection: 'column',
              alignItems: isMobile ? 'flex-start' : 'center',
              letterSpacing: '-0.01em',
              marginBottom: isMobile ? '2rem' : '3rem',
              width: '100%',
              paddingLeft: isMobile ? '0' : '0',
              paddingRight: isMobile ? '0' : '0',
            }}
          >
            {isMobile ? (
              <>
                <span style={{ display: 'block', marginBottom: '0.75rem' }}>
                  Where Music Creators
                </span>
                <span 
                  key={currentWordIndex}
                  className="inline-block"
                  style={{ 
                    color: '#009ae9',
                    animation: 'flipWord 1.2s ease-in-out',
                    transformStyle: 'preserve-3d',
                    textAlign: 'center',
                    width: '100%',
                  }}
                >
                  {rotatingWords[currentWordIndex]}
                </span>
              </>
            ) : (
              <>
                <span style={{ 
                  fontSize: '5rem',
                  lineHeight: '1.1',
                  marginBottom: '1.5rem',
                  whiteSpace: 'nowrap',
                  alignSelf: 'flex-start'
                }}>
                  Where Music Creators
                </span>
                <span 
                  key={currentWordIndex}
                  className="inline-block"
                  style={{ 
                    color: '#009ae9',
                    fontSize: '6rem',
                    textAlign: 'center',
                    animation: 'flipWord 1.2s ease-in-out',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {rotatingWords[currentWordIndex]}
                </span>
              </>
            )}
          </h1>

          {/* Paragraph - always in theme color, aligned right */}
          <p 
            className={isMobile ? "text-lg md:text-xl lg:text-2xl mb-20 mt-16 px-4" : "text-lg md:text-xl lg:text-2xl mb-20 mt-16"}
            style={{
              fontFamily: 'var(--font-body)',
              minHeight: '3rem',
              color: theme === 'dark' ? '#b3b3b3' : '#666666',
              width: '100%',
              marginLeft: '0',
              marginRight: '0',
              textAlign: isMobile ? 'center' : 'right',
              paddingLeft: '0',
              paddingRight: '0',
            }}
          >
            <TypewriterText 
              text="Join the ultimate platform for producers, musicians, and music professionals"
              startDelay={2000}
            />
          </p>

          {/* CTA Buttons - centered */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 px-4 sm:px-0"
            style={{
              animation: 'fadeIn 1s ease-in 3.5s forwards',
            }}
          >
            {/* Get Started Button */}
            <Link 
              href="/register" 
              className="btn btn-cta text-base sm:text-lg px-10 py-4"
            >
              Get Started
            </Link>

            {/* Learn More Button */}
            <Link 
              href="/about" 
              className="btn text-base sm:text-lg px-10 py-4"
              style={{
                backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#3a3a3a' : '#e5e5e5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2a2a2a' : '#f5f5f5'
              }}
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 z-10"
          style={{
            animation: 'fadeIn 1s ease-in 4s forwards'
          }}
        >
          <div className="animate-bounce">
            <svg 
              className="w-6 h-6"
              style={{
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a'
              }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          
          @keyframes flipWord {
            0% {
              transform: rotateX(90deg);
              opacity: 0;
            }
            50% {
              transform: rotateX(-10deg);
            }
            100% {
              transform: rotateX(0deg);
              opacity: 1;
            }
          }
        `}</style>
      </section>
    </>
  )
}
// File: Hero.tsx
// Path: /src/components/home/Hero.tsx
// Hero section with video that stays at 20% opacity

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
  const [videoEnded, setVideoEnded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

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

  const handleVideoEnd = () => {
    console.log('Video ended - transitioning to 20% opacity')
    setVideoEnded(true)
    // Keep video visible on last frame
    if (videoRef.current) {
      videoRef.current.pause()
      // Ensure video stays on last frame
      const duration = videoRef.current.duration
      videoRef.current.currentTime = duration
    }
  }

  return (
    <>
      {/* Fixed Video Background */}
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
            onEnded={handleVideoEnd}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: videoEnded ? 0.2 : 1,
              transition: 'opacity 1s ease-in-out',
              display: 'block', // Ensure video always displays
            }}
          >
            <source src={randomVideo} type="video/mp4" />
          </video>
          
          {/* Dark overlay - fades out when video ends */}
          <div 
            className="absolute inset-0 bg-black"
            style={{
              opacity: videoEnded ? 0 : 0.4,
              transition: 'opacity 1s ease-in-out',
              pointerEvents: 'none'
            }}
          />
        </div>
      )}

      {/* Hero Section */}
      <section 
        className={`relative h-screen flex items-center justify-center transition-colors duration-500 ${
          theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-white'
        }`}
        style={{ zIndex: 10 }}
      >
        {/* Content */}
        <div className="relative z-10 container-custom text-center px-4">
          
          {/* Heading */}
          <h1 
            className={`text-5xl md:text-6xl lg:text-7xl mb-8 opacity-0 tracking-wide uppercase`}
            style={{
              fontFamily: 'var(--font-heading)',
              animation: 'fadeIn 3s ease-in 1s forwards',
              color: videoEnded 
                ? (theme === 'dark' ? '#f5f5f5' : '#1a1a1a')
                : '#ffffff',
              transition: 'color 1s ease-in-out'
            }}
          >
            Where Music Creators
            <br />
            Connect, Collaborate & Thrive
          </h1>

          {/* Paragraph */}
          <p 
            className="text-lg md:text-xl lg:text-2xl mb-12 max-w-3xl mx-auto"
            style={{
              fontFamily: 'var(--font-body)',
              minHeight: '3rem',
              color: videoEnded
                ? (theme === 'dark' ? '#b3b3b3' : '#666666')
                : '#ffffff',
              transition: 'color 1s ease-in-out'
            }}
          >
            <TypewriterText 
              text="Join the ultimate platform for producers, musicians, and music professionals"
              startDelay={2000}
            />
          </p>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center opacity-0"
            style={{
              animation: 'fadeIn 1s ease-in 3.5s forwards'
            }}
          >
            <Link href="/register" className="btn-primary text-lg px-8 py-4">
              Get Started
            </Link>
            <Link 
              href="/about" 
              className={`text-lg px-8 py-4 rounded-lg font-semibold transition-all ${
                videoEnded
                  ? (theme === 'dark'
                      ? 'bg-[#2a2a2a] text-[#f5f5f5] hover:bg-[#3a3a3a]'
                      : 'bg-[#f5f5f5] text-[#1a1a1a] hover:bg-[#e5e5e5]')
                  : 'bg-white/10 border border-white text-white hover:bg-white hover:text-gray-900'
              }`}
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0"
          style={{
            animation: 'fadeIn 1s ease-in 4s forwards'
          }}
        >
          <div className="animate-bounce">
            <svg 
              className="w-6 h-6"
              style={{
                color: videoEnded
                  ? (theme === 'dark' ? '#f5f5f5' : '#1a1a1a')
                  : '#ffffff',
                transition: 'color 1s ease-in-out'
              }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  )
}
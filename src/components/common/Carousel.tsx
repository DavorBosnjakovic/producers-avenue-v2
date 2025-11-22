// File: Carousel.tsx
// Path: /src/components/common/Carousel.tsx
// Reusable carousel component for featured items with drag/swipe support and infinite loop

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'

interface CarouselProps {
  title: string
  viewAllLink: string
  children: React.ReactNode
}

export default function Carousel({ title, viewAllLink, children }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Touch/Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [hasDragged, setHasDragged] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const childrenArray = Array.isArray(children) ? children : [children]
  const totalItems = childrenArray.length

  // Create extended array for infinite loop (triple the items)
  const extendedChildren = [
    ...childrenArray,
    ...childrenArray,
    ...childrenArray,
  ]

  // Determine items per view based on screen size
  const [itemsToShow, setItemsToShow] = useState(4)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsToShow(1.5) // Mobile: show 1.5 cards
      } else if (window.innerWidth < 1024) {
        setItemsToShow(2.5) // Tablet: show 2.5 cards
      } else {
        setItemsToShow(4) // Desktop: show 4 cards
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Start at the middle set of items for infinite loop
  useEffect(() => {
    if (currentIndex === 0) {
      setCurrentIndex(totalItems)
    }
  }, [totalItems])

  // Navigation handlers for infinite loop
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => prev + 1)
  }, [])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => prev - 1)
  }, [])

  // Handle infinite loop reset
  useEffect(() => {
    if (totalItems === 0) return

    // When we reach near the end of the second duplicate set, instantly reset to the middle
    if (currentIndex >= totalItems * 2) {
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(totalItems)
        setTimeout(() => setIsTransitioning(true), 50)
      }, 500)

      return () => clearTimeout(timer)
    }

    // When we go before the first set, instantly reset to the middle
    if (currentIndex < totalItems) {
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(totalItems * 2 - 1)
        setTimeout(() => setIsTransitioning(true), 50)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [currentIndex, totalItems])

  // Auto-rotate carousel
  useEffect(() => {
    if (totalItems === 0) return

    const startInterval = () => {
      intervalRef.current = setInterval(() => {
        if (!isHovered && !isDragging) {
          handleNext()
        }
      }, 5000)
    }

    startInterval()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isHovered, isDragging, totalItems, handleNext])

  // Touch/Mouse drag handlers
  const handleDragStart = (clientX: number) => {
    setIsDragging(true)
    setHasDragged(false)
    setStartX(clientX)
    setCurrentX(clientX)
    setIsTransitioning(false)
  }

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return
    setCurrentX(clientX)
    const diff = clientX - startX
    setDragOffset(diff)
    
    if (Math.abs(diff) > 5) {
      setHasDragged(true)
    }
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    setIsTransitioning(true)

    const threshold = 50
    const diff = currentX - startX

    if (Math.abs(diff) > threshold && hasDragged) {
      if (diff > 0) {
        handlePrev()
      } else {
        handleNext()
      }
    }

    setTimeout(() => {
      setDragOffset(0)
      setHasDragged(false)
    }, 100)
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleDragStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX)
  }

  const handleMouseUp = () => {
    handleDragEnd()
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      handleDragEnd()
    }
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    handleDragEnd()
  }

  if (totalItems === 0) {
    return null
  }

  // Gap size in rem - 8px = 0.5rem
  const gapSize = 0.5

  return (
    <section className="relative py-12 md:py-16" style={{ zIndex: 2 }}>
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <Link 
            href={viewAllLink}
            className="text-primary hover:text-primary-hover font-semibold flex items-center gap-1 transition-colors"
          >
            View All
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false)
            if (isDragging) handleDragEnd()
          }}
        >
          
          {/* Left Scroll Button */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white dark:bg-gray-800 shadow-lg rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110"
            style={{
              opacity: isHovered ? 1 : 0,
              pointerEvents: isHovered ? 'auto' : 'none',
            }}
            aria-label="Previous items"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Carousel Items */}
          <div 
            className="overflow-hidden cursor-grab active:cursor-grabbing p-1.5"
            ref={carouselRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={`flex ${isTransitioning && !isDragging ? 'transition-transform duration-500 ease-out' : ''}`}
              style={{
                gap: '8px',
                transform: `translateX(calc(-${(currentIndex * (100 / itemsToShow)) + (currentIndex * (gapSize / itemsToShow))}% + ${dragOffset}px - 4px))`,
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
            >
              {extendedChildren.map((child, index) => (
                <div
                  key={`carousel-item-${index}`}
                  className="flex-shrink-0"
                  style={{
                    width: `calc((100% - ${(itemsToShow - 1) * gapSize}rem) / ${itemsToShow})`,
                  }}
                  onDragStart={(e) => e.preventDefault()}
                >
                  {child}
                </div>
              ))}
            </div>
          </div>

          {/* Right Scroll Button */}
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white dark:bg-gray-800 shadow-lg rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110"
            style={{
              opacity: isHovered ? 1 : 0,
              pointerEvents: isHovered ? 'auto' : 'none',
            }}
            aria-label="Next items"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {childrenArray.map((_, index) => {
            // Calculate normalized index for dots
            const normalizedIndex = ((currentIndex % totalItems) + totalItems) % totalItems
            const isActive = normalizedIndex === index
            
            return (
              <button
                key={index}
                onClick={() => setCurrentIndex(totalItems + index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-primary w-8'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 w-2'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
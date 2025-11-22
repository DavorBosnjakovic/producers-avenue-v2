// File: AddNewItemModal.tsx
// Path: /src/components/common/AddNewItemModal.tsx
// Modal for selecting what type of item to create (Product/Service/Webinar)

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/contexts/ThemeContext'

interface AddNewItemModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddNewItemModal({ isOpen, onClose }: AddNewItemModalProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 150)
  }

  const handleOptionClick = (path: string) => {
    handleClose()
    setTimeout(() => {
      router.push(path)
    }, 200)
  }

  if (!isOpen && !isClosing) return null

  return (
    <>
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-200 z-50 ${
          isClosing ? 'opacity-0' : 'opacity-50'
        }`}
        onClick={handleClose}
        style={{ backdropFilter: 'blur(8px)' }}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className={`relative w-full max-w-2xl my-8 transition-all duration-200 ${
            isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <div
            className="rounded-xl shadow-2xl overflow-hidden"
            style={{
              backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
            }}
          >
            {/* Header with Cancel Button */}
            <div className="px-6 py-5 border-b"
              style={{
                borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
              }}
            >
              <div className="flex items-center justify-between">
                <h2
                  className="text-2xl md:text-3xl"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  WHAT WOULD YOU LIKE TO CREATE?
                </h2>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                    color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Options Content */}
            <div className="px-6 py-6 space-y-4">
              {/* Product Option */}
              <button
                onClick={() => handleOptionClick('/create/product')}
                className="w-full text-left p-6 rounded-lg border transition-all duration-300 hover:shadow-lg group"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                  borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#009ae9'
                  e.currentTarget.style.boxShadow = '0 0 8px 0 rgba(0, 154, 233, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e0e0e0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3
                      className="text-2xl md:text-3xl mb-2"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      }}
                    >
                      PRODUCT
                    </h3>
                    <p
                      className="text-base md:text-lg mb-3"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#b3b3b3' : '#666666',
                      }}
                    >
                      Sell digital downloads and instant delivery products
                    </p>
                    <ul className="space-y-1.5">
                      {['Beats & instrumentals', 'Sample packs & loops', 'Presets & templates', 'And more'].map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm md:text-base"
                          style={{
                            color: theme === 'dark' ? '#b3b3b3' : '#666666',
                          }}
                        >
                          <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#009ae9' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex-shrink-0">
                    <svg
                      className="w-6 h-6 transition-transform group-hover:translate-x-1"
                      style={{ color: '#009ae9' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Service Option */}
              <button
                onClick={() => handleOptionClick('/create/service')}
                className="w-full text-left p-6 rounded-lg border transition-all duration-300 hover:shadow-lg group"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                  borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#009ae9'
                  e.currentTarget.style.boxShadow = '0 0 8px 0 rgba(0, 154, 233, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e0e0e0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3
                      className="text-2xl md:text-3xl mb-2"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      }}
                    >
                      SERVICE
                    </h3>
                    <p
                      className="text-base md:text-lg mb-3"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#b3b3b3' : '#666666',
                      }}
                    >
                      Offer your expertise with custom packages
                    </p>
                    <ul className="space-y-1.5">
                      {['Mixing & mastering', 'Music production', 'Vocal editing & tuning', 'And more'].map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm md:text-base"
                          style={{
                            color: theme === 'dark' ? '#b3b3b3' : '#666666',
                          }}
                        >
                          <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#009ae9' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex-shrink-0">
                    <svg
                      className="w-6 h-6 transition-transform group-hover:translate-x-1"
                      style={{ color: '#009ae9' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Webinar Option */}
              <button
                onClick={() => handleOptionClick('/create/webinar')}
                className="w-full text-left p-6 rounded-lg border transition-all duration-300 hover:shadow-lg group"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                  borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#009ae9'
                  e.currentTarget.style.boxShadow = '0 0 8px 0 rgba(0, 154, 233, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme === 'dark' ? '#2a2a2a' : '#e0e0e0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3
                      className="text-2xl md:text-3xl mb-2"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                      }}
                    >
                      WEBINAR
                    </h3>
                    <p
                      className="text-base md:text-lg mb-3"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#b3b3b3' : '#666666',
                      }}
                    >
                      Host live sessions and workshops
                    </p>
                    <ul className="space-y-1.5">
                      {['Live video sessions', 'Screen sharing', 'Q&A with audience', 'Recording available'].map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm md:text-base"
                          style={{
                            color: theme === 'dark' ? '#b3b3b3' : '#666666',
                          }}
                        >
                          <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#009ae9' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex-shrink-0">
                    <svg
                      className="w-6 h-6 transition-transform group-hover:translate-x-1"
                      style={{ color: '#009ae9' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
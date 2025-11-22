// File: AudioPlayerModal.tsx
// Path: /src/components/marketplace/products/AudioPlayerModal.tsx
// Audio preview modal with player controls and track list

'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useTheme } from '@/lib/contexts/ThemeContext'

interface AudioTrack {
  id: string
  title: string
  duration: number // in seconds
  url: string
}

interface AudioPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    title: string
    image: string
    price: number
    seller: {
      name: string
      avatar: string
    }
  }
  tracks: AudioTrack[]
}

export default function AudioPlayerModal({
  isOpen,
  onClose,
  product,
  tracks,
}: AudioPlayerModalProps) {
  const { theme } = useTheme()
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentTrack = tracks[currentTrackIndex]

  // Load new track when index changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url
      audioRef.current.load()
      if (isPlaying) {
        audioRef.current.play()
      }
    }
  }, [currentTrackIndex, currentTrack])

  // Auto-play first track when modal opens
  useEffect(() => {
    if (isOpen && audioRef.current) {
      setCurrentTrackIndex(0)
      setIsPlaying(true)
      audioRef.current.play()
    } else {
      setIsPlaying(false)
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [isOpen])

  // Update current time
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      // Auto-play next track
      if (currentTrackIndex < tracks.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1)
      } else {
        setIsPlaying(false)
      }
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentTrackIndex, tracks.length])

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    if (newVolume > 0) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const playTrack = (index: number) => {
    setCurrentTrackIndex(index)
    setIsPlaying(true)
  }

  const skipPrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1)
    }
  }

  const skipNext = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1)
    }
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAddToCart = () => {
    // Handle add to cart
    console.log('Added to cart:', product.id)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden"
          style={{
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{
              borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
            }}
          >
            <h2
              className="text-2xl font-bold"
              style={{
                fontFamily: 'var(--font-heading)',
                color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
              }}
            >
              Audio Preview
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: theme === 'dark' ? '#b3b3b3' : '#666666' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Product Info & Player */}
            <div className="lg:w-2/3 p-6">
              {/* Product Info */}
              <div className="flex gap-4 mb-6">
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                    }}
                  >
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative w-6 h-6">
                      <Image
                        src={product.seller.avatar}
                        alt={product.seller.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <span
                      className="text-sm"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: theme === 'dark' ? '#b3b3b3' : '#666666',
                      }}
                    >
                      {product.seller.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-2xl font-bold"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        color: '#009ae9',
                      }}
                    >
                      ${product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={handleAddToCart}
                      className="px-4 py-2 rounded-lg font-semibold transition-colors"
                      style={{
                        backgroundColor: '#009ae9',
                        color: 'white',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#0088cc'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#009ae9'
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>

              {/* Waveform Visualization Placeholder */}
              <div
                className="h-32 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden"
                style={{
                  backgroundColor: theme === 'dark' ? '#0d0d0d' : '#f5f5f5',
                }}
              >
                {/* Simple waveform visualization */}
                <div className="flex items-center justify-center gap-1 h-full w-full px-4">
                  {Array.from({ length: 100 }).map((_, i) => {
                    const height = Math.random() * 80 + 20
                    const progress = (currentTime / duration) * 100
                    const barProgress = (i / 100) * 100
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-full transition-all duration-100"
                        style={{
                          height: `${height}%`,
                          backgroundColor:
                            barProgress <= progress
                              ? '#009ae9'
                              : theme === 'dark'
                              ? '#2a2a2a'
                              : '#d0d0d0',
                          opacity: barProgress <= progress ? 1 : 0.5,
                        }}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #009ae9 0%, #009ae9 ${
                      (currentTime / duration) * 100
                    }%, ${
                      theme === 'dark' ? '#2a2a2a' : '#e0e0e0'
                    } ${(currentTime / duration) * 100}%, ${
                      theme === 'dark' ? '#2a2a2a' : '#e0e0e0'
                    } 100%)`,
                  }}
                />
                <div className="flex justify-between items-center mt-2">
                  <span
                    className="text-sm"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    }}
                  >
                    {formatTime(currentTime)}
                  </span>
                  <span
                    className="text-sm"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: theme === 'dark' ? '#b3b3b3' : '#666666',
                    }}
                  >
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Previous */}
                  <button
                    onClick={skipPrevious}
                    disabled={currentTrackIndex === 0}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous track"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}
                    >
                      <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                    </svg>
                  </button>

                  {/* Play/Pause */}
                  <button
                    onClick={togglePlayPause}
                    className="p-3 rounded-full transition-all hover:scale-105"
                    style={{
                      backgroundColor: '#009ae9',
                      color: 'white',
                    }}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Next */}
                  <button
                    onClick={skipNext}
                    disabled={currentTrackIndex === tracks.length - 1}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next track"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}
                    >
                      <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                    </svg>
                  </button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        style={{ color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a' }}
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #009ae9 0%, #009ae9 ${
                        (isMuted ? 0 : volume) * 100
                      }%, ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'} ${
                        (isMuted ? 0 : volume) * 100
                      }%, ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'} 100%)`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Track List */}
            <div
              className="lg:w-1/3 border-t lg:border-t-0 lg:border-l p-6 max-h-[500px] overflow-y-auto"
              style={{
                borderColor: theme === 'dark' ? '#2a2a2a' : '#e0e0e0',
                backgroundColor: theme === 'dark' ? '#0d0d0d' : '#f9f9f9',
              }}
            >
              <h3
                className="text-lg font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: theme === 'dark' ? '#f5f5f5' : '#1a1a1a',
                }}
              >
                Track List ({tracks.length})
              </h3>
              <div className="space-y-2">
                {tracks.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => playTrack(index)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor:
                        index === currentTrackIndex
                          ? theme === 'dark'
                            ? 'rgba(0, 154, 233, 0.15)'
                            : 'rgba(0, 154, 233, 0.1)'
                          : theme === 'dark'
                          ? '#1a1a1a'
                          : '#ffffff',
                      border:
                        index === currentTrackIndex
                          ? '1px solid rgba(0, 154, 233, 0.5)'
                          : `1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'}`,
                    }}
                  >
                    <div className="flex-shrink-0">
                      {index === currentTrackIndex && isPlaying ? (
                        <div className="flex items-center gap-0.5">
                          <div
                            className="w-1 bg-[#009ae9] rounded-full animate-pulse"
                            style={{ height: '12px', animationDelay: '0ms' }}
                          />
                          <div
                            className="w-1 bg-[#009ae9] rounded-full animate-pulse"
                            style={{ height: '16px', animationDelay: '150ms' }}
                          />
                          <div
                            className="w-1 bg-[#009ae9] rounded-full animate-pulse"
                            style={{ height: '10px', animationDelay: '300ms' }}
                          />
                        </div>
                      ) : (
                        <div
                          className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor:
                              index === currentTrackIndex
                                ? '#009ae9'
                                : theme === 'dark'
                                ? '#2a2a2a'
                                : '#e0e0e0',
                            color:
                              index === currentTrackIndex
                                ? 'white'
                                : theme === 'dark'
                                ? '#b3b3b3'
                                : '#666666',
                          }}
                        >
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{
                          fontFamily: 'var(--font-body)',
                          color:
                            index === currentTrackIndex
                              ? '#009ae9'
                              : theme === 'dark'
                              ? '#f5f5f5'
                              : '#1a1a1a',
                        }}
                      >
                        {track.title}
                      </p>
                      <p
                        className="text-xs"
                        style={{
                          fontFamily: 'var(--font-body)',
                          color: theme === 'dark' ? '#b3b3b3' : '#666666',
                        }}
                      >
                        {formatTime(track.duration)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hidden Audio Element */}
          <audio ref={audioRef} preload="metadata" />
        </div>
      </div>
    </>
  )
}
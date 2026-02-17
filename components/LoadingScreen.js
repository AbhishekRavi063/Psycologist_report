'use client'

import { usePathname } from 'next/navigation'
import { useRef, useEffect, useState } from 'react'

const LOADING_IMAGES = ['/anxiety.png', '/love.png', '/sed.png', '/stress.png']

function pickRandomImage() {
  return LOADING_IMAGES[Math.floor(Math.random() * LOADING_IMAGES.length)]
}

const AUTH_PATHS = ['/login', '/signup']

export default function LoadingScreen() {
  const pathname = usePathname()
  const prevPathnameRef = useRef(null)
  const isInitialMountRef = useRef(true)
  const [showLoading, setShowLoading] = useState(true)
  const [mode, setMode] = useState('video') // 'video' | 'image'
  const [randomImage, setRandomImage] = useState(LOADING_IMAGES[0])
  const videoRef = useRef(null)
  const imageTimeoutRef = useRef(null)

  // Hard refresh (any page): show video and play fully. Client-side nav from auth→dashboard: video. Other nav: random image.
  useEffect(() => {
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      const fromAuth = AUTH_PATHS.includes(prevPathnameRef.current)
      const toDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard')
      const showVideo = fromAuth && toDashboard
      setRandomImage(pickRandomImage())
      setMode(showVideo ? 'video' : 'image')
      setShowLoading(true)
    } else if (isInitialMountRef.current) {
      isInitialMountRef.current = false
      setMode('video')
      setShowLoading(true)
    }
    prevPathnameRef.current = pathname
  }, [pathname])

  // Video: play when showing in video mode
  useEffect(() => {
    if (!showLoading || mode !== 'video' || !videoRef.current) return
    const video = videoRef.current
    video.muted = true
    video.currentTime = 0
    const play = () => video.play().catch(() => {})
    play()
    const onCanPlay = () => play()
    video.addEventListener('canplay', onCanPlay, { once: true })
    video.addEventListener('loadeddata', onCanPlay, { once: true })
    return () => {
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('loadeddata', onCanPlay)
    }
  }, [showLoading, mode])

  // Image: hide after a short delay
  useEffect(() => {
    if (!showLoading || mode !== 'image') return
    imageTimeoutRef.current = setTimeout(() => setShowLoading(false), 2000)
    return () => {
      if (imageTimeoutRef.current) clearTimeout(imageTimeoutRef.current)
    }
  }, [showLoading, mode])

  // Only hide after the video has played fully (no timeout or early hide)
  const handleVideoEnded = () => setShowLoading(false)

  if (!showLoading) return null

  if (mode === 'image') {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-50 p-4"
        aria-hidden="true"
      >
        <img
          src={randomImage}
          alt=""
          className="max-h-[90dvh] max-w-full w-auto object-contain"
        />
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-gray-50 p-4"
      aria-hidden="true"
    >
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 tracking-widest shrink-0">
        WELCOME
      </h1>
      <video
        ref={videoRef}
        src="/loading.mp4"
        className="h-full max-h-[60dvh] w-auto max-w-full object-contain"
        autoPlay
        playsInline
        muted
        preload="auto"
        onEnded={handleVideoEnded}
      />
    </div>
  )
}

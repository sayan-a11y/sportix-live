'use client'

import React, { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { Volume2, VolumeX, Maximize, Play, Pause, Settings, Loader2 } from 'lucide-react'

interface HlsPlayerProps {
  src: string
  autoPlay?: boolean
  muted?: boolean
  className?: string
  poster?: string
}

export default function HlsPlayer({
  src,
  autoPlay = true,
  muted = false,
  className = '',
  poster = ''
}: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(muted)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let hls: Hls | null = null

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      })

      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false)
        if (autoPlay) {
          video.play().catch(e => console.error("Autoplay failed:", e))
        }
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Fatal network error encountered, trying to recover")
              hls?.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Fatal media error encountered, trying to recover")
              hls?.recoverMediaError()
              break
            default:
              console.error("Fatal error, cannot recover")
              setError("Stream unavailable")
              hls?.destroy()
              break
          }
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari which has native HLS support
      video.src = src
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false)
        if (autoPlay) {
          video.play().catch(e => console.error("Autoplay failed:", e))
        }
      })
    } else {
      setError("HLS is not supported in this browser")
    }

    return () => {
      if (hls) {
        hls.destroy()
      }
    }
  }, [src, autoPlay])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen()
    }
  }

  return (
    <div className={`relative group bg-black overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        playsInline
        muted={isMuted}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
      />

      {/* Custom Controls Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        
        {/* Loading State */}
        {isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <p className="text-white font-semibold">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-[#00ff88] transition-colors">
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button onClick={toggleMute} className="text-white hover:text-[#00ff88] transition-colors">
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>

            <div className="flex flex-col">
              <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-[#ff3b3b] px-1.5 py-0.5 rounded leading-none">Live</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button className="text-white/70 hover:text-white transition-colors">
              <Settings size={20} />
            </button>
            <button onClick={handleFullscreen} className="text-white hover:text-[#00ff88] transition-colors">
              <Maximize size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

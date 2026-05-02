import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { ArrowLeft, Settings, Maximize, Volume2, VolumeX, Users, Radio } from 'lucide-react'
import LiveChat from './LiveChat'
import MuxPlayer from '@mux/mux-player-react'

const QUALITY_OPTIONS = ['Auto', '1080p', '720p', '480p', '360p']

export default function VideoPlayer() {
  const { selectedStream, setCurrentView, setSelectedStream } = useAppStore()
  const [isMuted, setIsMuted] = useState(false)
  const [quality, setQuality] = useState('Auto')
  const [showQuality, setShowQuality] = useState(false)
  const [viewerCount, setViewerCount] = useState(selectedStream?.viewerCount || 0)

  useEffect(() => {
    if (!selectedStream) return
    const interval = setInterval(() => {
      setViewerCount((prev) => {
        const delta = Math.floor(Math.random() * 10) - 5
        return Math.max(10, prev + delta)
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [selectedStream])

  if (!selectedStream) return null

  const formatViewers = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  return (
    <div className="sportix-bg min-h-screen">
      {/* Minimal Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-white/5 bg-[#02040a]/80 px-4 backdrop-blur-xl">
        <button
          onClick={() => {
            setCurrentView('home')
            setSelectedStream(null)
          }}
          className="flex items-center gap-2 rounded-lg p-2 text-white/50 transition-all hover:bg-white/5 hover:text-white touch-active"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="hidden text-sm sm:inline">Back</span>
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff3b3b] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff3b3b]" />
          </span>
          <h1 className="truncate text-sm font-semibold text-white">{selectedStream.title}</h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <Users className="h-3.5 w-3.5" />
          {formatViewers(viewerCount)}
        </div>
      </header>

      {/* Player + Chat layout */}
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row">
          {/* Player Area */}
          <div className="flex-1 p-4 md:p-6">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/5 bg-black shadow-2xl">
              {selectedStream.playbackId ? (
                <MuxPlayer
                  playbackId={selectedStream.playbackId}
                  metadata={{
                    video_id: selectedStream.id,
                    video_title: selectedStream.title,
                    viewer_user_id: 'user-123',
                  }}
                  streamType="live"
                  autoPlay
                  muted={isMuted}
                  className="h-full w-full"
                  style={{ aspectRatio: '16/9' }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#0b0f1a] via-[#111827] to-[#1a2235] flex items-center justify-center">
                   <div className="text-center">
                    <div className="mb-4 flex items-center justify-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ff3b3b]/10 ring-2 ring-[#ff3b3b]/20 animate-pulse">
                        <Radio className="h-8 w-8 text-[#ff3b3b]" />
                      </div>
                    </div>
                    <p className="text-lg font-bold text-white">Stream is Offline</p>
                    <p className="mt-1 text-xs text-white/40 uppercase tracking-widest">Waiting for broadcaster...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stream Info */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 rounded-lg bg-[#ff3b3b]/10 px-2.5 py-1 text-xs font-bold text-[#ff3b3b] ring-1 ring-[#ff3b3b]/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ff3b3b] live-pulse" />
                    LIVE
                  </span>
                  <span className="text-sm text-white/40">{formatViewers(viewerCount)} watching</span>
                </div>
                <div className="flex items-center gap-2">
                   <button className="rounded-lg p-2 text-white/30 transition-colors hover:text-white hover:bg-white/5">
                      <Settings className="h-5 w-5" />
                    </button>
                    <button className="rounded-lg p-2 text-white/30 transition-colors hover:text-white hover:bg-white/5">
                      <Maximize className="h-5 w-5" />
                    </button>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white tracking-tight">{selectedStream.title}</h2>
              
              {selectedStream.description && (
                <p className="text-[15px] text-white/50 leading-relaxed max-w-3xl">{selectedStream.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="rounded-full bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60 capitalize border border-white/5">{selectedStream.category}</span>
                <div className="h-1 w-1 rounded-full bg-white/10" />
                <span className="text-sm font-semibold text-[#00ff88]">{selectedStream.homeTeam} {selectedStream.homeScore} — {selectedStream.awayScore} {selectedStream.awayTeam}</span>
                <div className="h-1 w-1 rounded-full bg-white/10" />
                <span className="text-sm text-white/30 font-medium">{selectedStream.matchTime || 'LIVE'}</span>
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="w-full border-l border-white/5 lg:w-[400px] bg-black/20">
            <div className="sticky top-14 h-[calc(100vh-3.5rem)]">
              <div className="h-full">
                <LiveChat streamId={selectedStream.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

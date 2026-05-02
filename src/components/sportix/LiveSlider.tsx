'use client'

import { useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface StreamItem {
  id: string
  title: string
  status: string
  viewerCount: number
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  matchTime?: string
  thumbnail?: string
  category: string
}

const CATEGORY_ICONS: Record<string, string> = {
  football: '⚽',
  basketball: '🏀',
  racing: '🏎️',
  tennis: '🎾',
}

const THUMBNAILS: Record<string, string> = {
  'UEFA Champions League — Semi Final': '/thumbnails/ucl-semi.png',
  'Premier League — Title Race': '/thumbnails/epl-title.png',
  'NBA Playoffs — Game 5': '/thumbnails/nba-playoffs.png',
  'La Liga — El Clásico': '/thumbnails/el-clasico.png',
  'Formula 1 — Monaco Grand Prix': '/thumbnails/f1-monaco.png',
}

export default function LiveSlider({ streams }: { streams: StreamItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const { setSelectedStream, setCurrentView } = useAppStore()

  const liveStreams = streams.filter((s) => s.status === 'live')

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    el?.addEventListener('scroll', checkScroll)
    return () => el?.removeEventListener('scroll', checkScroll)
  }, [liveStreams])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const scrollAmount = el.clientWidth * 0.75
    el.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
  }

  const formatViewers = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  if (liveStreams.length === 0) return null

  return (
    <section className="relative">
      <div className="mb-4 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff3b3b] opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#ff3b3b]" />
            </span>
            <h2 className="text-xl font-bold text-white">Live Now</h2>
          </div>
          <span className="rounded-full bg-[#ff3b3b]/10 px-3 py-0.5 text-xs font-semibold text-[#ff3b3b] ring-1 ring-[#ff3b3b]/20">
            {liveStreams.length} LIVE
          </span>
        </div>
      </div>

      <div className="group relative">
        {/* Scroll buttons - desktop only */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-[#0b0f1a]/90 p-2 text-white/70 shadow-lg backdrop-blur-sm transition-all hover:text-white hover:bg-[#0b0f1a] md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-[#0b0f1a]/90 p-2 text-white/70 shadow-lg backdrop-blur-sm transition-all hover:text-white hover:bg-[#0b0f1a] md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto px-4 pb-2 no-scrollbar md:px-6"
        >
          {liveStreams.map((stream) => (
            <button
              key={stream.id}
              onClick={() => {
                setSelectedStream(stream as any)
                setCurrentView('player')
              }}
              className="glass-card glass-card-hover group/card flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] overflow-hidden text-left transition-all duration-200 touch-active"
            >
              {/* Thumbnail */}
              <div className="relative h-44 sm:h-48 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover/card:scale-105"
                  style={{
                    backgroundImage: stream.thumbnail
                      ? `url(${stream.thumbnail})`
                      : `url(${THUMBNAILS[stream.title] || ''})`,
                    backgroundColor: stream.thumbnail || THUMBNAILS[stream.title] ? undefined : 'linear-gradient(135deg, #1a2235, #243049)',
                  }}
                >
                  {!stream.thumbnail && !THUMBNAILS[stream.title] && (
                    <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30">
                      {CATEGORY_ICONS[stream.category] || '⚽'}
                    </div>
                  )}
                </div>

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Live badge */}
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-[#ff3b3b] px-2.5 py-1 text-xs font-bold text-white shadow-lg">
                  <span className="h-1.5 w-1.5 rounded-full bg-white live-pulse" />
                  LIVE
                </div>

                {/* Viewer count */}
                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-black/50 px-2.5 py-1 text-xs text-white/80 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00ff88]" />
                  {formatViewers(stream.viewerCount)} watching
                </div>

                {/* Score */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-xs font-medium text-white/60 truncate max-w-[120px]">{stream.homeTeam}</span>
                      <span className="text-2xl font-bold">{stream.homeScore}</span>
                    </div>
                    <div className="flex flex-col items-center px-3">
                      <span className="text-xs font-medium text-[#00ff88]">{stream.matchTime || 'LIVE'}</span>
                      <span className="text-xs text-white/40">VS</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-xs font-medium text-white/60 truncate max-w-[120px]">{stream.awayTeam}</span>
                      <span className="text-2xl font-bold">{stream.awayScore}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom info */}
              <div className="p-3">
                <p className="text-sm font-medium text-white/90 truncate">{stream.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

import { useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
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

const LEAGUE_MAP: Record<string, string> = {
  'UEFA Champions League — Semi Final': 'UEFA Champions League',
  'Premier League — Title Race': 'Premier League',
  'NBA Playoffs — Game 5': 'NBA Playoffs',
  'La Liga — El Clásico': 'La Liga',
  'Formula 1 — Monaco Grand Prix': 'Formula 1',
  'Tennis — Wimbledon Final': 'Wimbledon',
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
    el?.addEventListener('scroll', checkScroll, { passive: true })
    return () => el?.removeEventListener('scroll', checkScroll)
  }, [liveStreams])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -el.clientWidth * 0.8 : el.clientWidth * 0.8, behavior: 'smooth' })
  }

  if (liveStreams.length === 0) return null

  return (
    <section className="relative">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff3b3b] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#ff3b3b]" />
          </span>
          <h2 className="text-[15px] font-bold text-white">Live Now</h2>
          <span className="rounded-full bg-[#ff3b3b]/10 px-2 py-0.5 text-[10px] font-bold text-[#ff3b3b]">
            {liveStreams.length} LIVE
          </span>
        </div>
        <button className="flex items-center gap-1 text-[12px] font-medium text-[#00ff88] transition-colors hover:text-[#00dd75]">
          View All Live <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="group relative">
        {/* Scroll buttons */}
        {canScrollLeft && (
          <button onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 hidden w-12 items-center justify-center bg-gradient-to-r from-[#0a0e1a] to-transparent lg:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 shadow-lg backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </div>
          </button>
        )}
        {canScrollRight && (
          <button onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 hidden w-12 items-center justify-center bg-gradient-to-l from-[#0a0e1a] to-transparent lg:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 shadow-lg backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white">
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        )}

        {/* Cards */}
        <div ref={scrollRef} className="flex gap-3.5 overflow-x-auto no-scrollbar pb-1">
          {liveStreams.map((stream) => {
            const thumb = stream.thumbnail || THUMBNAILS[stream.title]
            const league = LEAGUE_MAP[stream.title] || stream.category
            return (
              <button
                key={stream.id}
                onClick={() => { setSelectedStream(stream as any); setCurrentView('player') }}
                className="group/card flex-shrink-0 w-[280px] xl:w-[300px] overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] text-left transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04] active:scale-[0.98] touch-active"
              >
                {/* Thumbnail */}
                <div className="relative h-[155px] overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover/card:scale-105"
                    style={{
                      backgroundImage: thumb ? `url(${thumb})` : undefined,
                      backgroundColor: thumb ? undefined : 'linear-gradient(135deg, #111827, #1a2235)',
                    }}
                  >
                    {!thumb && (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">
                        {CATEGORY_ICONS[stream.category] || '⚽'}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Live badge */}
                  <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-[#ff3b3b] px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                    <span className="h-1.5 w-1.5 rounded-full bg-white live-pulse" />
                    LIVE
                  </div>

                  {/* Viewer count */}
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-black/50 px-2 py-0.5 text-[10px] text-white/70 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00ff88]" />
                    {(stream.viewerCount / 1000).toFixed(1)}K
                  </div>

                  {/* Score overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-[10px] font-medium text-white/50 mb-1.5">{league}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">
                          {stream.homeTeam[0]}
                        </div>
                        <span className="text-[11px] font-medium text-white truncate">{stream.homeTeam}</span>
                      </div>
                      <div className="flex items-center gap-2 px-2">
                        <span className="text-lg font-bold text-white tabular-nums">{stream.homeScore}</span>
                        <span className="text-[10px] text-[#00ff88] font-medium">{stream.matchTime || 'LIVE'}</span>
                        <span className="text-lg font-bold text-white tabular-nums">{stream.awayScore}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span className="text-[11px] font-medium text-white truncate">{stream.awayTeam}</span>
                        <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">
                          {stream.awayTeam[0]}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

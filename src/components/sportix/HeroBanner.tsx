'use client'

import { useAppStore } from '@/lib/store'
import { Play, Radio } from 'lucide-react'

export default function HeroBanner({ stream }: {
  stream: {
    id: string
    title: string
    homeTeam: string
    awayTeam: string
    homeScore: number
    awayScore: number
    matchTime?: string
    thumbnail?: string
    category: string
    viewerCount: number
  }
}) {
  const { setSelectedStream, setCurrentView } = useAppStore()

  const thumb = stream.thumbnail

  return (
    <button
      onClick={() => { setSelectedStream(stream as any); setCurrentView('player') }}
      className="relative w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] text-left transition-all active:scale-[0.98] touch-active lg:hidden"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: thumb ? `url(${thumb})` : undefined,
            backgroundColor: thumb ? undefined : 'linear-gradient(135deg, #111827, #1a2235)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

        {/* Live badge */}
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-md bg-[#ff3b3b] px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-white live-pulse" />
          LIVE
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-[10px] font-medium text-[#00ff88] mb-1 uppercase tracking-wider">
            {stream.category === 'football' ? 'UEFA Champions League' : stream.category}
          </p>
          <h2 className="text-lg font-bold text-white leading-tight mb-2">
            {stream.homeTeam} vs {stream.awayTeam}
          </h2>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/70">
                {stream.homeTeam[0]}
              </div>
              <span className="text-base font-bold text-white tabular-nums">{stream.homeScore}</span>
            </div>
            <span className="text-[10px] font-medium text-[#00ff88]">{stream.matchTime || 'LIVE'}</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tabular-nums">{stream.awayScore}</span>
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/70">
                {stream.awayTeam[0]}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-1.5 rounded-lg bg-[#00ff88] px-4 py-2 text-xs font-bold text-[#02040a] transition-all hover:bg-[#00dd75]"
              onClick={(e) => { e.stopPropagation(); setSelectedStream(stream as any); setCurrentView('player') }}
            >
              <Play className="h-3.5 w-3.5 fill-[#02040a]" />
              Watch Now
            </button>
            <span className="flex items-center gap-1 text-[10px] text-white/40">
              <Radio className="h-3 w-3 text-[#ff3b3b]" />
              {(stream.viewerCount / 1000).toFixed(1)}K watching
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

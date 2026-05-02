'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import Header from '@/components/sportix/Header'
import LiveSlider from '@/components/sportix/LiveSlider'
import VideoPlayer from '@/components/sportix/VideoPlayer'
import AdminPanel from '@/components/sportix/AdminPanel'
import BottomNav from '@/components/sportix/BottomNav'
import { ContentSection, VideoCard, ContinueCard } from '@/components/sportix/VideoCard'
import { Trophy, Sparkles, Clock, Flame, TrendingUp } from 'lucide-react'

interface StreamData {
  id: string
  title: string
  description?: string
  thumbnail?: string
  category: string
  status: string
  viewerCount: number
  peakViewers: number
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  matchTime?: string
  isFeatured: boolean
}

interface VideoData {
  id: string
  title: string
  description?: string
  thumbnail?: string
  duration: number
  category: string
  views: number
  isFeatured: boolean
}

interface ContinueData {
  id: string
  videoId: string
  title: string
  thumbnail?: string
  duration: number
  progress: number
  watchedAt: string
}

export default function Home() {
  const { currentView } = useAppStore()
  const [streams, setStreams] = useState<StreamData[]>([])
  const [videos, setVideos] = useState<VideoData[]>([])
  const [continueWatching, setContinueWatching] = useState<ContinueData[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [streamsRes, videosRes] = await Promise.all([
        fetch('/api/streams'),
        fetch('/api/videos'),
      ])
      const streamsData = await streamsRes.json()
      const videosData = await videosRes.json()
      setStreams(streamsData)
      setVideos(videosData)

      // Load continue watching from local storage
      const saved = localStorage.getItem('sportix-continue')
      if (saved) {
        setContinueWatching(JSON.parse(saved))
      } else {
        // Use default continue watching data
        setContinueWatching([
          { id: 'cw1', videoId: 'cw1', title: 'Champions League Semi Final Recap', thumbnail: '/thumbnails/ucl-semi.png', duration: 1200, progress: 0.65, watchedAt: new Date().toISOString() },
          { id: 'cw2', videoId: 'cw2', title: 'NBA Playoffs Game 3 Highlights', thumbnail: '/thumbnails/nba-playoffs.png', duration: 900, progress: 0.32, watchedAt: new Date().toISOString() },
          { id: 'cw3', videoId: 'cw3', title: 'Premier League Review Show', thumbnail: '/thumbnails/epl-goals.png', duration: 2700, progress: 0.88, watchedAt: new Date().toISOString() },
        ])
      }
    } catch (e) {
      console.error('Failed to load data:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    // Auto seed if empty
    fetch('/api/admin/seed').catch(() => {})
    // Refresh periodically
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [loadData])

  // Handle view routing
  if (currentView === 'player') {
    return <VideoPlayer />
  }

  if (currentView === 'admin') {
    return <AdminPanel />
  }

  const featuredVideos = videos.filter((v) => v.isFeatured)
  const highlightVideos = videos.filter((v) => v.category === 'highlights')
  const allOtherVideos = videos

  return (
    <div className="sportix-bg min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88]" />
              <p className="text-sm text-white/30">Loading Sportix Live...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Live Slider */}
            <section className="pt-6">
              <LiveSlider streams={streams} />
            </section>

            {/* Continue Watching */}
            {continueWatching.length > 0 && (
              <ContentSection
                title="Continue Watching"
                icon={<Clock className="h-5 w-5 text-[#f59e0b]" />}
              >
                {continueWatching.map((item) => (
                  <ContinueCard
                    key={item.id}
                    item={item}
                    onSelect={(i) => {
                      localStorage.setItem('sportix-continue', JSON.stringify(
                        continueWatching.filter(c => c.id !== i.id)
                      ))
                      setContinueWatching(prev => prev.filter(c => c.id !== i.id))
                    }}
                  />
                ))}
              </ContentSection>
            )}

            {/* Featured Matches */}
            {featuredVideos.length > 0 && (
              <ContentSection
                title="Featured"
                icon={<Sparkles className="h-5 w-5 text-[#00ff88]" />}
              >
                {featuredVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onSelect={(v) => {
                      const store = useAppStore.getState()
                      store.setSelectedVideo(v as any)
                      store.setSelectedStream({
                        ...v,
                        status: 'offline',
                        viewerCount: 0,
                        peakViewers: 0,
                        homeTeam: '',
                        awayTeam: '',
                        homeScore: 0,
                        awayScore: 0,
                        isFeatured: v.isFeatured,
                      } as any)
                      store.setCurrentView('player')
                    }}
                  />
                ))}
              </ContentSection>
            )}

            {/* Highlights */}
            {highlightVideos.length > 0 && (
              <ContentSection
                title="Highlights"
                icon={<Flame className="h-5 w-5 text-[#ff3b3b]" />}
              >
                {highlightVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onSelect={(v) => {
                      const store = useAppStore.getState()
                      store.setSelectedVideo(v as any)
                      store.setSelectedStream({
                        ...v,
                        status: 'offline',
                        viewerCount: 0,
                        peakViewers: 0,
                        homeTeam: '',
                        awayTeam: '',
                        homeScore: 0,
                        awayScore: 0,
                        isFeatured: v.isFeatured,
                      } as any)
                      store.setCurrentView('player')
                    }}
                  />
                ))}
              </ContentSection>
            )}

            {/* All Videos */}
            {allOtherVideos.length > 0 && (
              <ContentSection
                title="All Videos"
                icon={<Trophy className="h-5 w-5 text-[#06b6d4]" />}
              >
                {allOtherVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onSelect={(v) => {
                      const store = useAppStore.getState()
                      store.setSelectedVideo(v as any)
                      store.setSelectedStream({
                        ...v,
                        status: 'offline',
                        viewerCount: 0,
                        peakViewers: 0,
                        homeTeam: '',
                        awayTeam: '',
                        homeScore: 0,
                        awayScore: 0,
                        isFeatured: v.isFeatured,
                      } as any)
                      store.setCurrentView('player')
                    }}
                  />
                ))}
              </ContentSection>
            )}

            {/* Empty state */}
            {streams.length === 0 && videos.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
                  <Trophy className="h-10 w-10 text-white/10" />
                </div>
                <h3 className="text-lg font-semibold text-white/60">No content yet</h3>
                <p className="mt-1 text-sm text-white/30">Check back soon for live matches and highlights</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="hidden border-t border-white/5 bg-[#02040a]/80 py-6 md:block">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00ff88]/10">
                <img src="/logos/sportix-logo.png" alt="Sportix" className="h-5 w-5 rounded-md object-cover" />
              </div>
              <span className="text-sm font-semibold text-white/40">
                Sport<span className="text-[#00ff88]/40">ix</span> Live
              </span>
            </div>
            <p className="text-xs text-white/20">© 2025 Sportix Live. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <BottomNav />
    </div>
  )
}

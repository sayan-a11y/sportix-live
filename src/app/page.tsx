'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import Header from '@/components/sportix/Header'
import Sidebar from '@/components/sportix/Sidebar'
import LiveSlider from '@/components/sportix/LiveSlider'
import HeroBanner from '@/components/sportix/HeroBanner'
import CategoryTabs from '@/components/sportix/CategoryTabs'
import VideoPlayer from '@/components/sportix/VideoPlayer'
import AdminPanel from '@/components/sportix/AdminPanel'
import BottomNav from '@/components/sportix/BottomNav'
import { ContentSection, VideoCard, ContinueCard } from '@/components/sportix/VideoCard'
import { Star, Clock, Flame, TrendingUp, Play } from 'lucide-react'

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

function openVideo(video: VideoData, store: typeof useAppStore) {
  store.getState().setSelectedVideo(video as any)
  store.getState().setSelectedStream({
    ...video,
    status: 'offline',
    viewerCount: 0,
    peakViewers: 0,
    homeTeam: '',
    awayTeam: '',
    homeScore: 0,
    awayScore: 0,
    isFeatured: video.isFeatured,
  } as any)
  store.getState().setCurrentView('player')
}

export default function Home() {
  const { currentView } = useAppStore()
  const [streams, setStreams] = useState<StreamData[]>([])
  const [videos, setVideos] = useState<VideoData[]>([])
  const [continueWatching, setContinueWatching] = useState<ContinueData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

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

      const saved = localStorage.getItem('sportix-continue')
      if (saved) {
        setContinueWatching(JSON.parse(saved))
      } else {
        setContinueWatching([
          { id: 'cw1', videoId: 'cw1', title: 'Man City Road to UCL Final', thumbnail: '/thumbnails/ucl-semi.png', duration: 1200, progress: 0.65, watchedAt: new Date().toISOString() },
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
    fetch('/api/admin/seed').catch(() => {})
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [loadData])

  if (currentView === 'player') return <VideoPlayer />
  if (currentView === 'admin') return <AdminPanel />

  const liveStreams = streams.filter(s => s.status === 'live')
  const featuredVideos = videos.filter(v => v.isFeatured)
  const highlightVideos = videos.filter(v => v.category === 'highlights')
  const featuredStream = liveStreams[0]

  const filteredVideos = activeFilter === 'all'
    ? videos
    : videos.filter(v => v.category === activeFilter)

  return (
    <div className="sportix-bg min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88]" />
                <p className="text-xs text-white/25">Loading...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 p-4 lg:p-5">
              {/* Category Tabs — mobile only */}
              <div className="lg:hidden">
                <CategoryTabs onFilter={setActiveFilter} />
              </div>

              {/* Hero Banner — mobile only, show featured live match */}
              {featuredStream && (
                <HeroBanner stream={featuredStream} />
              )}

              {/* Live Now — horizontal slider */}
              <LiveSlider streams={streams} />

              {/* Continue Watching — mobile only (horizontal scroll) */}
              {continueWatching.length > 0 && (
                <section className="fade-in-up lg:hidden">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Clock className="h-4 w-4 text-[#f59e0b]" />
                      <h2 className="text-[15px] font-bold text-white">Continue Watching</h2>
                    </div>
                    <button className="flex items-center gap-1 text-[12px] font-medium text-[#00ff88]">
                      View All
                    </button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
                    {continueWatching.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          const saved = localStorage.getItem('sportix-continue')
                          if (saved) {
                            const arr = JSON.parse(saved)
                            const updated = arr.filter((c: ContinueData) => c.id !== item.id)
                            localStorage.setItem('sportix-continue', JSON.stringify(updated))
                          }
                          setContinueWatching(prev => prev.filter(c => c.id !== item.id))
                        }}
                        className="flex-shrink-0 w-[200px] overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] text-left transition-all active:scale-[0.98] touch-active"
                      >
                        <div className="relative aspect-video overflow-hidden">
                          <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                              backgroundImage: item.thumbnail ? `url(${item.thumbnail})` : undefined,
                              backgroundColor: item.thumbnail ? undefined : 'linear-gradient(135deg, #111827, #1a2235)',
                            }}
                          />
                          <div className="absolute inset-0 bg-black/30" />
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                            <div className="h-full bg-[#00ff88]" style={{ width: `${item.progress * 100}%` }} />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                              <Play className="h-3 w-3 text-white fill-white ml-0.5" />
                            </div>
                          </div>
                          <div className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1 py-0.5 text-[9px] text-white/80">
                            {item.duration - Math.round(item.progress * item.duration)}m left
                          </div>
                        </div>
                        <div className="px-2.5 py-2">
                          <p className="text-[11px] font-medium text-white/80 line-clamp-1">{item.title}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Featured Matches */}
              {featuredVideos.length > 0 && (
                <ContentSection title="Top Picks For You" icon={<Star className="h-4 w-4 text-[#00ff88]" />} viewAll>
                  {featuredVideos.map((video) => (
                    <VideoCard key={video.id} video={video} onSelect={(v) => openVideo(v, useAppStore)} />
                  ))}
                </ContentSection>
              )}

              {/* Highlights */}
              {highlightVideos.length > 0 && (
                <ContentSection title="Highlights" icon={<Flame className="h-4 w-4 text-[#ff3b3b]" />} viewAll>
                  {highlightVideos.map((video) => (
                    <VideoCard key={video.id} video={video} onSelect={(v) => openVideo(v, useAppStore)} />
                  ))}
                </ContentSection>
              )}

              {/* Filtered / All Videos */}
              {filteredVideos.length > 0 && activeFilter !== 'all' && (
                <ContentSection
                  title={`${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}`}
                  icon={<TrendingUp className="h-4 w-4 text-[#06b6d4]" />}
                  viewAll
                >
                  {filteredVideos.map((video) => (
                    <VideoCard key={video.id} video={video} onSelect={(v) => openVideo(v, useAppStore)} />
                  ))}
                </ContentSection>
              )}

              {/* Empty state */}
              {streams.length === 0 && videos.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03]">
                    <TrendingUp className="h-7 w-7 text-white/10" />
                  </div>
                  <h3 className="text-sm font-semibold text-white/50">No content yet</h3>
                  <p className="mt-1 text-xs text-white/25">Check back soon for live matches and highlights</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Footer — desktop only */}
      <footer className="hidden border-t border-white/[0.06] bg-[#080c16]/50 py-4 lg:block">
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#00ff88] to-[#00cc6a]">
              <span className="text-[#02040a] text-[10px] font-black">S</span>
            </div>
            <span className="text-xs font-semibold text-white/30">
              Sport<span className="text-[#00ff88]/30">ix</span> Live
            </span>
          </div>
          <p className="text-[10px] text-white/15">© 2025 Sportix Live. All rights reserved.</p>
        </div>
      </footer>

      <BottomNav />
    </div>
  )
}



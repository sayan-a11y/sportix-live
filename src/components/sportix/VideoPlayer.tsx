'use client'
import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { ArrowLeft, Settings, Maximize, Users, Radio } from 'lucide-react'
import LiveChat from './LiveChat'
import MuxPlayer from '@mux/mux-player-react'
import HlsPlayer from './HlsPlayer'
import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import Reactions from './Reactions'

export default function VideoPlayer() {
  const { selectedStream, setCurrentView, setSelectedStream } = useAppStore()
  const [isMuted, setIsMuted] = useState(false)
  const [viewerCount, setViewerCount] = useState(selectedStream?.viewerCount || 0)
  const [showPreRoll, setShowPreRoll] = useState(true)
  const [videoAdUrl, setVideoAdUrl] = useState<string | null>(null)

  const viewerIdRef = useRef<string>(uuidv4())
  const supabase = createClient()

  useEffect(() => {
    if (!selectedStream) return

    const streamId = selectedStream.id
    const viewerId = viewerIdRef.current

    const joinStream = async () => {
      try {
        await supabase.from('Viewer').insert([
          { id: viewerId, streamId: streamId }
        ])
      } catch (err) {
        console.error('Error joining stream:', err)
      }
    }

    const updateCount = async () => {
      const { count } = await supabase
        .from('Viewer')
        .select('*', { count: 'exact', head: true })
        .eq('streamId', streamId)
      
      if (count !== null) setViewerCount(count)
    }

    joinStream()
    updateCount()

    // Fetch Pre-roll Ad
    const fetchVideoAd = async () => {
      const { data } = await supabase
        .from('Ad')
        .select('url')
        .eq('type', 'video')
        .eq('active', true)
        .or(`sportType.eq.${selectedStream.category},sportType.eq.all`)
        .limit(1)
      
      if (data && data[0]) {
        setVideoAdUrl(data[0].url)
      } else {
        setShowPreRoll(false)
      }
    }

    fetchVideoAd()

    const channel = supabase
      .channel(`viewers-${streamId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'Viewer',
          filter: `streamId=eq.${streamId}`
        },
        () => {
          updateCount()
        }
      )
      .subscribe()

    const leaveStream = async () => {
      await supabase.from('Viewer').delete().eq('id', viewerId)
    }

    window.addEventListener('beforeunload', leaveStream)

    return () => {
      channel.unsubscribe()
      leaveStream()
      window.removeEventListener('beforeunload', leaveStream)
    }
  }, [selectedStream, supabase])

  if (!selectedStream) return null

  const formatViewers = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  const isFreeStream = selectedStream.playbackId?.startsWith('http')

  return (
    <div className="sportix-bg min-h-screen">
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

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-4 md:p-6">
            <div id="video-container" className="relative aspect-video overflow-hidden rounded-2xl border border-white/5 bg-black shadow-2xl">
              {showPreRoll && videoAdUrl ? (
                <div className="absolute inset-0 z-20 bg-black">
                  <video 
                    src={videoAdUrl} 
                    autoPlay 
                    onEnded={() => setShowPreRoll(false)}
                    className="h-full w-full object-contain"
                  />
                  <div className="absolute top-4 right-4 z-30">
                    <button 
                      onClick={() => setShowPreRoll(false)}
                      className="rounded-full bg-black/60 px-4 py-1.5 text-xs font-bold text-white/80 hover:text-white backdrop-blur-md border border-white/10"
                    >
                      Skip Ad
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 rounded-md bg-black/40 px-2 py-1 text-[10px] font-bold text-white/60 uppercase tracking-widest border border-white/5">
                    Ad • Playing
                  </div>
                </div>
              ) : null}

              {selectedStream.playbackId ? (
                isFreeStream ? (
                  <HlsPlayer
                    src={selectedStream.playbackId}
                    muted={isMuted}
                    className="h-full w-full"
                  />
                ) : (
                  <MuxPlayer
                    playbackId={selectedStream.playbackId}
                    metadata={{
                      video_id: selectedStream.id,
                      video_title: selectedStream.title,
                    }}
                    streamType="live"
                    autoPlay
                    muted={isMuted}
                    className="h-full w-full"
                    style={{ aspectRatio: '16/9' }}
                  />
                )
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
              
              <Reactions streamId={selectedStream.id} />

              {/* Targeted Banner Ad */}
              <div className="py-2">
                <AdBanner sportType={selectedStream.category} frequencyControl={true} />
              </div>

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

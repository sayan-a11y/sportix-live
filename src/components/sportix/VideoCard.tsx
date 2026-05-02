'use client'

import { useAppStore } from '@/lib/store'
import { Clock, Play, TrendingUp, Eye } from 'lucide-react'

interface VideoItem {
  id: string
  title: string
  thumbnail?: string
  duration: number
  category: string
  views: number
  isFeatured: boolean
  description?: string
}

interface ContinueItem {
  id: string
  videoId: string
  title: string
  thumbnail?: string
  duration: number
  progress: number
  watchedAt: string
}

const VIDEO_THUMBNAILS: Record<string, string> = {
  '⚽ Champions League Best Goals — Round of 16': '/thumbnails/ucl-goals.png',
  '🏀 NBA Top 10 Plays of the Week': '/thumbnails/nba-plays.png',
  '🏎️ Monaco GP Qualifying Highlights': '/thumbnails/f1-monaco.png',
  '⚽ Premier League Goals of the Month': '/thumbnails/epl-goals.png',
  '🎾 Wimbledon Day 5 Recap': '/thumbnails/wimbledon.png',
  '⚽ El Clásico — Classic Moments': '/thumbnails/el-clasico.png',
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`
  if (views >= 1000) return `${(views / 1000).toFixed(0)}K views`
  return `${views} views`
}

export function VideoCard({ video, onSelect }: { video: VideoItem; onSelect: (v: VideoItem) => void }) {
  const thumbnail = video.thumbnail || VIDEO_THUMBNAILS[video.title]

  return (
    <button
      onClick={() => onSelect(video)}
      className="glass-card glass-card-hover group/card overflow-hidden text-left transition-all duration-200 touch-active w-full"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover/card:scale-105"
          style={{
            backgroundImage: thumbnail ? `url(${thumbnail})` : undefined,
            backgroundColor: thumbnail ? undefined : 'linear-gradient(135deg, #1a2235, #243049)',
          }}
        >
          {!thumbnail && (
            <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">
              {video.category === 'highlights' ? '🎬' : '⚽'}
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover/card:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00ff88]/20 backdrop-blur-sm ring-1 ring-[#00ff88]/30">
            <Play className="h-5 w-5 text-[#00ff88] fill-[#00ff88] ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {formatDuration(video.duration)}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <h3 className="text-sm font-medium text-white/90 line-clamp-2 leading-snug">{video.title}</h3>
        <div className="mt-2 flex items-center gap-3 text-xs text-white/40">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatViews(video.views)}
          </span>
          {video.isFeatured && (
            <span className="flex items-center gap-1 text-[#00ff88]/70">
              <TrendingUp className="h-3 w-3" />
              Featured
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

export function ContinueCard({ item, onSelect }: { item: ContinueItem; onSelect: (item: ContinueItem) => void }) {
  return (
    <button
      onClick={() => onSelect(item)}
      className="glass-card glass-card-hover group/card overflow-hidden text-left transition-all duration-200 touch-active w-full"
    >
      <div className="relative aspect-video overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center brightness-50"
          style={{
            backgroundColor: 'linear-gradient(135deg, #1a2235, #243049)',
          }}
        />
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-[#00ff88] rounded-r-full transition-all"
            style={{ width: `${item.progress * 100}%` }}
          />
        </div>
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/10 transition-all group-hover/card:bg-[#00ff88]/20 group-hover/card:ring-[#00ff88]/30">
            <Play className="h-4 w-4 text-white fill-white ml-0.5" />
          </div>
        </div>
        {/* Duration */}
        <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {formatDuration(item.duration)}
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-white/90 line-clamp-1">{item.title}</h3>
        <span className="mt-1 flex items-center gap-1 text-xs text-white/40">
          <Clock className="h-3 w-3" />
          {Math.round(item.progress * 100)}% watched
        </span>
      </div>
    </button>
  )
}

export function ContentSection({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="fade-in-up">
      <div className="mb-4 flex items-center gap-3 px-4 md:px-6">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
      </div>
      <div className="px-4 md:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {children}
        </div>
      </div>
    </section>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import {
  ArrowLeft, Lock, Radio, Square, Settings, BarChart3,
  MessageSquare, Video, Users, Eye, Clock, TrendingUp,
  Copy, Check, RefreshCw, Shield, Trash2, Star, Play, Upload,
  Activity, Wifi, Zap
} from 'lucide-react'
import LiveChat from './LiveChat'

type AdminTab = 'dashboard' | 'streams' | 'analytics' | 'chat' | 'videos'

interface StreamData {
  id: string
  title: string
  description?: string
  thumbnail?: string
  category: string
  status: string
  viewerCount: number
  peakViewers: number
  fps?: number | null
  bitrate?: number | null
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  matchTime?: string
  rtmpUrl?: string | null
  streamKey?: string | null
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
  createdAt: string
}

export default function AdminPanel() {
  const { setCurrentView, isAdminUnlocked, setAdminUnlocked } = useAppStore()
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [streams, setStreams] = useState<StreamData[]>([])
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedKey, setCopiedKey] = useState(false)
  const [analyticsHistory, setAnalyticsHistory] = useState<number[]>([])
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null)
  const [streamSettings, setStreamSettings] = useState({
    title: '',
    description: '',
    category: 'football',
    homeTeam: '',
    awayTeam: '',
    rtmpUrl: 'rtmp://live.sportix.io/live',
    streamKey: '',
    privacy: 'public',
  })

  useEffect(() => {
    loadData()
    // Simulate analytics data
    const history = Array.from({ length: 24 }, () => Math.floor(Math.random() * 50000) + 10000)
    setAnalyticsHistory(history)

    // Refresh data periodically
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [streamsRes, videosRes] = await Promise.all([
        fetch('/api/streams'),
        fetch('/api/videos'),
      ])
      const streamsData = await streamsRes.json()
      const videosData = await videosRes.json()
      setStreams(streamsData)
      setVideos(videosData)
      if (streamsData.length > 0 && !activeStreamId) {
        setActiveStreamId(streamsData[0].id)
      }
    } catch (e) {
      console.error('Failed to load data:', e)
    } finally {
      setLoading(false)
    }
  }

  const toggleStreamStatus = async (streamId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'live' ? 'ended' : 'live'
    try {
      await fetch('/api/streams', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: streamId, status: newStatus }),
      })
      loadData()
    } catch (e) {
      console.error('Failed to toggle stream:', e)
    }
  }

  const copyStreamKey = () => {
    navigator.clipboard.writeText(streamSettings.streamKey || 'sk-sportix-' + Math.random().toString(36).substr(2, 12))
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const totalViewers = streams.filter(s => s.status === 'live').reduce((sum, s) => sum + s.viewerCount, 0)
  const peakViewers = streams.reduce((max, s) => Math.max(max, s.peakViewers), 0)
  const liveCount = streams.filter(s => s.status === 'live').length
  const totalVideos = videos.length
  const totalVideoViews = videos.reduce((sum, v) => sum + v.views, 0)

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toString()
  }

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const activeStream = streams.find(s => s.id === activeStreamId)

  if (!isAdminUnlocked) return null

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'streams', label: 'Streams', icon: <Radio className="h-4 w-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <Activity className="h-4 w-4" /> },
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="h-4 w-4" /> },
  ]

  return (
    <div className="sportix-bg min-h-screen">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#02040a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setCurrentView('home'); setAdminUnlocked(false) }}
              className="flex items-center gap-2 rounded-lg p-2 text-white/50 transition-all hover:bg-white/5 hover:text-white touch-active"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden text-sm sm:inline">Exit Admin</span>
            </button>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#00ff88]" />
              <span className="text-sm font-semibold text-white">Admin Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-[#00ff88]/10 px-3 py-1 text-xs font-medium text-[#00ff88] ring-1 ring-[#00ff88]/20 sm:flex">
              <Shield className="mr-1 h-3 w-3" />
              Admin
            </span>
            <button
              onClick={loadData}
              className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar Tabs */}
          <aside className="w-full border-b border-white/5 bg-[#02040a]/50 lg:w-56 lg:border-b-0 lg:border-r">
            <nav className="flex lg:flex-col p-2 gap-1 overflow-x-auto no-scrollbar lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:pt-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-[#00ff88]/10 text-[#00ff88] ring-1 ring-[#00ff88]/20'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88]" />
              </div>
            ) : (
              <>
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6 fade-in-up">
                    <h2 className="text-2xl font-bold text-white">Dashboard</h2>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {[
                        { label: 'Live Now', value: liveCount, icon: <Radio className="h-5 w-5 text-[#ff3b3b]" />, color: 'text-[#ff3b3b]' },
                        { label: 'Total Viewers', value: formatNumber(totalViewers), icon: <Users className="h-5 w-5 text-[#00ff88]" />, color: 'text-[#00ff88]' },
                        { label: 'Peak Viewers', value: formatNumber(peakViewers), icon: <Eye className="h-5 w-5 text-[#06b6d4]" />, color: 'text-[#06b6d4]' },
                        { label: 'Total Videos', value: totalVideos, icon: <Video className="h-5 w-5 text-[#f59e0b]" />, color: 'text-[#f59e0b]' },
                      ].map((stat) => (
                        <div key={stat.label} className="glass-card p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-white/40">{stat.label}</span>
                            {stat.icon}
                          </div>
                          <p className={`mt-2 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {[
                        { label: 'Total Video Views', value: formatNumber(totalVideoViews), icon: <Eye className="h-4 w-4" /> },
                        { label: 'Avg Watch Time', value: '24m', icon: <Clock className="h-4 w-4" /> },
                        { label: 'Growth', value: '+12.5%', icon: <TrendingUp className="h-4 w-4" /> },
                        { label: 'Uptime', value: '99.9%', icon: <Wifi className="h-4 w-4" /> },
                      ].map((stat) => (
                        <div key={stat.label} className="glass-card p-3">
                          <div className="flex items-center gap-2 text-white/40">
                            {stat.icon}
                            <span className="text-xs">{stat.label}</span>
                          </div>
                          <p className="mt-1 text-lg font-semibold text-white">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Active Streams */}
                    <div>
                      <h3 className="mb-3 text-lg font-semibold text-white">Active Streams</h3>
                      <div className="space-y-2">
                        {streams.filter(s => s.status === 'live').map((stream) => (
                          <div key={stream.id} className="glass-card glass-card-hover flex items-center justify-between p-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff3b3b] opacity-75" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#ff3b3b]" />
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white">{stream.title}</p>
                                <p className="text-xs text-white/40">{stream.homeTeam} {stream.homeScore} — {stream.awayScore} {stream.awayTeam}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-white/40">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {formatNumber(stream.viewerCount)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                {stream.fps || 60}fps
                              </span>
                            </div>
                          </div>
                        ))}
                        {streams.filter(s => s.status === 'live').length === 0 && (
                          <div className="glass-card p-8 text-center text-white/30">
                            <Radio className="mx-auto h-8 w-8 mb-2" />
                            <p className="text-sm">No active streams</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Streams Tab */}
                {activeTab === 'streams' && (
                  <div className="space-y-6 fade-in-up">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-white">Stream Control</h2>
                    </div>

                    {/* Stream List */}
                    <div className="space-y-3">
                      {streams.map((stream) => (
                        <div key={stream.id} className={`glass-card overflow-hidden transition-all ${stream.id === activeStreamId ? 'ring-1 ring-[#00ff88]/30' : ''}`}>
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                onClick={() => setActiveStreamId(stream.id)}
                                className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                                  stream.status === 'live'
                                    ? 'bg-[#ff3b3b]/10 text-[#ff3b3b]'
                                    : 'bg-white/5 text-white/30'
                                }`}
                              >
                                <Radio className="h-5 w-5" />
                              </button>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white">{stream.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={`text-xs font-medium ${stream.status === 'live' ? 'text-[#ff3b3b]' : stream.status === 'ended' ? 'text-white/30' : 'text-white/50'}`}>
                                    {stream.status.toUpperCase()}
                                  </span>
                                  {stream.status === 'live' && (
                                    <span className="text-xs text-white/30">• {formatNumber(stream.viewerCount)} viewers</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {stream.status === 'live' ? (
                                <button
                                  onClick={() => toggleStreamStatus(stream.id, stream.status)}
                                  className="flex items-center gap-1.5 rounded-lg bg-[#ff3b3b]/10 px-3 py-2 text-xs font-medium text-[#ff3b3b] ring-1 ring-[#ff3b3b]/20 transition-all hover:bg-[#ff3b3b]/20"
                                >
                                  <Square className="h-3 w-3" />
                                  End
                                </button>
                              ) : (
                                <button
                                  onClick={() => toggleStreamStatus(stream.id, stream.status)}
                                  className="flex items-center gap-1.5 rounded-lg bg-[#00ff88]/10 px-3 py-2 text-xs font-medium text-[#00ff88] ring-1 ring-[#00ff88]/20 transition-all hover:bg-[#00ff88]/20"
                                >
                                  <Play className="h-3 w-3" />
                                  Go Live
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expanded Stream Settings */}
                          {stream.id === activeStreamId && (
                            <div className="border-t border-white/5 p-4 space-y-4">
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                  <label className="mb-1.5 block text-xs font-medium text-white/40">Stream Title</label>
                                  <input
                                    type="text"
                                    defaultValue={stream.title}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#00ff88]/30 focus:outline-none focus:ring-1 focus:ring-[#00ff88]/20"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1.5 block text-xs font-medium text-white/40">Category</label>
                                  <select
                                    defaultValue={stream.category}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#00ff88]/30 focus:outline-none"
                                  >
                                    <option value="football">⚽ Football</option>
                                    <option value="basketball">🏀 Basketball</option>
                                    <option value="racing">🏎️ Racing</option>
                                    <option value="tennis">🎾 Tennis</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="mb-1.5 block text-xs font-medium text-white/40">Description</label>
                                <textarea
                                  defaultValue={stream.description || ''}
                                  rows={2}
                                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#00ff88]/30 focus:outline-none focus:ring-1 focus:ring-[#00ff88]/20 resize-none"
                                />
                              </div>

                              {/* RTMP Settings */}
                              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Settings className="h-4 w-4 text-white/40" />
                                  <span className="text-sm font-medium text-white">RTMP Settings</span>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <label className="mb-1.5 block text-xs font-medium text-white/40">RTMP URL</label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        readOnly
                                        value="rtmp://live.sportix.io/live"
                                        className="flex-1 rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-xs text-white/60 font-mono"
                                      />
                                      <button onClick={() => { navigator.clipboard.writeText('rtmp://live.sportix.io/live') }} className="rounded-lg p-2 text-white/30 hover:text-white hover:bg-white/5 transition-colors">
                                        <Copy className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="mb-1.5 block text-xs font-medium text-white/40">Stream Key</label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="password"
                                        readOnly
                                        value={`sk-${stream.id.slice(0, 8)}`}
                                        className="flex-1 rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-xs text-white/60 font-mono"
                                      />
                                      <button onClick={copyStreamKey} className="rounded-lg p-2 text-white/30 hover:text-white hover:bg-white/5 transition-colors">
                                        {copiedKey ? <Check className="h-4 w-4 text-[#00ff88]" /> : <Copy className="h-4 w-4" />}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Stream Health */}
                              {stream.status === 'live' && (
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                  {[
                                    { label: 'FPS', value: stream.fps ? `${stream.fps}` : '60' },
                                    { label: 'Bitrate', value: stream.bitrate ? `${stream.bitrate} kbps` : '4500 kbps' },
                                    { label: 'Viewers', value: formatNumber(stream.viewerCount) },
                                    { label: 'Peak', value: formatNumber(stream.peakViewers) },
                                  ].map((item) => (
                                    <div key={item.label} className="rounded-xl bg-white/[0.03] p-3">
                                      <span className="text-[10px] font-medium text-white/30">{item.label}</span>
                                      <p className="mt-1 text-lg font-bold text-white">{item.value}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                  <div className="space-y-6 fade-in-up">
                    <h2 className="text-2xl font-bold text-white">Real-Time Analytics</h2>

                    {/* Mini Chart (CSS-based) */}
                    <div className="glass-card p-4 md:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-semibold text-white">Viewer Activity (24h)</h3>
                          <p className="text-xs text-white/40">Live viewer count over time</p>
                        </div>
                        <span className="flex items-center gap-1.5 text-[#00ff88] text-sm font-semibold">
                          <TrendingUp className="h-4 w-4" />
                          +{Math.floor(Math.random() * 20 + 5)}%
                        </span>
                      </div>
                      <div className="flex items-end gap-1 h-40">
                        {analyticsHistory.map((value, i) => {
                          const max = Math.max(...analyticsHistory)
                          const height = (value / max) * 100
                          return (
                            <div
                              key={i}
                              className="flex-1 rounded-t-sm bg-[#00ff88]/20 transition-all hover:bg-[#00ff88]/40 cursor-pointer relative group/bar"
                              style={{ height: `${height}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover/bar:block rounded-md bg-[#0b0f1a] px-2 py-1 text-[10px] text-white whitespace-nowrap ring-1 ring-white/10">
                                {formatNumber(value)}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex justify-between mt-2 text-[10px] text-white/20">
                        <span>24h ago</span>
                        <span>Now</span>
                      </div>
                    </div>

                    {/* Stream Analytics */}
                    <div>
                      <h3 className="mb-3 text-lg font-semibold text-white">Per-Stream Analytics</h3>
                      <div className="space-y-2">
                        {streams.map((stream) => (
                          <div key={stream.id} className="glass-card p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`h-2 w-2 rounded-full flex-shrink-0 ${stream.status === 'live' ? 'bg-[#ff3b3b]' : 'bg-white/20'}`} />
                                <span className="truncate text-sm font-medium text-white">{stream.title}</span>
                              </div>
                              <span className="text-xs text-white/30 capitalize">{stream.status}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="text-center">
                                <p className="text-lg font-bold text-[#00ff88]">{formatNumber(stream.viewerCount)}</p>
                                <p className="text-[10px] text-white/30">Current</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-[#06b6d4]">{formatNumber(stream.peakViewers)}</p>
                                <p className="text-[10px] text-white/30">Peak</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-[#f59e0b]">{stream.matchTime || '—'}</p>
                                <p className="text-[10px] text-white/30">Match Time</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                  <div className="space-y-6 fade-in-up">
                    <h2 className="text-2xl font-bold text-white">Chat Moderation</h2>

                    {/* Stream selector for chat */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {streams.filter(s => s.status === 'live').map((stream) => (
                        <button
                          key={stream.id}
                          onClick={() => setActiveStreamId(stream.id)}
                          className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                            activeStreamId === stream.id
                              ? 'bg-[#00ff88]/10 text-[#00ff88] ring-1 ring-[#00ff88]/20'
                              : 'bg-white/5 text-white/50 hover:bg-white/8'
                          }`}
                        >
                          {stream.homeTeam} vs {stream.awayTeam}
                        </button>
                      ))}
                    </div>

                    {/* Chat Admin Tools */}
                    <div className="glass-card p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="h-4 w-4 text-[#00ff88]" />
                        <span className="text-sm font-medium text-white">Moderation Tools</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        {[
                          { label: 'Clear Chat', icon: <Trash2 className="h-3.5 w-3.5" />, color: 'text-[#ff3b3b] hover:bg-[#ff3b3b]/10' },
                          { label: 'Slow Mode', icon: <Clock className="h-3.5 w-3.5" />, color: 'text-[#f59e0b] hover:bg-[#f59e0b]/10' },
                          { label: 'Sub Only', icon: <Star className="h-3.5 w-3.5" />, color: 'text-[#00ff88] hover:bg-[#00ff88]/10' },
                          { label: 'Highlight All', icon: <Zap className="h-3.5 w-3.5" />, color: 'text-[#06b6d4] hover:bg-[#06b6d4]/10' },
                        ].map((tool) => (
                          <button
                            key={tool.label}
                            className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-white/50 transition-all ${tool.color}`}
                          >
                            {tool.icon}
                            {tool.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Chat with Admin */}
                    {activeStreamId && (
                      <div className="h-[500px]">
                        <LiveChat streamId={activeStreamId} isAdmin={true} />
                      </div>
                    )}
                  </div>
                )}

                {/* Videos Tab */}
                {activeTab === 'videos' && (
                  <div className="space-y-6 fade-in-up">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-white">Video Management</h2>
                      <button className="flex items-center gap-2 rounded-xl bg-[#00ff88]/10 px-4 py-2 text-sm font-medium text-[#00ff88] ring-1 ring-[#00ff88]/20 transition-all hover:bg-[#00ff88]/20">
                        <Upload className="h-4 w-4" />
                        Upload Video
                      </button>
                    </div>

                    <div className="space-y-2">
                      {videos.map((video) => (
                        <div key={video.id} className="glass-card glass-card-hover flex items-center gap-4 p-3">
                          <div className="h-16 w-28 flex-shrink-0 rounded-lg bg-gradient-to-br from-[#1a2235] to-[#243049] flex items-center justify-center text-2xl opacity-40">
                            🎬
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-white">{video.title}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                              <span>{formatDuration(video.duration)}</span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {formatNumber(video.views)}
                              </span>
                              <span className="rounded-full bg-white/5 px-2 py-0.5 capitalize">{video.category}</span>
                              {video.isFeatured && (
                                <span className="text-[#00ff88]/70">★ Featured</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button className="rounded-lg p-2 text-white/30 hover:text-[#00ff88] hover:bg-[#00ff88]/5 transition-all" title="Edit">
                              <Settings className="h-4 w-4" />
                            </button>
                            <button className="rounded-lg p-2 text-white/30 hover:text-[#ff3b3b] hover:bg-[#ff3b3b]/5 transition-all" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Auto Record Info */}
                    <div className="glass-card p-4 border-[#00ff88]/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-[#00ff88]" />
                        <span className="text-sm font-medium text-white">Auto Record System</span>
                      </div>
                      <p className="text-xs text-white/40 leading-relaxed">
                        When you end a live stream, the recording is automatically saved and added to the Highlights section.
                        Videos are processed and available within minutes after stream ends.
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-[#00ff88]/70">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00ff88]" />
                        Auto-record is active
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

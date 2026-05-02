'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { useAppStore } from '@/lib/store'
import {
  LayoutDashboard,
  Radio,
  Tv,
  CalendarClock,
  KeyRound,
  Video,
  Film,
  FolderOpen,
  Users,
  ShieldCheck,
  BarChart3,
  DollarSign,
  Settings,
  ClipboardList,
  MessageSquare,
  Menu,
  X,
  Bell,
  Clock,
  LogOut,
  Wifi,
  Zap,
  Eye,
  TrendingUp,
  Activity,
  ChevronRight,
  Loader2,
  ArrowRightLeft,
  Pause,
  Square,
  Save,
  Search,
  Upload,
  Edit3,
  Trash2,
  Copy,
  Check,
  Star,
  Signal,
  Monitor,
  Volume2,
  Globe,
  Lock,
  RotateCcw,
  Timer,
  UserPlus,
  ShieldBan,
  ArrowUpRight,
  AlertTriangle,
  Ban,
  ChevronDown,
  Gauge,
  Play,
  Crown,
} from 'lucide-react'
import LiveChat from './LiveChat'

/* ────────────────────────── Types ────────────────────────── */

type AdminPage =
  | 'dashboard'
  | 'live-control'
  | 'live-events'
  | 'scheduled-live'
  | 'stream-key'
  | 'videos'
  | 'highlights'
  | 'categories'
  | 'users'
  | 'roles'
  | 'analytics'
  | 'revenue'
  | 'settings'
  | 'activity-logs'
  | 'chat'

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
  rtmpUrl?: string | null
  streamKey?: string | null
  isFeatured?: boolean
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

interface MenuItem {
  id: AdminPage
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

interface MenuSection {
  label: string | null
  items: MenuItem[]
}

/* ────────────────────────── Menu Config ────────────────────────── */

const menuSections: MenuSection[] = [
  {
    label: null,
    items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'LIVE STREAMING',
    items: [
      { id: 'live-control', label: 'Live Control', icon: Radio, badge: 'LIVE' },
      { id: 'live-events', label: 'Live Events', icon: Tv },
      { id: 'scheduled-live', label: 'Scheduled Live', icon: CalendarClock },
      { id: 'stream-key', label: 'Stream Key', icon: KeyRound },
      { id: 'chat', label: 'Chat Moderation', icon: MessageSquare },
    ],
  },
  {
    label: 'CONTENT MANAGEMENT',
    items: [
      { id: 'videos', label: 'Videos', icon: Video },
      { id: 'highlights', label: 'Highlights', icon: Film },
      { id: 'categories', label: 'Categories', icon: FolderOpen },
    ],
  },
  {
    label: 'USER MANAGEMENT',
    items: [
      { id: 'users', label: 'Users', icon: Users },
      { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
    ],
  },
  {
    label: 'ANALYTICS & REPORTS',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'revenue', label: 'Revenue', icon: DollarSign },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'activity-logs', label: 'Activity Logs', icon: ClipboardList },
    ],
  },
]

/* ────────────────────────── Helpers ────────────────────────── */

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

function getPageTitle(page: AdminPage): string {
  const map: Record<AdminPage, string> = {
    dashboard: 'Dashboard',
    'live-control': 'Live Control',
    'live-events': 'Live Events',
    'scheduled-live': 'Scheduled Live',
    'stream-key': 'Stream Key Management',
    videos: 'Video Management',
    highlights: 'Highlights',
    categories: 'Categories',
    users: 'User Management',
    roles: 'Roles & Permissions',
    analytics: 'Analytics & Reports',
    revenue: 'Revenue',
    settings: 'System Settings',
    'activity-logs': 'Activity Logs',
    chat: 'Chat Moderation',
  }
  return map[page]
}

const inputCls =
  'w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-[#10b981]/30 focus:outline-none focus:ring-1 focus:ring-[#10b981]/20'

/* ────────────────────────── Loading Spinner ────────────────────────── */

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
        <span className="text-sm text-white/40">Loading data...</span>
      </div>
    </div>
  )
}

/* ────────────────────────── Page Header Component ────────────────────────── */

function PageHeader({
  title,
  description,
  icon,
  accent = '#10b981',
  children,
}: {
  title: string
  description?: string
  icon: ReactNode
  accent?: string
  children?: ReactNode
}) {
  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `${accent}15`, color: accent }}
          >
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {description && <p className="text-sm text-white/40 mt-0.5">{description}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ────────────────────────── Toggle Switch ────────────────────────── */

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-[#10b981]' : 'bg-white/10'}`}
      aria-label={label}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  )
}

/* ────────────────────────── Copy Button ────────────────────────── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className="flex items-center justify-center h-9 w-9 rounded-lg border border-white/10 bg-white/[0.03] text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all"
      title="Copy"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-[#10b981]" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ║                      1. DASHBOARD PAGE                         ║
   ═══════════════════════════════════════════════════════════════════ */

function DashboardPage({
  streams,
  videos,
  loading,
}: {
  streams: StreamData[]
  videos: VideoData[]
  loading: boolean
}) {
  const [activityLog, setActivityLog] = useState<Array<{ message: string; time: string; type: string; color: string }>>([])
  const [viewerHistory] = useState(() =>
    Array.from({ length: 24 }, () => Math.floor(Math.random() * 45000) + 8000)
  )

  const liveStreams = streams.filter((s) => s.status === 'live')
  const totalViewers = liveStreams.reduce((sum, s) => sum + s.viewerCount, 0)
  const peakViewers = streams.reduce((max, s) => Math.max(max, s.peakViewers), 0)
  const primaryStream = liveStreams[0] ?? streams[0] ?? null

  useEffect(() => {
    fetch('/api/admin/activity')
      .then((r) => r.json())
      .then((data) => {
        const logs = Array.isArray(data?.logs) ? data.logs : Array.isArray(data) ? data : []
        setActivityLog(
          logs.slice(0, 8).map((l: Record<string, string>) => ({
            message: l.message || l.action || l.description || 'Activity event',
            time: l.time || l.timestamp || l.createdAt || 'Recently',
            type: l.type || l.category || 'system',
            color:
              l.type === 'stream' ? '#ef4444' : l.type === 'user' ? '#10b981' : l.type === 'chat' ? '#f59e0b' : '#06b6d4',
          }))
        )
      })
      .catch(() => {
        setActivityLog([
          { message: 'Platform is running smoothly', time: 'Just now', type: 'system', color: '#06b6d4' },
          { message: 'All systems operational', time: '5 min ago', type: 'system', color: '#10b981' },
        ])
      })
  }, [])

  const statsCards = [
    { label: 'Live Now', value: String(liveStreams.length), icon: <Radio className="h-5 w-5" />, color: '#ef4444' },
    { label: 'Total Viewers', value: formatNumber(totalViewers), icon: <Eye className="h-5 w-5" />, color: '#10b981' },
    { label: 'Peak Viewers', value: formatNumber(peakViewers), icon: <TrendingUp className="h-5 w-5" />, color: '#06b6d4' },
    { label: 'Total Videos', value: String(videos.length), icon: <Video className="h-5 w-5" />, color: '#f59e0b' },
    { label: 'Total Video Views', value: formatNumber(videos.reduce((s, v) => s + v.views, 0)), icon: <Eye className="h-5 w-5" />, color: '#8b5cf6' },
    { label: 'Avg Watch Time', value: '24m', icon: <Clock className="h-5 w-5" />, color: '#06b6d4' },
    { label: 'Growth', value: '+12.5%', icon: <ArrowUpRight className="h-5 w-5" />, color: '#10b981' },
    { label: 'Uptime', value: '99.9%', icon: <Activity className="h-5 w-5" />, color: '#10b981' },
  ]

  if (loading) return <LoadingSpinner />

  const maxChart = Math.max(...viewerHistory)

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981]">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-sm text-white/40">Overview of your streaming platform</p>
        </div>
      </div>

      {/* Stats Grid - 8 cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white/40">{stat.label}</span>
              <div style={{ color: stat.color }}>{stat.icon}</div>
            </div>
            <p className="mt-2 text-xl md:text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Live Control Center */}
      {primaryStream && (
        <div className="glass-card p-4 md:p-6">
          <div className="mb-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
              <span className="hover:text-white/60 cursor-pointer">Dashboard</span>
              <ChevronRight className="h-3 w-3" />
              <span className="hover:text-white/60 cursor-pointer">Live Control</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white/70 font-medium">{primaryStream.homeTeam} vs {primaryStream.awayTeam}</span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/10 px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all">
                <Pause className="h-4 w-4" /> Pause Stream
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 px-4 py-2 text-sm font-medium text-[#ef4444] hover:bg-[#ef4444]/20 transition-all">
                <Square className="h-4 w-4" /> End Stream
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 px-4 py-2 text-sm font-medium text-[#10b981] hover:bg-[#10b981]/20 transition-all">
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </div>
          </div>

          {/* Live Stream Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Live Duration', value: '00:45:21', badge: 'LIVE', badgeColor: '#ef4444', icon: <Timer className="h-4 w-4 text-[#ef4444]" /> },
              { label: 'Live Viewers', value: formatNumber(primaryStream.viewerCount), icon: <Eye className="h-4 w-4 text-[#10b981]" /> },
              { label: 'Stream Quality', value: '1080p', badge: 'HD', badgeColor: '#f59e0b', icon: <Monitor className="h-4 w-4 text-[#f59e0b]" /> },
              { label: 'Stream Health', value: 'Excellent', icon: <Check className="h-4 w-4 text-[#10b981]" /> },
              { label: 'Bitrate', value: '12.4 Mbps', icon: <Signal className="h-4 w-4 text-[#06b6d4]" /> },
            ].map((m) => (
              <div key={m.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-center gap-2 mb-1">
                  {m.icon}
                  <span className="text-[10px] font-medium text-white/30 uppercase">{m.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{m.value}</span>
                  {m.badge && (
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase"
                      style={{ background: `${m.badgeColor}15`, color: m.badgeColor }}
                    >
                      {m.badge}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Preview + Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Live Preview */}
            <div className="lg:col-span-3">
              <div
                className="relative flex aspect-video items-center justify-center rounded-xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #0d1117 0%, #1a1f35 30%, #0d1117 50%, #1a1f35 70%, #0d1117 100%)',
                }}
              >
                {/* Score overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ef4444] opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ef4444]" />
                    </span>
                    <span className="rounded-md bg-[#ef4444] px-2 py-0.5 text-[10px] font-bold uppercase text-white tracking-wider">
                      LIVE
                    </span>
                  </div>
                  <p className="text-lg md:text-2xl font-black text-white tracking-wider">
                    {primaryStream.homeTeam} <span className="text-[#10b981]">{primaryStream.homeScore}</span> -{' '}
                    <span className="text-[#10b981]">{primaryStream.awayScore}</span> {primaryStream.awayTeam}
                  </p>
                  <p className="mt-1 text-xs font-medium text-white/50 uppercase tracking-widest">
                    {primaryStream.matchTime || '1ST HALF'}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-white/40">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatNumber(primaryStream.viewerCount)}</span>
                    <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium">1080p</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stream Settings + Health */}
            <div className="lg:col-span-2 space-y-4">
              {/* Stream Settings */}
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Stream Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-medium text-white/30">Stream Title</label>
                    <input type="text" defaultValue={primaryStream.title} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-medium text-white/30">Description</label>
                    <textarea rows={2} defaultValue={primaryStream.description || ''} className={inputCls + ' resize-none'} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-white/30">Category</label>
                      <select defaultValue={primaryStream.category} className={inputCls}>
                        <option value="football">Football</option>
                        <option value="basketball">Basketball</option>
                        <option value="tennis">Tennis</option>
                        <option value="cricket">Cricket</option>
                        <option value="racing">Racing</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-white/30">League</label>
                      <select defaultValue="ucl" className={inputCls}>
                        <option value="ucl">UCL</option>
                        <option value="epl">EPL</option>
                        <option value="laliga">La Liga</option>
                        <option value="nba">NBA</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-white/30">Privacy</label>
                      <select defaultValue="public" className={inputCls}>
                        <option value="public">Public</option>
                        <option value="unlisted">Unlisted</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-white/30">Latency</label>
                      <select defaultValue="normal" className={inputCls}>
                        <option value="ultra-low">Ultra Low</option>
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stream Health */}
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Stream Health</h4>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
                  <span className="text-sm font-semibold text-[#10b981]">Excellent</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Video Connection', value: 'Excellent', ok: true },
                    { label: 'Audio Connection', value: 'Excellent', ok: true },
                    { label: 'Stream Latency', value: '2.3s', ok: true },
                    { label: 'Dropped Frames', value: '0 (0%)', ok: true },
                    { label: 'Bitrate', value: '12.4 Mbps', ok: null },
                    { label: 'FPS', value: '60 fps', ok: null },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <span className="text-white/40">{item.label}</span>
                      <span className={`flex items-center gap-1 ${item.ok === true ? 'text-[#10b981]' : 'text-white/60'}`}>
                        {item.ok === true && <Check className="h-3 w-3" />}
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mini Viewer Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mini Chart */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Viewer Activity (24h)</h3>
            <span className="flex items-center gap-1 text-xs font-semibold text-[#10b981]">
              <TrendingUp className="h-3.5 w-3.5" /> +12.5%
            </span>
          </div>
          <div className="flex h-32 items-end gap-[3px]">
            {viewerHistory.map((value, i) => {
              const height = (value / maxChart) * 100
              return (
                <div
                  key={i}
                  className="group/bar relative flex-1 cursor-pointer rounded-t-sm bg-[#10b981]/20 transition-all hover:bg-[#10b981]/40"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden rounded-md bg-[#0b0f1a] px-2 py-1 text-[10px] whitespace-nowrap text-white ring-1 ring-white/10 group-hover/bar:block">
                    {formatNumber(value)}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-white/20">
            <span>24h ago</span>
            <span>Now</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Recent Activity</h3>
          <div className="space-y-0 max-h-[200px] overflow-y-auto no-scrollbar">
            {activityLog.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-white/20">
                <Activity className="mb-2 h-6 w-6" />
                <p className="text-xs">Loading activity...</p>
              </div>
            ) : (
              activityLog.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-2 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors"
                >
                  <div
                    className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ background: `${entry.color}15`, color: entry.color }}
                  >
                    <div className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white/70 leading-relaxed">{entry.message}</p>
                    <p className="text-[10px] text-white/25 mt-0.5">{entry.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ║                    2. LIVE CONTROL PAGE                        ║
   ═══════════════════════════════════════════════════════════════════ */

function LiveControlPage({ streams, loading }: { streams: StreamData[]; loading: boolean }) {
  const liveStreams = streams.filter((s) => s.status === 'live')
  const [activeStreamIdx, setActiveStreamIdx] = useState(0)
  const [subTab, setSubTab] = useState<'config' | 'encoder' | 'overlay' | 'monetization'>('config')
  const [encoderSource, setEncoderSource] = useState<'RTMP' | 'WebRTC' | 'SRT'>('RTMP')

  const activeStream = liveStreams[activeStreamIdx] ?? streams[0]

  if (loading) return <LoadingSpinner />

  const bitrateSparkline = Array.from({ length: 20 }, () => Math.floor(Math.random() * 2000) + 10000)
  const fpsSparkline = Array.from({ length: 20 }, () => 59 + Math.random() * 2)

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ef4444]/10 text-[#ef4444]">
          <Radio className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Live Control</h2>
          <p className="text-sm text-white/40">Monitor and manage your live streams</p>
        </div>
      </div>

      {/* Stream selector tabs */}
      {liveStreams.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {liveStreams.map((stream, idx) => (
            <button
              key={stream.id}
              onClick={() => setActiveStreamIdx(idx)}
              className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeStreamIdx === idx
                  ? 'bg-[#ef4444]/10 text-[#ef4444] ring-1 ring-[#ef4444]/20'
                  : 'bg-white/5 text-white/50 hover:bg-white/[0.08]'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ef4444] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ef4444]" />
                </span>
                {stream.homeTeam} vs {stream.awayTeam}
              </span>
            </button>
          ))}
        </div>
      )}

      {activeStream ? (
        <>
          {/* Stream Status Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { label: 'Live Duration', value: '00:45:21', icon: <Timer className="h-4 w-4 text-[#ef4444]" /> },
              { label: 'Live Viewers', value: formatNumber(activeStream.viewerCount), icon: <Eye className="h-4 w-4 text-[#10b981]" /> },
              { label: 'Stream Quality', value: '1080p', icon: <Monitor className="h-4 w-4 text-[#f59e0b]" /> },
              { label: 'Stream Health', value: 'Excellent', icon: <Check className="h-4 w-4 text-[#10b981]" /> },
              { label: 'Bitrate', value: '12.4 Mbps', icon: <Signal className="h-4 w-4 text-[#06b6d4]" /> },
            ].map((m) => (
              <div key={m.label} className="glass-card p-3">
                <div className="flex items-center gap-2 mb-1">
                  {m.icon}
                  <span className="text-[10px] font-medium text-white/30">{m.label}</span>
                </div>
                <span className="text-lg font-bold text-white">{m.value}</span>
              </div>
            ))}
          </div>

          {/* Preview + Config */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Full Video Preview */}
            <div className="glass-card p-4">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Live Preview</h3>
              <div
                className="relative flex aspect-video items-center justify-center rounded-xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #0d1117 0%, #1a1f35 30%, #0d1117 50%, #1a1f35 70%, #0d1117 100%)',
                }}
              >
                <div className="absolute top-3 left-3 z-10">
                  <span className="flex items-center gap-1.5 rounded-md bg-[#ef4444] px-2 py-1 text-[10px] font-bold uppercase text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="absolute top-3 right-3 z-10 flex items-center gap-2 text-[10px] text-white/50">
                  <span className="rounded-md bg-black/40 backdrop-blur-sm px-2 py-1">{formatNumber(activeStream.viewerCount)} watching</span>
                  <span className="rounded-md bg-black/40 backdrop-blur-sm px-2 py-1">1080p</span>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <p className="text-xl md:text-3xl font-black text-white tracking-wider">
                    {activeStream.homeTeam} <span className="text-[#10b981]">{activeStream.homeScore}</span> -{' '}
                    <span className="text-[#10b981]">{activeStream.awayScore}</span> {activeStream.awayTeam}
                  </p>
                  <p className="mt-1 text-xs text-white/50 uppercase tracking-widest">
                    {activeStream.matchTime || '1ST HALF'}
                  </p>
                </div>
              </div>
            </div>

            {/* Config Panel */}
            <div className="glass-card p-4">
              {/* Sub tabs */}
              <div className="flex gap-1 mb-4 rounded-xl bg-white/[0.03] p-1">
                {(['config', 'encoder', 'overlay', 'monetization'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSubTab(tab)}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium capitalize transition-all ${
                      subTab === tab ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {tab === 'config' ? 'Stream Config' : tab}
                  </button>
                ))}
              </div>

              {subTab === 'config' && (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-medium text-white/30">Title</label>
                    <input type="text" defaultValue={activeStream.title} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-medium text-white/30">Description</label>
                    <textarea rows={2} defaultValue={activeStream.description || ''} className={inputCls + ' resize-none'} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-white/30">Category</label>
                      <select defaultValue={activeStream.category} className={inputCls}>
                        <option value="football">Football</option>
                        <option value="basketball">Basketball</option>
                        <option value="tennis">Tennis</option>
                        <option value="cricket">Cricket</option>
                        <option value="racing">Racing</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-white/30">League</label>
                      <select defaultValue="ucl" className={inputCls}>
                        <option value="ucl">UCL</option>
                        <option value="epl">EPL</option>
                        <option value="laliga">La Liga</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-white/30">Privacy</label>
                      <select defaultValue="public" className={inputCls}>
                        <option value="public">Public</option>
                        <option value="unlisted">Unlisted</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-white/30">Latency</label>
                      <select defaultValue="normal" className={inputCls}>
                        <option value="ultra-low">Ultra Low</option>
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {subTab === 'encoder' && (
                <div className="space-y-3">
                  {/* Stream Source */}
                  <div>
                    <label className="mb-1 block text-[10px] font-medium text-white/30">Stream Source</label>
                    <div className="flex gap-2">
                      {(['RTMP', 'WebRTC', 'SRT'] as const).map((src) => (
                        <button
                          key={src}
                          onClick={() => setEncoderSource(src)}
                          className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                            encoderSource === src
                              ? 'border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981]'
                              : 'border-white/10 bg-white/[0.02] text-white/40 hover:border-white/20'
                          }`}
                        >
                          {src}
                        </button>
                      ))}
                    </div>
                  </div>
                  {[
                    { label: 'Resolution', value: '1920x1080' },
                    { label: 'Bitrate', value: '4500 Kbps' },
                    { label: 'FPS', value: '60' },
                    { label: 'Keyframe Interval', value: '2 sec' },
                    { label: 'Audio Sample Rate', value: '48 kHz' },
                    { label: 'Audio Bitrate', value: '128 Kbps' },
                    { label: 'Audio Channels', value: 'Stereo' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-lg bg-white/[0.02] p-2.5">
                      <span className="text-[11px] text-white/40">{item.label}</span>
                      <span className="text-xs font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {subTab === 'overlay' && (
                <div className="flex flex-col items-center justify-center py-8 text-white/20">
                  <Monitor className="mb-2 h-8 w-8" />
                  <p className="text-sm font-medium text-white/30">Overlay Editor</p>
                  <p className="text-xs mt-1">Customize stream overlays, score bugs, and graphics</p>
                </div>
              )}

              {subTab === 'monetization' && (
                <div className="flex flex-col items-center justify-center py-8 text-white/20">
                  <DollarSign className="mb-2 h-8 w-8" />
                  <p className="text-sm font-medium text-white/30">Monetization</p>
                  <p className="text-xs mt-1">Configure ads, subscriptions, and donation settings</p>
                </div>
              )}
            </div>
          </div>

          {/* Stream Health + RTMP Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Stream Health */}
            <div className="glass-card p-4">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Stream Health</h3>
              <div className="space-y-3">
                {[
                  { label: 'Video Connection', value: 'Excellent', color: '#10b981' },
                  { label: 'Audio Connection', value: 'Excellent', color: '#10b981' },
                  { label: 'Stream Latency', value: '2.3s', color: '#10b981' },
                  { label: 'Dropped Frames', value: '0 (0%)', color: '#10b981' },
                  { label: 'Bitrate', value: '12.4 Mbps', color: '#06b6d4' },
                  { label: 'FPS', value: '60 fps', color: '#06b6d4' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-white/40">{item.label}</span>
                    <span className="text-xs font-semibold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
              {/* Mini sparklines */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-white/25 mb-1 block">Bitrate History</span>
                  <div className="flex h-8 items-end gap-[2px]">
                    {bitrateSparkline.map((v, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm bg-[#06b6d4]/30"
                        style={{ height: `${((v - 10000) / 2000) * 100}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-white/25 mb-1 block">FPS History</span>
                  <div className="flex h-8 items-end gap-[2px]">
                    {fpsSparkline.map((v, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm bg-[#10b981]/30"
                        style={{ height: `${((v - 59) / 2) * 100}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RTMP Settings */}
            <div className="glass-card p-4">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">RTMP Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-white/30">Stream Key</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      defaultValue={activeStream.streamKey || 'sk-live-xxxx-xxxx-xxxx'}
                      className={inputCls + ' font-mono text-xs'}
                    />
                    <CopyButton text={activeStream.streamKey || 'sk-live-xxxx-xxxx-xxxx'} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-white/30">RTMP URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      defaultValue={activeStream.rtmpUrl || 'rtmp://live.sportix.io/live'}
                      className={inputCls + ' font-mono text-xs'}
                    />
                    <CopyButton text={activeStream.rtmpUrl || 'rtmp://live.sportix.io/live'} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/10 px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/10 transition-all">
                  <Pause className="h-4 w-4" /> Pause Stream
                </button>
                <button className="flex items-center gap-2 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 px-4 py-2 text-sm font-medium text-[#ef4444] hover:bg-[#ef4444]/20 transition-all">
                  <Square className="h-4 w-4" /> End Stream
                </button>
                <button className="flex items-center gap-2 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 px-4 py-2 text-sm font-medium text-[#10b981] hover:bg-[#10b981]/20 transition-all">
                  <Save className="h-4 w-4" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-white/20">
          <Radio className="mb-2 h-10 w-10" />
          <p className="text-sm font-medium text-white/30">No active streams</p>
          <p className="text-xs mt-1">Start a new stream to begin monitoring</p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ║                     3. ANALYTICS PAGE                         ║
   ═══════════════════════════════════════════════════════════════════ */

function AnalyticsPage({ streams, loading }: { streams: StreamData[]; loading: boolean }) {
  const [analyticsData, setAnalyticsData] = useState<Record<string, unknown> | null>(null)
  const [viewerHistory] = useState(() =>
    Array.from({ length: 24 }, () => Math.floor(Math.random() * 50000) + 10000)
  )

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((data) => setAnalyticsData(data))
      .catch(() => setAnalyticsData(null))
  }, [])

  if (loading) return <LoadingSpinner />

  const data = analyticsData as Record<string, unknown> | null
  const totalViewers = (data?.totalViewers as number) ?? streams.reduce((s, v) => s + v.viewerCount, 0) ?? 196000
  const peakViewers = (data?.peakViewers as number) ?? Math.max(...streams.map((s) => s.peakViewers), 0) ?? 85000
  const watchTime = (data?.totalWatchTime as string) ?? '12,450h'
  const growth = (data?.growthPercent as number) ?? 12.5

  const maxChart = Math.max(...viewerHistory)

  const regionData = [
    { label: 'India', pct: 35, color: '#10b981' },
    { label: 'USA', pct: 20, color: '#3b82f6' },
    { label: 'UK', pct: 15, color: '#8b5cf6' },
    { label: 'Brazil', pct: 10, color: '#f59e0b' },
    { label: 'Others', pct: 20, color: '#6b7280' },
  ]

  const timelineData = [
    { time: '2 min ago', event: 'Real Madrid vs Man City went live', color: '#ef4444' },
    { time: '15 min ago', event: 'Peak viewers reached: 45.2K', color: '#f59e0b' },
    { time: '32 min ago', event: 'EPL Match recording started', color: '#06b6d4' },
    { time: '1 hour ago', event: 'New subscriber milestone: 10K', color: '#10b981' },
    { time: '2 hours ago', event: 'UCL Final stream ended', color: '#ef4444' },
    { time: '3 hours ago', event: 'System maintenance completed', color: '#8b5cf6' },
    { time: '4 hours ago', event: 'NBA Playoffs stream started', color: '#ef4444' },
    { time: '5 hours ago', event: 'Chat moderation alert triggered', color: '#f59e0b' },
  ]

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b5cf6]/10 text-[#8b5cf6]">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics & Reports</h2>
          <p className="text-sm text-white/40">Detailed platform analytics and performance metrics</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Viewers', value: formatNumber(totalViewers), icon: <Eye className="h-5 w-5" />, color: '#10b981' },
          { label: 'Watch Time', value: watchTime, icon: <Clock className="h-5 w-5" />, color: '#06b6d4' },
          { label: 'Peak Viewers', value: formatNumber(peakViewers), icon: <TrendingUp className="h-5 w-5" />, color: '#f59e0b' },
          { label: 'Growth', value: `+${growth}%`, icon: <ArrowUpRight className="h-5 w-5" />, color: '#8b5cf6' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white/40">{s.label}</span>
              <div style={{ color: s.color }}>{s.icon}</div>
            </div>
            <p className="mt-2 text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 24h Viewer Chart */}
      <div className="glass-card p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Viewer Activity (24h)</h3>
            <p className="text-xs text-white/40">Live viewer count over time</p>
          </div>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-[#10b981]">
            <TrendingUp className="h-4 w-4" /> +{Math.floor(growth)}%
          </span>
        </div>
        <div className="flex h-44 items-end gap-[3px]">
          {viewerHistory.map((value, i) => {
            const height = (value / maxChart) * 100
            return (
              <div
                key={i}
                className="group/bar relative flex-1 cursor-pointer rounded-t-sm bg-[#10b981]/20 transition-all hover:bg-[#10b981]/40"
                style={{ height: `${height}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden rounded-md bg-[#0b0f1a] px-2 py-1 text-[10px] whitespace-nowrap text-white ring-1 ring-white/10 group-hover/bar:block">
                  {formatNumber(value)}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-white/20">
          <span>24h ago</span>
          <span>Now</span>
        </div>
      </div>

      {/* Per-stream Analytics + Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Per-Stream Cards */}
        <div className="lg:col-span-2 space-y-2">
          <h3 className="text-sm font-semibold text-white mb-1">Per-Stream Analytics</h3>
          {streams.slice(0, 6).map((stream) => (
            <div key={stream.id} className="glass-card p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${stream.status === 'live' ? 'bg-[#ef4444]' : 'bg-white/20'}`} />
                <span className="truncate text-sm text-white">{stream.title}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-white/40 flex-wrap">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatNumber(stream.viewerCount)}</span>
                <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {formatNumber(stream.peakViewers)}</span>
                <span className="capitalize">{stream.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Audience by Region Donut */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Audience by Region</h3>
          <div className="flex justify-center">
            <div
              className="rounded-full"
              style={{
                background: 'conic-gradient(#10b981 0% 35%, #3b82f6 35% 55%, #8b5cf6 55% 70%, #f59e0b 70% 80%, #6b7280 80% 100%)',
                padding: '8px',
              }}
            >
              <div className="rounded-full bg-[#0d1117] flex items-center justify-center" style={{ padding: '24px' }}>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{formatNumber(totalViewers)}</p>
                  <p className="text-[10px] text-white/40">Total Viewers</p>
                </div>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {regionData.map((r) => (
              <div key={r.label} className="flex items-center gap-2 text-xs">
                <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: r.color }} />
                <span className="text-white/50">{r.label}</span>
                <span className="ml-auto font-semibold text-white/70">{r.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stream Activity Timeline */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Stream Activity Timeline</h3>
        <div className="relative">
          <div className="absolute left-[14px] top-0 bottom-0 w-px bg-white/[0.06]" />
          <div className="space-y-0">
            {timelineData.map((item, i) => (
              <div key={i} className="relative flex items-start gap-3 px-2 py-2.5 hover:bg-white/[0.02] rounded-lg transition-colors">
                <div
                  className="relative z-10 mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08]"
                  style={{ background: `${item.color}12`, color: item.color }}
                >
                  <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-xs text-white/70">{item.event}</p>
                  <p className="text-[10px] text-white/25 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ║                      4. VIDEOS PAGE                           ║
   ═══════════════════════════════════════════════════════════════════ */

function VideosPage({ videos, loading }: { videos: VideoData[]; loading: boolean }) {
  const [search, setSearch] = useState('')
  const filteredVideos = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.category.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header + Upload Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981]">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Video Management</h2>
            <p className="text-sm text-white/40">Manage your uploaded videos and recordings</p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[#10b981] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#10b981]/90 transition-all shadow-lg shadow-[#10b981]/20 self-start sm:self-auto">
          <Upload className="h-4 w-4" /> Upload Video
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search videos..."
          className={inputCls + ' pl-10'}
        />
      </div>

      {/* Video List */}
      <div className="space-y-2">
        {filteredVideos.length === 0 ? (
          <div className="glass-card p-8 text-center text-white/30">
            <Video className="mx-auto mb-2 h-8 w-8" />
            <p className="text-sm">{search ? 'No videos match your search' : 'No videos found'}</p>
          </div>
        ) : (
          filteredVideos.map((video) => (
            <div key={video.id} className="glass-card glass-card-hover flex items-center gap-4 p-3">
              {/* Thumbnail area */}
              <div
                className="flex h-16 w-28 flex-shrink-0 items-center justify-center rounded-lg relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1a2235, #243049)' }}
              >
                <Play className="h-5 w-5 text-white/30" />
                <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {formatDuration(video.duration)}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-white">{video.title}</p>
                  {video.isFeatured && <Star className="h-3.5 w-3.5 flex-shrink-0 text-[#f59e0b] fill-[#f59e0b]" />}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-white/40 flex-wrap">
                  <span>{formatDuration(video.duration)}</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {formatNumber(video.views)}
                  </span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 capitalize text-[10px]">{video.category}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:bg-white/[0.06] hover:text-white/60 transition-all">
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:bg-[#ef4444]/10 hover:text-[#ef4444] transition-all">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Auto Record System Info */}
      <div className="glass-card p-4 border-[#10b981]/10">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10b981]/10 flex-shrink-0">
            <div className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#10b981]" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Auto Record System</h3>
            <p className="text-xs text-white/40 mt-1">
              All live streams are automatically recorded and saved as VODs. Recordings are processed and available within 5 minutes of stream end.
            </p>
            <div className="mt-2 flex items-center gap-4 text-xs text-white/30">
              <span className="flex items-center gap-1 text-[#10b981]"><Check className="h-3 w-3" /> Active</span>
              <span>Storage: 42.3 GB / 100 GB</span>
              <span>Quality: Source</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ║                       5. USERS PAGE                            ║
   ═══════════════════════════════════════════════════════════════════ */

function UsersPage({ loading }: { loading: boolean }) {
  const [users, setUsers] = useState<Array<Record<string, string | number | boolean>>>([])
  const [search, setSearch] = useState('')
  const [usersLoading, setUsersLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data?.users) ? data.users : Array.isArray(data) ? data : []
        if (list.length > 0) {
          setUsers(list)
        } else {
          setUsers([
            { id: '1', username: 'John Doe', email: 'john@sportix.io', role: 'admin', status: 'active', joinDate: '2024-01-15' },
            { id: '2', username: 'Jane Smith', email: 'jane@sportix.io', role: 'moderator', status: 'active', joinDate: '2024-02-20' },
            { id: '3', username: 'Mike Johnson', email: 'mike@sportix.io', role: 'subscriber', status: 'active', joinDate: '2024-03-10' },
            { id: '4', username: 'Sarah Wilson', email: 'sarah@sportix.io', role: 'viewer', status: 'active', joinDate: '2024-04-05' },
            { id: '5', username: 'Alex Brown', email: 'alex@sportix.io', role: 'viewer', status: 'inactive', joinDate: '2024-05-12' },
            { id: '6', username: 'Emily Davis', email: 'emily@sportix.io', role: 'subscriber', status: 'active', joinDate: '2024-06-18' },
          ])
        }
      })
      .catch(() => {
        setUsers([
          { id: '1', username: 'John Doe', email: 'john@sportix.io', role: 'admin', status: 'active', joinDate: '2024-01-15' },
          { id: '2', username: 'Jane Smith', email: 'jane@sportix.io', role: 'moderator', status: 'active', joinDate: '2024-02-20' },
        ])
      })
      .finally(() => setUsersLoading(false))
  }, [])

  if (loading || usersLoading) return <LoadingSpinner />

  const filteredUsers = users.filter(
    (u) =>
      String(u.username || '').toLowerCase().includes(search.toLowerCase()) ||
      String(u.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === 'active').length
  const newThisWeek = Math.min(3, users.length)

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return { bg: 'bg-[#8b5cf6]/10', text: 'text-[#8b5cf6]' }
      case 'moderator': return { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' }
      case 'subscriber': return { bg: 'bg-[#10b981]/10', text: 'text-[#10b981]' }
      default: return { bg: 'bg-white/5', text: 'text-white/50' }
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-3 w-3" />
      case 'moderator': return <ShieldCheck className="h-3 w-3" />
      case 'subscriber': return <Star className="h-3 w-3" />
      default: return <Users className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#06b6d4]/10 text-[#06b6d4]">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-sm text-white/40">Manage platform users, roles, and permissions</p>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Users', value: totalUsers, color: '#06b6d4' },
          { label: 'Active Users', value: activeUsers, color: '#10b981' },
          { label: 'New This Week', value: newThisWeek, color: '#f59e0b' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3">
            <span className="text-xs text-white/40">{s.label}</span>
            <p className="mt-1 text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users by name or email..."
          className={inputCls + ' pl-10'}
        />
      </div>

      {/* Desktop Table */}
      <div className="glass-card overflow-hidden hidden md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-4 py-3 text-xs font-medium text-white/40">User</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">Email</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">Role</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">Joined</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const initials = String(user.username || 'U')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
              const roleColor = getRoleColor(String(user.role))
              const isActive = user.status === 'active'

              return (
                <tr key={String(user.id)} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#1a2235] to-[#243049] text-[10px] font-bold text-white/70">
                        {initials}
                      </div>
                      <span className="text-sm font-medium text-white">{String(user.username)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/50">{String(user.email)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${roleColor.bg} ${roleColor.text}`}>
                      {getRoleIcon(String(user.role))}
                      {String(user.role).charAt(0).toUpperCase() + String(user.role).slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs text-white/50">
                      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-[#10b981]' : 'bg-white/30'}`} />
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/30">{String(user.joinDate || 'N/A')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:bg-white/[0.06] hover:text-white/60 transition-all">
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:bg-[#f59e0b]/10 hover:text-[#f59e0b] transition-all">
                        <ShieldBan className="h-3 w-3" />
                      </button>
                      <button className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:bg-[#ef4444]/10 hover:text-[#ef4444] transition-all">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-2 md:hidden">
        {filteredUsers.map((user) => {
          const initials = String(user.username || 'U')
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
          const roleColor = getRoleColor(String(user.role))

          return (
            <div key={String(user.id)} className="glass-card p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1a2235] to-[#243049] text-[10px] font-bold text-white/70">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{String(user.username)}</p>
                    <p className="text-xs text-white/40">{String(user.email)}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${roleColor.bg} ${roleColor.text}`}>
                  {getRoleIcon(String(user.role))}
                  {String(user.role).charAt(0).toUpperCase() + String(user.role).slice(1)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-white/30">
                  <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'active' ? 'bg-[#10b981]' : 'bg-white/30'}`} />
                  {String(user.joinDate || 'N/A')}
                </span>
                <div className="flex items-center gap-1">
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:bg-white/[0.06] hover:text-white/60 transition-all">
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:bg-[#f59e0b]/10 hover:text-[#f59e0b] transition-all">
                    <ShieldBan className="h-3 w-3" />
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:bg-[#ef4444]/10 hover:text-[#ef4444] transition-all">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ║                  6. CHAT MODERATION PAGE                      ║
   ═══════════════════════════════════════════════════════════════════ */

function ChatModerationPage({
  streams,
  loading,
}: {
  streams: StreamData[]
  loading: boolean
}) {
  const liveStreams = streams.filter((s) => s.status === 'live')
  const [activeStreamId, setActiveStreamId] = useState<string | null>(() => {
    const live = streams.find((s) => s.status === 'live')
    return live?.id ?? null
  })
  const [slowMode, setSlowMode] = useState(false)
  const [subOnly, setSubOnly] = useState(false)

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981]">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Chat Moderation</h2>
          <p className="text-sm text-white/40">Monitor and moderate live chat across all streams</p>
        </div>
      </div>

      {/* Stream selector tabs */}
      {liveStreams.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {liveStreams.map((stream) => (
            <button
              key={stream.id}
              onClick={() => setActiveStreamId(stream.id)}
              className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeStreamId === stream.id
                  ? 'bg-[#10b981]/10 text-[#10b981] ring-1 ring-[#10b981]/20'
                  : 'bg-white/5 text-white/50 hover:bg-white/[0.08]'
              }`}
            >
              {stream.homeTeam} vs {stream.awayTeam}
            </button>
          ))}
        </div>
      )}

      {activeStreamId ? (
        <>
          {/* Moderation Tools */}
          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Moderation Tools</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <button className="flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/10 px-4 py-2 text-sm font-medium text-white/60 hover:bg-[#ef4444]/10 hover:text-[#ef4444] hover:border-[#ef4444]/20 transition-all">
                <Trash2 className="h-4 w-4" /> Clear Chat
              </button>
              <button
                onClick={() => setSlowMode(!slowMode)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                  slowMode
                    ? 'bg-[#f59e0b]/10 border-[#f59e0b]/20 text-[#f59e0b]'
                    : 'bg-white/[0.06] border-white/10 text-white/60 hover:bg-white/[0.08]'
                }`}
              >
                <Timer className="h-4 w-4" /> Slow Mode {slowMode ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setSubOnly(!subOnly)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                  subOnly
                    ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/20 text-[#8b5cf6]'
                    : 'bg-white/[0.06] border-white/10 text-white/60 hover:bg-white/[0.08]'
                }`}
              >
                <Star className="h-4 w-4" /> Sub Only {subOnly ? 'ON' : 'OFF'}
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 px-4 py-2 text-sm font-medium text-[#10b981] hover:bg-[#10b981]/20 transition-all">
                <Zap className="h-4 w-4" /> Highlight All
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Messages', value: '1,245' },
                { label: 'Messages/min', value: '18' },
                { label: 'Active Users', value: '342' },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-white/[0.03] p-3 text-center">
                  <p className="text-lg font-bold text-white">{s.value}</p>
                  <p className="text-[10px] text-white/30">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live Chat */}
          <div className="glass-card p-1">
            <div className="h-[500px]">
              <LiveChat streamId={activeStreamId} isAdmin={true} />
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-white/20">
          <MessageSquare className="mb-2 h-10 w-10" />
          <p className="text-sm font-medium text-white/30">No live streams to moderate</p>
          <p className="text-xs mt-1">Start a live stream to begin moderating chat</p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ║                      7. SETTINGS PAGE                         ║
   ═══════════════════════════════════════════════════════════════════ */

function SettingsPage({ loading }: { loading: boolean }) {
  const [settings, setSettings] = useState<Record<string, Record<string, string | number | boolean>>>({})
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data?.groups && Array.isArray(data.groups)) {
          const mapped: Record<string, Record<string, string | number | boolean>> = {}
          data.groups.forEach((g: Record<string, unknown>) => {
            const name = String(g.name || '')
            const fields = g.fields as Record<string, unknown>[]
            if (fields && Array.isArray(fields)) {
              mapped[name] = {}
              fields.forEach((f: Record<string, unknown>) => {
                mapped[name][String(f.key || f.name || '')] = f.value ?? f.defaultValue ?? ''
              })
            }
          })
          if (Object.keys(mapped).length > 0) {
            setSettings(mapped)
            return
          }
        }
        // Default fallback settings
        setSettings({
          General: {
            siteName: 'Sportix Live',
            siteDescription: 'Premium sports live streaming platform',
            language: 'en',
            timezone: 'UTC',
          },
          Streaming: {
            maxBitrate: 6000,
            defaultQuality: '1080p',
            autoRecord: true,
            maxViewers: 50000,
          },
          Recording: {
            autoRecordEnabled: true,
            retentionDays: 30,
            quality: 'source',
            storageLimit: 100,
          },
          Chat: {
            slowMode: false,
            slowModeInterval: 5,
            subOnly: false,
            maxMessageLength: 500,
            emotesEnabled: true,
          },
          Maintenance: {
            maintenanceMode: false,
            scheduledDowntime: '',
            maxConcurrentStreams: 10,
          },
        })
      })
      .catch(() => {
        setSettings({
          General: { siteName: 'Sportix Live', siteDescription: '', language: 'en', timezone: 'UTC' },
          Streaming: { maxBitrate: 6000, defaultQuality: '1080p', autoRecord: true },
          Recording: { autoRecordEnabled: true, retentionDays: 30 },
          Chat: { slowMode: false, subOnly: false, maxMessageLength: 500 },
          Maintenance: { maintenanceMode: false, scheduledDowntime: '' },
        })
      })
      .finally(() => setSettingsLoading(false))
  }, [])

  const updateSetting = useCallback((group: string, key: string, value: string | number | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [group]: { ...prev[group], [key]: value },
    }))
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      setToast('Settings saved successfully!')
      setTimeout(() => setToast(null), 3000)
    } catch {
      setToast('Failed to save settings')
      setTimeout(() => setToast(null), 3000)
    } finally {
      setSaving(false)
    }
  }, [settings])

  const handleReset = useCallback(() => {
    setSettings({
      General: { siteName: 'Sportix Live', siteDescription: '', language: 'en', timezone: 'UTC' },
      Streaming: { maxBitrate: 6000, defaultQuality: '1080p', autoRecord: true, maxViewers: 50000 },
      Recording: { autoRecordEnabled: true, retentionDays: 30, quality: 'source', storageLimit: 100 },
      Chat: { slowMode: false, slowModeInterval: 5, subOnly: false, maxMessageLength: 500, emotesEnabled: true },
      Maintenance: { maintenanceMode: false, scheduledDowntime: '', maxConcurrentStreams: 10 },
    })
    setToast('Settings reset to defaults')
    setTimeout(() => setToast(null), 3000)
  }, [])

  if (loading || settingsLoading) return <LoadingSpinner />

  const fieldMeta: Record<string, { label: string; type: 'text' | 'number' | 'select' | 'toggle'; options?: string[] }> = {
    siteName: { label: 'Site Name', type: 'text' },
    siteDescription: { label: 'Site Description', type: 'text' },
    language: { label: 'Language', type: 'select', options: ['en', 'es', 'fr', 'de', 'pt'] },
    timezone: { label: 'Timezone', type: 'select', options: ['UTC', 'EST', 'PST', 'CET', 'IST'] },
    maxBitrate: { label: 'Max Bitrate (Kbps)', type: 'number' },
    defaultQuality: { label: 'Default Quality', type: 'select', options: ['360p', '480p', '720p', '1080p', '4K'] },
    autoRecord: { label: 'Auto-Record Streams', type: 'toggle' },
    maxViewers: { label: 'Max Viewers Per Stream', type: 'number' },
    autoRecordEnabled: { label: 'Auto-Record Enabled', type: 'toggle' },
    retentionDays: { label: 'Retention Days', type: 'number' },
    quality: { label: 'Recording Quality', type: 'select', options: ['source', '1080p', '720p', '480p'] },
    storageLimit: { label: 'Storage Limit (GB)', type: 'number' },
    slowMode: { label: 'Slow Mode', type: 'toggle' },
    slowModeInterval: { label: 'Slow Mode Interval (sec)', type: 'number' },
    subOnly: { label: 'Sub-Only Chat', type: 'toggle' },
    maxMessageLength: { label: 'Max Message Length', type: 'number' },
    emotesEnabled: { label: 'Emotes Enabled', type: 'toggle' },
    maintenanceMode: { label: 'Maintenance Mode', type: 'toggle' },
    scheduledDowntime: { label: 'Scheduled Downtime', type: 'text' },
    maxConcurrentStreams: { label: 'Max Concurrent Streams', type: 'number' },
  }

  const groupIcons: Record<string, ReactNode> = {
    General: <Settings className="h-4 w-4" />,
    Streaming: <Radio className="h-4 w-4" />,
    Recording: <Video className="h-4 w-4" />,
    Chat: <MessageSquare className="h-4 w-4" />,
    Maintenance: <AlertTriangle className="h-4 w-4" />,
  }

  const groupColors: Record<string, string> = {
    General: '#06b6d4',
    Streaming: '#ef4444',
    Recording: '#10b981',
    Chat: '#8b5cf6',
    Maintenance: '#f59e0b',
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f59e0b]/10 text-[#f59e0b]">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">System Settings</h2>
          <p className="text-sm text-white/40">Configure platform settings and preferences</p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-xl bg-[#10b981] px-4 py-3 text-sm font-medium text-white shadow-lg shadow-[#10b981]/30 animate-[fadeInUp_0.3s_ease-out]">
          <Check className="h-4 w-4" /> {toast}
        </div>
      )}

      {/* Settings Groups */}
      <div className="space-y-4">
        {Object.entries(settings).map(([groupName, fields]) => (
          <div key={groupName} className="glass-card p-4 md:p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: `${groupColors[groupName] || '#10b981'}15`, color: groupColors[groupName] || '#10b981' }}
              >
                {groupIcons[groupName] || <Settings className="h-4 w-4" />}
              </div>
              <h3 className="text-sm font-semibold text-white">{groupName}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(fields).map(([key, value]) => {
                const meta = fieldMeta[key] || { label: key, type: 'text' as const }

                return (
                  <div key={key}>
                    <label className="mb-1.5 block text-xs font-medium text-white/40">{meta.label}</label>
                    {meta.type === 'toggle' ? (
                      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <span className="text-sm text-white/60">{value ? 'Enabled' : 'Disabled'}</span>
                        <ToggleSwitch
                          checked={!!value}
                          onChange={(v) => updateSetting(groupName, key, v)}
                          label={meta.label}
                        />
                      </div>
                    ) : meta.type === 'select' && meta.options ? (
                      <select
                        value={String(value)}
                        onChange={(e) => updateSetting(groupName, key, e.target.value)}
                        className={inputCls}
                      >
                        {meta.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={meta.type}
                        value={String(value)}
                        onChange={(e) => updateSetting(groupName, key, meta.type === 'number' ? Number(e.target.value) : e.target.value)}
                        className={inputCls}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[#10b981] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#10b981]/90 transition-all shadow-lg shadow-[#10b981]/20 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <RotateCcw className="h-4 w-4" /> Reset to Defaults
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ║                   8. ACTIVITY LOGS PAGE                       ║
   ═══════════════════════════════════════════════════════════════════ */

function ActivityLogsPage({ loading }: { loading: boolean }) {
  const [logs, setLogs] = useState<Array<Record<string, string>>>([])
  const [logsLoading, setLogsLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/admin/activity')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data?.logs) ? data.logs : Array.isArray(data) ? data : []
        if (list.length > 0) {
          setLogs(
            list.map((l: Record<string, string>) => ({
              message: l.message || l.action || l.description || 'Activity event',
              time: l.time || l.timestamp || l.createdAt || 'Recently',
              type: l.type || l.category || 'system',
            }))
          )
        } else {
          setLogs([
            { message: 'Stream "UCL Final" went live', time: '2 min ago', type: 'stream' },
            { message: 'New user "alex_sports" registered', time: '15 min ago', type: 'user' },
            { message: 'Message deleted by moderator', time: '32 min ago', type: 'chat' },
            { message: 'Auto-record completed for "EPL Match"', time: '1 hour ago', type: 'system' },
            { message: 'Site settings updated by admin', time: '2 hours ago', type: 'system' },
            { message: 'Stream "NBA Playoffs" ended', time: '3 hours ago', type: 'stream' },
            { message: 'User "jane_fan" upgraded to subscriber', time: '4 hours ago', type: 'user' },
            { message: 'Highlight created from La Liga match', time: '5 hours ago', type: 'system' },
            { message: 'Chat slow mode activated for stream', time: '6 hours ago', type: 'chat' },
            { message: 'System backup completed successfully', time: '7 hours ago', type: 'system' },
          ])
        }
      })
      .catch(() => {
        setLogs([
          { message: 'Platform initialized', time: '8 hours ago', type: 'system' },
        ])
      })
      .finally(() => setLogsLoading(false))
  }, [])

  if (loading || logsLoading) return <LoadingSpinner />

  const filterTabs = ['all', 'stream', 'user', 'chat', 'system']
  const filteredLogs = filter === 'all' ? logs : logs.filter((l) => l.type === filter)

  const typeConfig: Record<string, { icon: ReactNode; color: string; badge: string }> = {
    stream: { icon: <Radio className="h-3.5 w-3.5" />, color: '#ef4444', badge: 'Stream' },
    user: { icon: <Users className="h-3.5 w-3.5" />, color: '#10b981', badge: 'User' },
    chat: { icon: <MessageSquare className="h-3.5 w-3.5" />, color: '#f59e0b', badge: 'Chat' },
    system: { icon: <Zap className="h-3.5 w-3.5" />, color: '#06b6d4', badge: 'System' },
    settings: { icon: <Settings className="h-3.5 w-3.5" />, color: '#8b5cf6', badge: 'Settings' },
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#06b6d4]/10 text-[#06b6d4]">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Activity Logs</h2>
          <p className="text-sm text-white/40">Track all platform activity and system events</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-medium capitalize transition-all ${
              filter === tab
                ? 'bg-[#06b6d4]/10 text-[#06b6d4] ring-1 ring-[#06b6d4]/20'
                : 'bg-white/5 text-white/50 hover:bg-white/[0.08]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="glass-card overflow-hidden">
        <div className="relative">
          <div className="absolute left-[18px] top-0 bottom-0 w-px bg-white/[0.06] md:left-[22px]" />
          <div className="space-y-0">
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-white/20">
                <ClipboardList className="mb-2 h-8 w-8" />
                <p className="text-sm">No logs found for this filter</p>
              </div>
            ) : (
              filteredLogs.map((entry, i) => {
                const config = typeConfig[entry.type] || typeConfig.system
                return (
                  <div key={i} className="relative flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                    <div
                      className="relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08] md:h-[42px] md:w-[42px]"
                      style={{ background: `${config.color}10`, color: config.color }}
                    >
                      {config.icon}
                    </div>
                    <div className="min-w-0 flex-1 pt-1 md:pt-1.5">
                      <p className="text-sm text-white/80">{entry.message}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-xs text-white/30">{entry.time}</p>
                        <span
                          className="rounded-md px-1.5 py-0.5 text-[9px] font-medium"
                          style={{ background: `${config.color}12`, color: config.color }}
                        >
                          {config.badge}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="mt-1.5 h-4 w-4 flex-shrink-0 text-white/10" />
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────── Generic Placeholder for unmapped pages ────────────────────────── */

function GenericPlaceholderPage({ page }: { page: AdminPage }) {
  const pageInfo: Record<string, { icon: ReactNode; accent: string; desc: string }> = {
    'live-events': { icon: <Tv className="h-5 w-5" />, accent: '#ef4444', desc: 'Browse and manage all live event listings' },
    'scheduled-live': { icon: <CalendarClock className="h-5 w-5" />, accent: '#f59e0b', desc: 'Schedule upcoming live streams and events' },
    'stream-key': { icon: <KeyRound className="h-5 w-5" />, accent: '#8b5cf6', desc: 'Manage stream keys and RTMP configuration' },
    highlights: { icon: <Film className="h-5 w-5" />, accent: '#f59e0b', desc: 'Curate and manage highlight clips' },
    categories: { icon: <FolderOpen className="h-5 w-5" />, accent: '#06b6d4', desc: 'Organize content with categories and tags' },
    roles: { icon: <ShieldCheck className="h-5 w-5" />, accent: '#8b5cf6', desc: 'Configure user roles and permission levels' },
    revenue: { icon: <DollarSign className="h-5 w-5" />, accent: '#10b981', desc: 'Revenue analytics and financial reports' },
  }

  const info = pageInfo[page] || { icon: <Activity className="h-5 w-5" />, accent: '#10b981', desc: '' }

  return (
    <PageHeader title={getPageTitle(page)} description={info.desc} icon={info.icon} accent={info.accent}>
      <div className="glass-card flex flex-col items-center justify-center py-16 text-white/20">
        <ArrowRightLeft className="mb-3 h-10 w-10" />
        <p className="text-sm font-medium text-white/30">Detailed content coming soon</p>
        <p className="mt-1 text-xs text-white/20">This section is under development</p>
      </div>
    </PageHeader>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ║                        MAIN COMPONENT                         ║
   ═══════════════════════════════════════════════════════════════════ */

export default function AdminPanel() {
  const { setCurrentView, isAdminUnlocked, setAdminUnlocked } = useAppStore()

  /* ── State ── */
  const [activePage, setActivePage] = useState<AdminPage>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const [streams, setStreams] = useState<StreamData[]>([])
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)
  const [notificationCount] = useState(3)

  /* ── Time effect ── */
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  /* ── Data loading ── */
  const loadData = useCallback(async () => {
    try {
      const [streamsRes, videosRes] = await Promise.all([fetch('/api/streams'), fetch('/api/videos')])
      const streamsData = await streamsRes.json()
      const videosData = await videosRes.json()
      setStreams(streamsData)
      setVideos(videosData)
    } catch (e) {
      console.error('Failed to load admin data:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [loadData])

  /* ── Handlers ── */
  const handlePageChange = useCallback((page: AdminPage) => {
    setActivePage(page)
    setSidebarOpen(false)
  }, [])

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), [])

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  const exitAdmin = useCallback(() => {
    setCurrentView('home')
    setAdminUnlocked(false)
  }, [setCurrentView, setAdminUnlocked])

  /* ── Body scroll lock when sidebar is open on mobile ── */
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  /* ── Guard ── */
  if (!isAdminUnlocked) return null

  /* ── Page renderer ── */
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage streams={streams} videos={videos} loading={loading} />
      case 'live-control':
        return <LiveControlPage streams={streams} loading={loading} />
      case 'analytics':
        return <AnalyticsPage streams={streams} loading={loading} />
      case 'videos':
        return <VideosPage videos={videos} loading={loading} />
      case 'users':
      case 'roles':
        return <UsersPage loading={loading} />
      case 'chat':
        return <ChatModerationPage streams={streams} loading={loading} />
      case 'settings':
        return <SettingsPage loading={loading} />
      case 'activity-logs':
        return <ActivityLogsPage loading={loading} />
      default:
        return <GenericPlaceholderPage page={activePage} />
    }
  }

  return (
    <div className="sportix-bg min-h-screen">
      {/* ─── Mobile Overlay ─── */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
      />

      {/* ─── Sidebar ─── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full
          flex flex-col
          border-r border-white/[0.06]
          transition-all duration-300 ease-in-out
          bg-[#0d1117]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          w-72 md:w-[68px] lg:w-72
        `}
      >
        {/* Sidebar top padding */}
        <div className="h-16 flex-shrink-0 border-b border-white/[0.04]" />

        {/* Scrollable menu area */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-2.5 py-3 lg:px-3.5 space-y-1">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx}>
              {/* Section Header */}
              {section.label && (
                <p className="hidden lg:block mb-1.5 mt-4 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/20 first:mt-0">
                  {section.label}
                </p>
              )}

              {/* Menu Items */}
              {section.items.map((item) => {
                const isActive = activePage === item.id
                const Icon = item.icon

                return (
                  <button
                    key={item.id}
                    onClick={() => handlePageChange(item.id)}
                    className={`
                      group relative flex w-full items-center gap-3 rounded-xl
                      px-2.5 py-2.5 lg:px-3
                      text-sm font-medium
                      transition-all duration-200
                      touch-active
                      ${
                        isActive
                          ? 'bg-[#10b981]/10 text-[#10b981]'
                          : 'text-white/45 hover:bg-white/[0.04] hover:text-white/75'
                      }
                    `}
                    title={item.label}
                  >
                    {/* Icon */}
                    <Icon
                      className={`h-[18px] w-[18px] flex-shrink-0 ${
                        isActive ? 'text-[#10b981]' : 'text-white/40 group-hover:text-white/70'
                      }`}
                    />

                    {/* Label - hidden on md (tablet collapsed) */}
                    <span className="md:hidden lg:block whitespace-nowrap truncate">{item.label}</span>

                    {/* LIVE Badge */}
                    {item.badge && (
                      <span className="md:hidden lg:flex ml-auto items-center gap-1 rounded-md bg-[#ef4444]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#ef4444] live-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]" />
                        Live
                      </span>
                    )}

                    {/* Active indicator bar (tablet collapsed) */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-[#10b981] hidden md:block lg:hidden" />
                    )}

                    {/* Collapsed tooltip (md only) */}
                    <span
                      className="
                        absolute left-full top-1/2 -translate-y-1/2 ml-3
                        hidden md:block lg:hidden
                        rounded-lg bg-[#1a2235] px-3 py-1.5
                        text-xs font-medium text-white whitespace-nowrap
                        opacity-0 group-hover:opacity-100 pointer-events-none
                        transition-opacity shadow-xl shadow-black/40
                        z-[60] border border-white/10
                      "
                    >
                      {item.label}
                      {item.badge && (
                        <span className="ml-1.5 text-[9px] font-bold text-[#ef4444]">{item.badge}</span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Bottom */}
        <div className="flex-shrink-0 border-t border-white/[0.06] p-2.5 lg:p-3.5 space-y-1">
          {/* Exit Admin */}
          <button
            onClick={exitAdmin}
            className="group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 lg:px-3 text-sm font-medium text-white/40 hover:bg-[#ef4444]/10 hover:text-[#ef4444] transition-all duration-200 touch-active"
            title="Exit Admin"
          >
            <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
            <span className="md:hidden lg:block whitespace-nowrap">Exit Admin</span>

            {/* Collapsed tooltip */}
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden md:block lg:hidden rounded-lg bg-[#1a2235] px-3 py-1.5 text-xs font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl shadow-black/40 z-[60] border border-white/10">
              Exit Admin
            </span>
          </button>

          {/* System Status */}
          <div className="flex items-center gap-2 px-2.5 lg:px-3 py-1.5">
            <Wifi className="h-3.5 w-3.5 flex-shrink-0 text-[#10b981]" />
            <span className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#10b981]/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
              All Systems Operational
            </span>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="md:ml-[68px] lg:ml-72 transition-all duration-300 min-h-screen flex flex-col">
        {/* ─── Top Header ─── */}
        <header className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center border-b border-white/[0.06] bg-[#0d1117]/80 backdrop-blur-xl">
          <div className="flex h-full items-center justify-between px-4 lg:px-6 w-full">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
              {/* Hamburger - mobile only */}
              <button
                onClick={toggleSidebar}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white md:hidden touch-active"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#10b981] to-[#00ff88]">
                  <Zap className="h-4 w-4 text-[#02040a]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold leading-tight text-white neon-text-glow">
                    Sportix Live
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-white/30">
                    Admin Panel
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Time + Notifications + Profile */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Date (desktop only) */}
              <span className="hidden xl:flex items-center gap-1.5 text-xs text-white/30">
                <Clock className="h-3 w-3" />
                {currentDate}
              </span>

              {/* Time */}
              <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] px-2.5 py-1.5">
                <Clock className="h-3 w-3 text-white/30" />
                <span className="text-xs font-mono font-medium text-white/60 tabular-nums">{currentTime}</span>
              </div>

              {/* Notification Bell */}
              <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white touch-active">
                <Bell className="h-[18px] w-[18px]" />
                {notificationCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444] text-[9px] font-bold text-white ring-2 ring-[#0d1117]">
                    {notificationCount}
                  </span>
                )}
              </button>

              {/* Admin Profile */}
              <div className="flex items-center gap-2 ml-1">
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-[11px] font-bold text-white ring-2 ring-[#8b5cf6]/30">
                    SA
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0d1117] bg-[#10b981]" />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-semibold text-white">Super Admin</span>
                  <span className="text-[10px] text-white/30">admin@sportix.io</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Page Content ─── */}
        <main className="flex-1 p-4 md:p-5 lg:p-6" key={activePage}>
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

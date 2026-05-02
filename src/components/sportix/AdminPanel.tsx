'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import {
  LayoutDashboard,
  Activity,
  Users,
  Radio,
  Video,
  AlertTriangle,
  FolderOpen,
  CalendarClock,
  MessageSquare,
  BarChart3,
  TrendingUp,
  DollarSign,
  Settings,
  ClipboardList,
  Bell,
  ShieldCheck,
  Menu,
  X,
  Clock,
  LogOut,
  Eye,
  Search,
  Upload,
  Trash2,
  Copy,
  Check,
  Server,
  Cpu,
  HardDrive,
  ChevronRight,
  SlidersHorizontal,
  ImageIcon,
  FileText,
  Calendar,
  Play,
  Pause,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
  Monitor,
  Wifi,
  Zap,
  Globe,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM
   ═══════════════════════════════════════════════════════════════ */

const C = {
  bg: '#121212',
  sidebar: '#1a1a1a',
  card: '#1e1e1e',
  cardHover: '#242424',
  border: 'rgba(255,255,255,0.06)',
  borderHover: 'rgba(255,255,255,0.10)',
  accent: '#e63946',
  accentDim: 'rgba(230,57,70,0.15)',
  accentGlow: 'rgba(230,57,70,0.25)',
  success: '#2ecc71',
  warning: '#f39c12',
  info: '#3498db',
  purple: '#9b59b6',
  text: '#ffffff',
  textSec: '#b0b0b0',
  textTer: '#888888',
  textDim: '#555555',
}

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

type AdminPage =
  | 'dashboard'
  | 'live-control'
  | 'live-monitor'
  | 'users'
  | 'videos'
  | 'highlights'
  | 'reports'
  | 'categories'
  | 'schedules'
  | 'comments'
  | 'banners'
  | 'analytics'
  | 'engagement'
  | 'revenue'
  | 'settings'
  | 'activity-logs'
  | 'notifications'
  | 'admins'

interface MenuSection {
  label: string | null
  items: { id: AdminPage; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; badge?: string }[]
}

const menuSections: MenuSection[] = [
  { label: null, items: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-control', label: 'Live Control', icon: Radio, badge: 'LIVE' },
  ] },
  {
    label: 'MONITORING',
    items: [
      { id: 'live-monitor', label: 'Live Monitor', icon: Activity },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'videos', label: 'Videos', icon: Video },
      { id: 'highlights', label: 'Highlights', icon: Zap },
      { id: 'reports', label: 'Reports', icon: FileText, badge: '12' },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { id: 'categories', label: 'Categories', icon: FolderOpen },
      { id: 'schedules', label: 'Schedules', icon: CalendarClock },
      { id: 'comments', label: 'Comments', icon: MessageSquare },
      { id: 'banners', label: 'Banners', icon: ImageIcon },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'engagement', label: 'Engagement', icon: TrendingUp },
      { id: 'revenue', label: 'Revenue', icon: DollarSign },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'activity-logs', label: 'Activity Logs', icon: ClipboardList },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'admins', label: 'Admins', icon: ShieldCheck },
    ],
  },
]

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

/* ═══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function Card({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-2xl border p-5 transition-all duration-200 ${className}`} style={{ background: C.card, borderColor: C.border, ...style }}>
      {children}
    </div>
  )
}

function CardHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-[15px] font-semibold text-white">{title}</h3>
      {children}
    </div>
  )
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  return (
    <div className="flex h-8 items-end gap-[2px]">
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm" style={{ height: `${(v / max) * 100}%`, background: `${color}40` }} />
      ))}
    </div>
  )
}

function StatusBadge({ text, color }: { text: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold" style={{ background: `${color}15`, color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {text}
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════
   1. DASHBOARD PAGE — exact reference match
   ═══════════════════════════════════════════════════════════════ */

function DashboardPage() {
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const tick = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
      setCurrentDate(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
    }
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [])

  const statsCards = [
    { label: 'Total Users', value: '24,853', change: '+12.5%', positive: true, icon: Users, color: C.purple, sparkline: [18, 22, 19, 25, 28, 24, 30] },
    { label: 'Active Users', value: '5,472', change: '+8.3%', positive: true, icon: Activity, color: C.purple, sparkline: [12, 15, 13, 18, 16, 20, 22] },
    { label: 'Total Streams', value: '1,256', change: '+15.7%', positive: true, icon: Radio, color: C.info, sparkline: [8, 10, 12, 9, 14, 11, 16] },
    { label: 'Total Views', value: '8.45M', change: '+21.4%', positive: true, icon: Eye, color: '#e6a817', sparkline: [50, 65, 55, 70, 80, 75, 90] },
    { label: 'Storage Used', value: '1.24 TB', change: '12.4% of 10 TB', positive: true, icon: HardDrive, color: C.success, sparkline: [30, 35, 32, 40, 38, 42, 45] },
  ]

  const viewsChartData = Array.from({ length: 7 }, () => Math.floor(Math.random() * 1500000) + 500000)
  const uploadChartData = Array.from({ length: 7 }, () => Math.floor(Math.random() * 800) + 200)

  const liveUsers = [
    { name: 'Rahul Sharma', email: 'rahul@email.com', status: 'watching', stream: 'India vs Australia', time: '12m ago' },
    { name: 'Priya Patel', email: 'priya@email.com', status: 'streaming', stream: 'EPL Highlights', time: '5m ago' },
    { name: 'Alex Chen', email: 'alex@email.com', status: 'watching', stream: 'NBA Finals', time: '2m ago' },
    { name: 'Maria Garcia', email: 'maria@email.com', status: 'watching', stream: 'F1 Monaco GP', time: '8m ago' },
    { name: 'James Wilson', email: 'james@email.com', status: 'idle', stream: '—', time: '15m ago' },
  ]

  const topVideos = [
    { title: 'India vs England - T20 WC Final', views: '2.4M', likes: '45.2K', duration: '4:12:30', thumbnail: '/sportix/stadium-preview.png' },
    { title: 'EPL Best Goals 2026', views: '1.8M', likes: '38.1K', duration: '12:45', thumbnail: '/sportix/cricket-stadium.png' },
    { title: 'NBA Finals Game 7 Highlights', views: '1.2M', likes: '29.5K', duration: '8:30', thumbnail: '/sportix/stadium-preview.png' },
  ]

  const recentReports = [
    { id: 'R-1042', type: 'Spam', user: 'user_8291', target: 'Comment on Stream #45', status: 'pending', date: '2 hours ago' },
    { id: 'R-1041', type: 'Inappropriate', user: 'user_7723', target: 'Highlight Video #128', status: 'resolved', date: '4 hours ago' },
    { id: 'R-1040', type: 'Copyright', user: 'mod_team', target: 'Reel #892', status: 'reviewing', date: '6 hours ago' },
    { id: 'R-1039', type: 'Spam', user: 'user_6654', target: 'Comment on Video #334', status: 'resolved', date: '8 hours ago' },
  ]

  return (
    <div className="space-y-5 fade-in-up">
      {/* ── Stats Cards Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statsCards.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium" style={{ color: C.textTer }}>{s.label}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${s.color}15` }}>
                  <Icon className="h-4 w-4" style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] font-medium" style={{ color: s.positive ? C.success : C.accent }}>
                  {s.positive ? <ArrowUpRight className="inline h-3 w-3 mr-0.5" /> : <ArrowDownRight className="inline h-3 w-3 mr-0.5" />}
                  {s.change}
                </span>
                <MiniSparkline data={s.sparkline} color={s.color} />
              </div>
            </Card>
          )
        })}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Views Overview */}
        <Card>
          <CardHeader title="Views Overview">
            <span className="text-[11px] font-medium" style={{ color: C.textTer }}>Last 7 days</span>
          </CardHeader>
          <div className="flex h-48 items-end gap-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const max = Math.max(...viewsChartData)
              const h = (viewsChartData[i] / max) * 100
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative group cursor-pointer">
                    <div
                      className="w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80"
                      style={{ height: `${h}%`, background: `linear-gradient(180deg, ${C.accent}90, ${C.accent}20)`, minHeight: 8 }}
                    />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block rounded-md px-2 py-1 text-[10px] font-semibold text-white whitespace-nowrap" style={{ background: C.sidebar }}>
                      {fmtCompact(viewsChartData[i])}
                    </div>
                  </div>
                  <span className="text-[10px]" style={{ color: C.textDim }}>{day}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px]" style={{ color: C.textTer }}>Total: <span className="font-semibold text-white">{fmt(viewsChartData.reduce((a, b) => a + b, 0))}</span></span>
            <span className="text-[11px] font-semibold" style={{ color: C.success }}>+21.4%</span>
          </div>
        </Card>

        {/* Upload Overview */}
        <Card>
          <CardHeader title="Upload Overview">
            <span className="text-[11px] font-medium" style={{ color: C.textTer }}>Last 7 days</span>
          </CardHeader>
          <div className="flex h-48 items-end gap-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const max = Math.max(...uploadChartData)
              const h = (uploadChartData[i] / max) * 100
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative group cursor-pointer">
                    <div
                      className="w-full rounded-t-md transition-all duration-300 group-hover:opacity-80"
                      style={{ height: `${h}%`, background: `${C.accent}80`, minHeight: 8 }}
                    />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block rounded-md px-2 py-1 text-[10px] font-semibold text-white whitespace-nowrap" style={{ background: C.sidebar }}>
                      {uploadChartData[i]}
                    </div>
                  </div>
                  <span className="text-[10px]" style={{ color: C.textDim }}>{day}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px]" style={{ color: C.textTer }}>Total: <span className="font-semibold text-white">{uploadChartData.reduce((a, b) => a + b, 0)}</span></span>
            <span className="text-[11px] font-semibold" style={{ color: C.success }}>+8.2%</span>
          </div>
        </Card>
      </div>

      {/* ── Live Users + Top Videos + System ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live Users */}
        <Card className="lg:col-span-1">
          <CardHeader title="Live Users">
            <StatusBadge text="2,431 online" color={C.success} />
          </CardHeader>
          <div className="space-y-0 overflow-y-auto max-h-[320px] no-scrollbar">
            {liveUsers.map((u, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: C.border }}>
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: `${C.accent}30` }}>
                  {u.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{u.name}</p>
                  <p className="text-[10px] truncate" style={{ color: C.textTer }}>{u.stream}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <StatusBadge text={u.status} color={u.status === 'watching' ? C.info : u.status === 'streaming' ? C.accent : C.textTer} />
                  <p className="text-[9px] mt-1" style={{ color: C.textDim }}>{u.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Performing Videos */}
        <Card className="lg:col-span-1">
          <CardHeader title="Top Performing Videos">
            <button className="text-[11px] font-medium" style={{ color: C.accent }}>View All</button>
          </CardHeader>
          <div className="space-y-3">
            {topVideos.map((v, i) => (
              <div key={i} className="flex gap-3 rounded-xl p-2 transition-all cursor-pointer hover:bg-white/[0.03]">
                <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg" style={{ background: C.sidebar }}>
                  <img src={v.thumbnail} alt="" className="h-full w-full object-cover opacity-70" draggable={false} />
                  <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-mono text-white">{v.duration}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white line-clamp-2 leading-relaxed">{v.title}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] flex items-center gap-1" style={{ color: C.textTer }}><Eye className="h-3 w-3" /> {v.views}</span>
                    <span className="text-[10px]" style={{ color: C.textTer }}>♥ {v.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* System Overview */}
        <Card className="lg:col-span-1">
          <CardHeader title="System Overview">
            <StatusBadge text="Healthy" color={C.success} />
          </CardHeader>
          {/* Circular Progress */}
          <div className="flex justify-center mb-5">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={C.accent} strokeWidth="10" strokeDasharray={`${2 * Math.PI * 50 * 0.73} ${2 * Math.PI * 50}`} strokeLinecap="round" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={C.info} strokeWidth="10" strokeDasharray={`${2 * Math.PI * 50 * 0.45} ${2 * Math.PI * 50}`} strokeDashoffset={`${-2 * Math.PI * 50 * 0.73}`} strokeLinecap="round" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={C.warning} strokeWidth="10" strokeDasharray={`${2 * Math.PI * 50 * 0.62} ${2 * Math.PI * 50}`} strokeDashoffset={`${-2 * Math.PI * 50 * (0.73 + 0.45)}`} strokeLinecap="round" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={C.success} strokeWidth="10" strokeDasharray={`${2 * Math.PI * 50 * 0.42} ${2 * Math.PI * 50}`} strokeDashoffset={`${-2 * Math.PI * 50 * (0.73 + 0.45 + 0.62)}`} strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold text-white">73%</span>
                <span className="text-[10px]" style={{ color: C.textTer }}>Health</span>
              </div>
            </div>
          </div>
          {/* Metrics */}
          <div className="space-y-3">
            {[
              { label: 'CPU Usage', value: '45%', color: C.info, pct: 45 },
              { label: 'Memory Usage', value: '62%', color: C.warning, pct: 62 },
              { label: 'Disk Usage', value: '73%', color: C.accent, pct: 73 },
              { label: 'Network', value: '42%', color: C.success, pct: 42 },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px]" style={{ color: C.textTer }}>{m.label}</span>
                  <span className="text-[11px] font-semibold text-white">{m.value}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${m.pct}%`, background: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Reports + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Reports */}
        <Card>
          <CardHeader title="Recent Reports">
            <button className="text-[11px] font-medium" style={{ color: C.accent }}>View All</button>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: C.border }}>
                  {['ID', 'Type', 'User', 'Target', 'Status', 'Date'].map((h) => (
                    <th key={h} className="pb-2.5 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentReports.map((r) => (
                  <tr key={r.id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                    <td className="py-2.5 text-[11px] font-mono text-white">{r.id}</td>
                    <td className="py-2.5 text-[11px]" style={{ color: C.textSec }}>{r.type}</td>
                    <td className="py-2.5 text-[11px]" style={{ color: C.textTer }}>{r.user}</td>
                    <td className="py-2.5 text-[11px] text-white max-w-[120px] truncate">{r.target}</td>
                    <td className="py-2.5">
                      <StatusBadge text={r.status} color={r.status === 'resolved' ? C.success : r.status === 'reviewing' ? C.warning : C.accent} />
                    </td>
                    <td className="py-2.5 text-[10px]" style={{ color: C.textTer }}>{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" />
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Upload Video', icon: Upload, color: C.info },
              { label: 'Go Live', icon: Radio, color: C.accent },
              { label: 'New Banner', icon: ImageIcon, color: C.purple },
              { label: 'Clear Cache', icon: RefreshCw, color: C.warning },
              { label: 'View Logs', icon: FileText, color: C.success },
              { label: 'System Check', icon: Monitor, color: C.textSec },
            ].map((a) => {
              const Icon = a.icon
              return (
                <button
                  key={a.label}
                  className="flex flex-col items-center gap-2.5 rounded-xl p-4 border transition-all hover:bg-white/[0.03] hover:border-white/10"
                  style={{ borderColor: C.border }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${a.color}15` }}>
                    <Icon className="h-5 w-5" style={{ color: a.color }} />
                  </div>
                  <span className="text-[11px] font-medium text-white">{a.label}</span>
                </button>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   GENERIC PAGE (for all other menu items)
   ═══════════════════════════════════════════════════════════════ */

function GenericPage({ title, subtitle, icon, accent }: { title: string; subtitle: string; icon: React.ReactNode; accent?: string }) {
  const color = accent || C.accent

  const sampleData = Array.from({ length: 8 }, (_, i) => ({
    id: `#${1000 + i}`,
    title: `${title} Item ${i + 1}`,
    status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'pending' : 'inactive',
    date: `${i + 1} hours ago`,
    views: Math.floor(Math.random() * 50000),
  }))

  return (
    <div className="space-y-5 fade-in-up">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}15` }}>
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="text-xs" style={{ color: C.textTer }}>{subtitle}</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 max-w-sm">
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
            <Search className="h-4 w-4" style={{ color: C.textDim }} />
            <input type="text" placeholder={`Search ${title.toLowerCase()}...`} className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none" />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-medium transition-all hover:bg-white/[0.03]" style={{ borderColor: C.border, color: C.textSec }}>
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>
          <button className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition-all hover:opacity-90" style={{ background: color }}>
            <Upload className="h-3.5 w-3.5" /> Add New
          </button>
        </div>
      </div>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                {['ID', 'Title', 'Status', 'Views', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleData.map((item) => (
                <tr key={item.id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                  <td className="px-5 py-3 text-[11px] font-mono" style={{ color: C.textTer }}>{item.id}</td>
                  <td className="px-5 py-3 text-[12px] font-medium text-white">{item.title}</td>
                  <td className="px-5 py-3">
                    <StatusBadge text={item.status} color={item.status === 'active' ? C.success : item.status === 'pending' ? C.warning : C.textTer} />
                  </td>
                  <td className="px-5 py-3 text-[12px]" style={{ color: C.textSec }}>{fmt(item.views)}</td>
                  <td className="px-5 py-3 text-[11px]" style={{ color: C.textTer }}>{item.date}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><Eye className="h-3.5 w-3.5" /></button>
                      <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><Copy className="h-3.5 w-3.5" /></button>
                      <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.accent }}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: C.border }}>
          <span className="text-[11px]" style={{ color: C.textTer }}>Showing 1-8 of 248 results</span>
          <div className="flex items-center gap-1">
            <button className="rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-white/[0.04]" style={{ color: C.textTer }}>Previous</button>
            {[1, 2, 3, '...', 31].map((p, i) => (
              <button key={i} className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-medium transition-colors" style={{ background: p === 1 ? C.accent : 'transparent', color: p === 1 ? '#fff' : C.textTer }}>
                {p}
              </button>
            ))}
            <button className="rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-white/[0.04]" style={{ color: C.textTer }}>Next</button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   LIVE MONITOR PAGE
   ═══════════════════════════════════════════════════════════════ */

function LiveMonitorPage() {
  const liveStreams = [
    { id: 1, title: 'India vs Australia - 3rd T20I', viewers: '24.5K', peak: '31.2K', duration: '2h 15m', health: 'Excellent', category: 'Cricket' },
    { id: 2, title: 'Arsenal vs Chelsea - EPL', viewers: '18.3K', peak: '22.1K', duration: '1h 45m', health: 'Good', category: 'Football' },
    { id: 3, title: 'Lakers vs Celtics - NBA', viewers: '12.8K', peak: '15.6K', duration: '0h 55m', health: 'Excellent', category: 'Basketball' },
    { id: 4, title: 'F1 Monaco Grand Prix', viewers: '9.2K', peak: '11.4K', duration: '3h 10m', health: 'Good', category: 'Racing' },
  ]

  return (
    <div className="space-y-5 fade-in-up">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.accent}15` }}>
          <Activity className="h-5 w-5" style={{ color: C.accent }} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Live Monitor</h2>
            <span className="flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: C.accent }}>
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> LIVE
            </span>
          </div>
          <p className="text-xs" style={{ color: C.textTer }}>{liveStreams.length} active streams</p>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Streams', value: String(liveStreams.length), icon: Radio, color: C.accent },
          { label: 'Total Viewers', value: '64.8K', icon: Eye, color: C.success },
          { label: 'Peak Today', value: '31.2K', icon: TrendingUp, color: C.warning },
          { label: 'Avg Health', value: '96%', icon: Activity, color: C.info },
        ].map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>{s.label}</span>
                <Icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
              <p className="text-xl font-bold text-white">{s.value}</p>
            </Card>
          )
        })}
      </div>

      {/* Live Streams Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: C.border }}>
          <h3 className="text-sm font-semibold text-white">Active Streams</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium border transition-colors hover:bg-white/[0.03]" style={{ borderColor: C.border, color: C.textSec }}>
              <RefreshCw className="h-3 w-3" /> Refresh
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
                {['Stream', 'Category', 'Viewers', 'Peak', 'Duration', 'Health', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textDim }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liveStreams.map((s) => (
                <tr key={s.id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: C.border }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[12px] font-medium text-white">{s.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[11px]" style={{ color: C.textSec }}>{s.category}</td>
                  <td className="px-5 py-3 text-[12px] font-semibold" style={{ color: C.success }}>{s.viewers}</td>
                  <td className="px-5 py-3 text-[12px]" style={{ color: C.textSec }}>{s.peak}</td>
                  <td className="px-5 py-3 text-[11px] font-mono" style={{ color: C.textTer }}>{s.duration}</td>
                  <td className="px-5 py-3"><StatusBadge text={s.health} color={s.health === 'Excellent' ? C.success : C.warning} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button className="rounded-lg px-2.5 py-1 text-[10px] font-medium border transition-colors hover:bg-white/[0.04]" style={{ borderColor: `${C.accent}30`, color: C.accent }}>End</button>
                      <button className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.05]" style={{ color: C.textTer }}><MoreHorizontal className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ANALYTICS PAGE
   ═══════════════════════════════════════════════════════════════ */

function AnalyticsPage() {
  const days30 = Array.from({ length: 30 }, () => Math.floor(Math.random() * 100000) + 10000)

  return (
    <div className="space-y-5 fade-in-up">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.info}15` }}>
          <BarChart3 className="h-5 w-5" style={{ color: C.info }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Analytics</h2>
          <p className="text-xs" style={{ color: C.textTer }}>Platform performance overview</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Views', value: '8.45M', change: '+21.4%', color: C.accent },
          { label: 'Unique Visitors', value: '1.2M', change: '+15.3%', color: C.info },
          { label: 'Avg Watch Time', value: '32 min', change: '+8.7%', color: C.purple },
          { label: 'Bounce Rate', value: '34.2%', change: '-5.1%', color: C.success },
        ].map((s) => (
          <Card key={s.label}>
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.textDim }}>{s.label}</span>
            <p className="text-xl font-bold text-white mt-2">{s.value}</p>
            <span className="text-[11px] font-medium" style={{ color: C.success }}>{s.change}</span>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Views Over 30 Days" />
        <div className="flex h-52 items-end gap-[2px]">
          {days30.map((v, i) => {
            const max = Math.max(...days30)
            return (
              <div key={i} className="flex-1 rounded-t-sm transition-all duration-300 hover:opacity-70" style={{ height: `${(v / max) * 100}%`, background: `linear-gradient(180deg, ${C.accent}50, ${C.accent}08)` }} />
            )
          })}
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SETTINGS PAGE
   ═══════════════════════════════════════════════════════════════ */

function SettingsPage() {
  return (
    <div className="space-y-5 fade-in-up">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <Settings className="h-5 w-5" style={{ color: C.textSec }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Settings</h2>
          <p className="text-xs" style={{ color: C.textTer }}>Platform configuration</p>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { group: 'General', items: ['Site Name', 'Site URL', 'Timezone', 'Language', 'Maintenance Mode'] },
          { group: 'Streaming', items: ['Default Quality', 'Max Concurrent Streams', 'DVR Support', 'Auto-Record', 'Low Latency Mode'] },
          { group: 'Security', items: ['Two-Factor Auth', 'Rate Limiting', 'CORS Origins', 'API Keys'] },
          { group: 'Notifications', items: ['Email Notifications', 'Push Notifications', 'Stream Alerts', 'New User Alerts'] },
        ].map((g) => (
          <Card key={g.group}>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: C.textDim }}>{g.group}</h3>
            <div className="space-y-4">
              {g.items.map((item) => (
                <div key={item} className="flex items-center justify-between py-1">
                  <span className="text-[13px]" style={{ color: C.textSec }}>{item}</span>
                  <div
                    className="relative h-6 w-11 rounded-full transition-colors cursor-pointer"
                    style={{ background: Math.random() > 0.3 ? C.success : 'rgba(255,255,255,0.08)' }}
                    onClick={(e) => {
                      const el = e.currentTarget
                      const isOn = el.style.background === C.success
                      el.style.background = isOn ? 'rgba(255,255,255,0.08)' : C.success
                      el.querySelector('span')!.style.transform = isOn ? 'translateX(2px)' : 'translateX(22px)'
                    }}
                  >
                    <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform" style={{ transform: Math.random() > 0.3 ? 'translateX(22px)' : 'translateX(2px)' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PAGE ROUTER
   ═══════════════════════════════════════════════════════════════ */

function renderPage(page: AdminPage): React.ReactNode {
  if (page === 'dashboard') return <DashboardPage />
  if (page === 'live-monitor') return <LiveMonitorPage />
  if (page === 'analytics' || page === 'engagement') return <AnalyticsPage />
  if (page === 'revenue') return <GenericPage title="Revenue" subtitle="Financial overview" icon={<DollarSign className="h-5 w-5" style={{ color: C.success }} />} accent={C.success} />
  if (page === 'settings') return <SettingsPage />
  if (page === 'users') return <GenericPage title="Users" subtitle="Manage platform users" icon={<Users className="h-5 w-5" style={{ color: C.purple }} />} accent={C.purple} />
  if (page === 'live-control') return <GenericPage title="Live Control" subtitle="Manage live streams" icon={<Radio className="h-5 w-5" style={{ color: C.accent }} />} accent={C.accent} />
  if (page === 'videos') return <GenericPage title="Videos" subtitle="Video content library" icon={<Video className="h-5 w-5" style={{ color: C.info }} />} accent={C.info} />
  if (page === 'highlights') return <GenericPage title="Highlights" subtitle="Match highlights" icon={<Zap className="h-5 w-5" style={{ color: C.accent }} />} accent={C.accent} />
  if (page === 'reports') return <GenericPage title="Reports" subtitle="User reports moderation" icon={<AlertTriangle className="h-5 w-5" style={{ color: C.accent }} />} accent={C.accent} />
  if (page === 'categories') return <GenericPage title="Categories" subtitle="Content categories" icon={<FolderOpen className="h-5 w-5" style={{ color: C.purple }} />} accent={C.purple} />
  if (page === 'schedules') return <GenericPage title="Schedules" subtitle="Match schedules" icon={<CalendarClock className="h-5 w-5" style={{ color: C.info }} />} accent={C.info} />
  if (page === 'comments') return <GenericPage title="Comments" subtitle="User comments" icon={<MessageSquare className="h-5 w-5" style={{ color: C.success }} />} accent={C.success} />
  if (page === 'banners') return <GenericPage title="Banners" subtitle="Promotional banners" icon={<ImageIcon className="h-5 w-5" style={{ color: C.warning }} />} accent={C.warning} />
  if (page === 'activity-logs') return <GenericPage title="Activity Logs" subtitle="System activity" icon={<ClipboardList className="h-5 w-5" style={{ color: C.textSec }} />} accent={C.textSec} />
  if (page === 'notifications') return <GenericPage title="Notifications" subtitle="Notification management" icon={<Bell className="h-5 w-5" style={{ color: C.warning }} />} accent={C.warning} />
  if (page === 'admins') return <GenericPage title="Admins" subtitle="Admin team management" icon={<ShieldCheck className="h-5 w-5" style={{ color: C.info }} />} accent={C.info} />
  return null
}

/* ═══════════════════════════════════════════════════════════════
   MAIN ADMIN PANEL
   ═══════════════════════════════════════════════════════════════ */

export default function AdminPanel() {
  const { setCurrentView } = useAppStore()
  const [activePage, setActivePage] = useState<AdminPage>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const tick = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
      setCurrentDate(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
    }
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [])

  return (
    <div className="min-h-screen flex" style={{ background: C.bg }}>
      {/* ─── Sidebar ─── */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen flex-col border-r transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: 280, background: C.sidebar, borderColor: C.border }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b px-5" style={{ borderColor: C.border }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: C.accent, boxShadow: `0 4px 16px ${C.accentGlow}` }}>
            <Activity className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">
              SPORTIX<span style={{ color: C.accent }}> LIVE</span>
            </h1>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: C.textDim }}>Admin Panel</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden rounded-lg p-1 hover:bg-white/[0.05]">
            <X className="h-4 w-4" style={{ color: C.textTer }} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
          {menuSections.map((section) => (
            <div key={section.label || '_root'} className="mb-3">
              {section.label && (
                <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: C.textDim }}>
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activePage === item.id
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActivePage(item.id); setSidebarOpen(false) }}
                      className="relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150"
                      style={{
                        background: isActive ? C.accent : 'transparent',
                        color: isActive ? '#fff' : C.textSec,
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" style={{ color: isActive ? '#fff' : C.textTer }} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span
                          className="rounded-md px-1.5 py-0.5 text-[9px] font-bold"
                          style={{
                            background: item.badge === 'LIVE' ? C.accent : `${C.accent}20`,
                            color: item.badge === 'LIVE' ? '#fff' : C.accent,
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t px-3 py-3" style={{ borderColor: C.border }}>
          <button
            onClick={() => { setCurrentView('home'); setSidebarOpen(false) }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all hover:bg-white/[0.04]"
            style={{ color: C.accent }}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ─── Sidebar Overlay (mobile) ─── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Main Content ─── */}
      <div className="flex-1 lg:ml-[280px] min-h-screen flex flex-col transition-all duration-300">
        {/* ─── Top Header ─── */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 lg:px-6" style={{ background: 'rgba(18,18,18,0.90)', backdropFilter: 'blur(20px)', borderColor: C.border }}>
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-white/[0.05] lg:hidden"
          >
            <Menu className="h-5 w-5" style={{ color: C.textSec }} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
              <Search className="h-4 w-4 flex-shrink-0" style={{ color: C.textDim }} />
              <input
                type="text"
                placeholder="Search anything..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none"
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setSearchOpen(false)}
              />
              <kbd className="hidden sm:inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-mono" style={{ borderColor: C.border, color: C.textDim }}>⌘K</kbd>
            </div>
          </div>

          {/* Date */}
          <div className="hidden md:flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] transition-colors hover:bg-white/[0.03]" style={{ borderColor: C.border, color: C.textTer }}>
            <Calendar className="h-3.5 w-3.5" />
            {currentDate}
          </div>

          {/* Time */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-[11px] font-mono" style={{ borderColor: C.border, color: C.textSec, background: 'rgba(255,255,255,0.02)' }}>
            <Clock className="h-3 w-3" style={{ color: C.textDim }} />
            {currentTime}
          </div>
        </header>

        {/* ─── Page Content ─── */}
        <main className="flex-1 p-4 md:p-5 lg:p-6">
          {renderPage(activePage)}
        </main>
      </div>
    </div>
  )
}

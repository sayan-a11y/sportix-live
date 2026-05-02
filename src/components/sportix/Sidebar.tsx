'use client'

import { useAppStore } from '@/lib/store'
import {
  Home, Radio, Trophy, Calendar, Award, Flame,
  Heart, ListVideo, Settings, Crown, ChevronRight
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'live', label: 'Live Now', icon: Radio },
  { id: 'sports', label: 'Sports', icon: Trophy },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'leagues', label: 'Leagues', icon: Award },
  { id: 'highlights', label: 'Highlights', icon: Flame },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'mylist', label: 'My List', icon: ListVideo },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const { currentView } = useAppStore()

  if (currentView !== 'home') return null

  return (
    <aside className="hidden lg:flex flex-col w-[220px] flex-shrink-0 border-r border-white/[0.06] bg-[#080c16]/50">
      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = item.id === 'home'
          return (
            <button
              key={item.id}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#00ff88]/[0.08] text-[#00ff88] shadow-sm shadow-[#00ff88]/5'
                  : 'text-white/45 hover:bg-white/[0.03] hover:text-white/70'
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Go Premium CTA */}
      <div className="p-3">
        <div className="rounded-xl border border-[#00ff88]/10 bg-gradient-to-br from-[#00ff88]/[0.06] to-transparent p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-[#00ff88]" />
            <span className="text-sm font-semibold text-white">Go Premium</span>
          </div>
          <p className="text-[11px] leading-relaxed text-white/35 mb-3">
            Watch ad-free with 4K quality, exclusive content & more.
          </p>
          <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#00ff88] px-3 py-2 text-xs font-bold text-[#02040a] transition-all hover:bg-[#00dd75] active:scale-[0.97]">
            Upgrade Now
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}

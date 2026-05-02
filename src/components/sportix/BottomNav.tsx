'use client'

import { Home, Tv, Trophy, Flame, MoreHorizontal } from 'lucide-react'
import { useAppStore } from '@/lib/store'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'live', label: 'Live', icon: Tv },
  { id: 'sports', label: 'Sports', icon: Trophy },
  { id: 'highlights', label: 'Highlights', icon: Flame },
  { id: 'more', label: 'More', icon: MoreHorizontal },
]

export default function BottomNav() {
  const { currentView } = useAppStore()

  if (currentView !== 'home') return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-[#0a0e1a]/95 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around py-1.5 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = item.id === 'home'
          return (
            <button
              key={item.id}
              className={`relative flex flex-col items-center gap-0.5 rounded-lg px-4 py-1.5 transition-all duration-150 touch-active ${
                isActive
                  ? 'text-[#00ff88]'
                  : 'text-white/30 hover:text-white/50'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'drop-shadow-[0_0_6px_rgba(0,255,136,0.4)]' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-1.5 h-[3px] w-5 rounded-full bg-[#00ff88]" />
              )}
            </button>
          )
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}

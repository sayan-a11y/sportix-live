'use client'

import { Home, Tv, Trophy, Bookmark, User } from 'lucide-react'
import { useAppStore } from '@/lib/store'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'live', label: 'Live', icon: Tv },
  { id: 'sports', label: 'Sports', icon: Trophy },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'profile', label: 'Profile', icon: User },
]

export default function BottomNav() {
  const { currentView } = useAppStore()

  if (currentView !== 'home') return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#02040a]/90 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around py-2 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = item.id === 'home'
          return (
            <button
              key={item.id}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200 touch-active ${
                isActive
                  ? 'text-[#00ff88]'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-[#00ff88]" />
              )}
            </button>
          )
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}

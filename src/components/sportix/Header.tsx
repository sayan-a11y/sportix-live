'use client'

import { useAppStore } from '@/lib/store'
import { Search, Bell, Crown, Menu, X } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'

export default function Header() {
  const { currentView, setCurrentView, incrementLogoClicks, resetLogoClicks, isAdminUnlocked } = useAppStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleLogoClick = useCallback(() => {
    incrementLogoClicks()
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      resetLogoClicks()
    }, 3000)
  }, [incrementLogoClicks, resetLogoClicks])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  if (currentView === 'admin') return null

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#02040a]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 transition-all duration-200 hover:opacity-80 active:scale-95 touch-active"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00ff88]/10 ring-1 ring-[#00ff88]/20">
              <img src="/logos/sportix-logo.png" alt="Sportix" className="h-7 w-7 rounded-lg object-cover" />
            </div>
            <span className="hidden text-lg font-bold tracking-tight text-white sm:block">
              Sport<span className="text-[#00ff88]">ix</span>
            </span>
          </button>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-4">
          {searchOpen ? (
            <div className="flex items-center gap-2 animate-in fade-in-up duration-200">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search matches, highlights..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-[#00ff88]/30 focus:outline-none focus:ring-1 focus:ring-[#00ff88]/20 backdrop-blur-sm"
                  autoFocus
                  onBlur={() => {
                    if (!searchQuery) setSearchOpen(false)
                  }}
                />
              </div>
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                className="rounded-lg p-2 text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden w-full items-center gap-3 rounded-xl border border-white/5 bg-white/3 px-4 py-2 text-sm text-white/30 transition-all hover:bg-white/5 hover:border-white/10 md:flex"
            >
              <Search className="h-4 w-4" />
              <span>Search matches, highlights...</span>
              <kbd className="ml-auto hidden rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/20 lg:block">⌘K</kbd>
            </button>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-xl p-2.5 text-white/50 transition-all hover:bg-white/5 hover:text-white md:hidden"
          >
            <Search className="h-5 w-5" />
          </button>
          <button className="relative rounded-xl p-2.5 text-white/50 transition-all hover:bg-white/5 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#00ff88] ring-2 ring-[#02040a]" />
          </button>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 transition-all hover:bg-white/5">
            <Crown className="h-4 w-4 text-[#00ff88]" />
            <span className="hidden sm:inline">Premium</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#00ff88]/30 to-[#00ff88]/5 ring-1 ring-[#00ff88]/20 cursor-pointer transition-all hover:ring-[#00ff88]/40" />
        </div>
      </div>
    </header>
  )
}

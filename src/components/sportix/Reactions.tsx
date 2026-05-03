'use client'
import { useState, useEffect } from 'react'
import { Heart, ThumbsUp, Flame, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const REACTION_TYPES = [
  { type: 'like', icon: ThumbsUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { type: 'heart', icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' },
  { type: 'fire', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { type: 'zap', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
]

export default function Reactions({ streamId }: { streamId: string }) {
  const [counts, setCounts] = useState<Record<string, number>>({
    like: 0, heart: 0, fire: 0, zap: 0
  })
  const [lastReaction, setLastReaction] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // 1. Fetch initial counts
    const fetchCounts = async () => {
      const { data, error } = await supabase
        .from('Reaction')
        .select('type')
        .eq('streamId', streamId)
      
      if (data) {
        const newCounts: Record<string, number> = { like: 0, heart: 0, fire: 0, zap: 0 }
        data.forEach(r => {
          if (newCounts[r.type] !== undefined) newCounts[r.type]++
        })
        setCounts(newCounts)
      }
    }

    fetchCounts()

    // 2. Subscribe to new reactions
    const channel = supabase
      .channel(`reactions-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Reaction',
          filter: `streamId=eq.${streamId}`,
        },
        (payload) => {
          const type = payload.new.type
          setCounts(prev => ({
            ...prev,
            [type]: (prev[type] || 0) + 1
          }))
          
          // Animation trigger for others
          showFloatingReaction(type)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [streamId])

  const sendReaction = async (type: string) => {
    setLastReaction(type)
    setTimeout(() => setLastReaction(null), 1000)
    
    showFloatingReaction(type)

    const { error } = await supabase.from('Reaction').insert([
      { streamId, type }
    ])

    if (error) console.error('Error sending reaction:', error.message)
  }

  const showFloatingReaction = (type: string) => {
    const emoji = type === 'like' ? '👍' : type === 'heart' ? '❤️' : type === 'fire' ? '🔥' : '⚡'
    const el = document.createElement('div')
    el.innerText = emoji
    el.className = 'fixed pointer-events-none text-2xl animate-float-up z-[60]'
    
    // Random position at bottom of player area
    const container = document.getElementById('video-container')
    if (container) {
      const rect = container.getBoundingClientRect()
      el.style.left = `${rect.left + Math.random() * rect.width}px`
      el.style.top = `${rect.bottom - 40}px`
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 2000)
    }
  }

  return (
    <div className="flex items-center gap-2 py-2">
      {REACTION_TYPES.map((rt) => {
        const Icon = rt.icon
        return (
          <button
            key={rt.type}
            onClick={() => sendReaction(rt.type)}
            className={`group relative flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all active:scale-90 ${rt.bg} ${rt.color} ${
              lastReaction === rt.type ? 'ring-2 ring-white/20' : ''
            }`}
          >
            <Icon className={`h-4 w-4 ${lastReaction === rt.type ? 'animate-bounce' : ''}`} />
            <span className="text-xs font-bold">{counts[rt.type]}</span>
            
            {/* Tooltip */}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded bg-black/80 px-2 py-1 text-[10px] text-white transition-all group-hover:scale-100 capitalize">
              {rt.type}
            </span>
          </button>
        )
      })}
    </div>
  )
}

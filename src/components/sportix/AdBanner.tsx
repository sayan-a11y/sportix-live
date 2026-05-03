'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'

interface Ad {
  id: string
  type: string
  sportType: string
  url: string
  redirectLink?: string
}

interface AdBannerProps {
  sportType?: string
  frequencyControl?: boolean
}

export default function AdBanner({ sportType = 'all', frequencyControl = false }: AdBannerProps) {
  const [ad, setAd] = useState<Ad | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [hasClicked, setHasClicked] = useState(false)
  const impressionLoggedRef = useRef(false)
  const supabase = createClient()

  useEffect(() => {
    if (frequencyControl) {
      const shownAt = sessionStorage.getItem(`ad_shown_${sportType}`)
      if (shownAt) {
        setIsVisible(false)
        return
      }
    }

    const fetchAd = async () => {
      const { data } = await supabase
        .from('Ad')
        .select('*')
        .eq('type', 'banner')
        .eq('active', true)
        .or(`sportType.eq.${sportType},sportType.eq.all`)
      
      if (data && data.length > 0) {
        const randomAd = data[Math.floor(Math.random() * data.length)]
        setAd(randomAd)
        
        if (frequencyControl) {
          sessionStorage.setItem(`ad_shown_${sportType}`, Date.now().toString())
        }
      }
    }

    fetchAd()
  }, [sportType, frequencyControl])

  // Impression Tracking
  useEffect(() => {
    if (ad && isVisible && !impressionLoggedRef.current) {
      const logImpression = async () => {
        try {
          // Check session storage to avoid double impression
          if (!sessionStorage.getItem(`ad_seen_${ad.id}`)) {
            await fetch('/api/ads/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ adId: ad.id, action: 'impression' })
            })
            sessionStorage.setItem(`ad_seen_${ad.id}`, '1')
          }
          impressionLoggedRef.current = true
        } catch (err) {
          console.error('Failed to log impression:', err)
        }
      }
      logImpression()
    }
  }, [ad, isVisible])

  const handleAdClick = async () => {
    if (!ad || hasClicked) return
    setHasClicked(true)

    try {
      await fetch('/api/ads/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id, action: 'click' })
      })
      
      if (ad.redirectLink) {
        window.open(ad.redirectLink, '_blank', 'noopener,noreferrer')
      }
    } catch (err) {
      console.error('Failed to log click:', err)
    }
  }

  if (!ad || !isVisible) return null

  return (
    <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
      <button 
        onClick={(e) => {
          e.stopPropagation()
          setIsVisible(false)
        }}
        className="absolute top-2 right-2 z-10 rounded-full bg-black/60 p-1 text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" />
      </button>
      
      <div onClick={handleAdClick} className="block cursor-pointer">
        <img 
          src={ad.url} 
          alt="Advertisement" 
          className="w-full h-auto max-h-[120px] object-cover transition-transform hover:scale-[1.01]"
        />
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-[8px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">
          <span className="h-1 w-1 rounded-full bg-[#00ff88]/40 animate-pulse" />
          Sponsored
        </div>
      </div>
    </div>
  )
}

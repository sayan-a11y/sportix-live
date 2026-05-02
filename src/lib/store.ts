import { create } from 'zustand'

export type PageView = 'home' | 'player' | 'admin'

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
  isFeatured: boolean
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
}

interface ChatMsg {
  id: string
  streamId: string
  username: string
  message: string
  isHighlighted?: boolean
  isAdmin?: boolean
  createdAt: string
}

interface AppState {
  // Navigation
  currentView: PageView
  setCurrentView: (view: PageView) => void
  selectedStream: StreamData | null
  setSelectedStream: (stream: StreamData | null) => void
  selectedVideo: VideoData | null
  setSelectedVideo: (video: VideoData | null) => void

  // Admin
  isAdminUnlocked: boolean
  setAdminUnlocked: (v: boolean) => void
  logoClickCount: number
  incrementLogoClicks: () => void
  resetLogoClicks: () => void

  // Chat
  chatMessages: ChatMsg[]
  setChatMessages: (msgs: ChatMsg[]) => void
  addChatMessage: (msg: ChatMsg) => void
  removeChatMessage: (id: string) => void
  highlightChatMessage: (id: string) => void

  // Live viewer sync
  liveViewers: Record<string, number>
  updateViewerCount: (streamId: string, count: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'home',
  setCurrentView: (view) => set({ currentView: view }),
  selectedStream: null,
  setSelectedStream: (stream) => set({ selectedStream: stream }),
  selectedVideo: null,
  setSelectedVideo: (video) => set({ selectedVideo: video }),

  // Admin
  isAdminUnlocked: false,
  setAdminUnlocked: (v) => set({ isAdminUnlocked: v }),
  logoClickCount: 0,
  incrementLogoClicks: () =>
    set((state) => {
      const newCount = state.logoClickCount + 1
      if (newCount >= 7) {
        return { logoClickCount: 0, isAdminUnlocked: true, currentView: 'admin' }
      }
      return { logoClickCount: newCount }
    }),
  resetLogoClicks: () => set({ logoClickCount: 0 }),

  // Chat
  chatMessages: [],
  setChatMessages: (msgs) => set({ chatMessages: msgs }),
  addChatMessage: (msg) =>
    set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  removeChatMessage: (id) =>
    set((state) => ({
      chatMessages: state.chatMessages.filter((m) => m.id !== id),
    })),
  highlightChatMessage: (id) =>
    set((state) => ({
      chatMessages: state.chatMessages.map((m) =>
        m.id === id ? { ...m, isHighlighted: true } : m
      ),
    })),

  // Live viewer sync
  liveViewers: {},
  updateViewerCount: (streamId, count) =>
    set((state) => ({
      liveViewers: { ...state.liveViewers, [streamId]: count },
    })),
}))

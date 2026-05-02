import { useState, useEffect } from 'react'
import { Video, Upload, Trash2, Eye, Search, Filter, Play, Check, X, Clock, Info } from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface VideoData {
  id: string
  title: string
  description?: string
  thumbnail?: string
  duration: number
  category: string
  views: number
  isFeatured: boolean
  videoUrl?: string
  createdAt: string
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // New video form
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    category: 'highlights',
    isFeatured: false,
    file: null as File | null,
  })

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/videos')
      const data = await res.json()
      setVideos(data)
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewVideo({ ...newVideo, file: e.target.files[0], title: newVideo.title || e.target.files[0].name.split('.')[0] })
    }
  }

  const handleUpload = async () => {
    if (!newVideo.file || !newVideo.title) return

    setUploading(true)
    setUploadProgress(10)

    try {
      // 1. Get presigned URL
      const res = await fetch('/api/admin/videos/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: newVideo.file.name,
          contentType: newVideo.file.type,
        }),
      })

      const { uploadUrl, publicUrl, key } = await res.json()

      if (!uploadUrl) throw new Error('Failed to get upload URL')

      setUploadProgress(30)

      // 2. Upload to R2
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: newVideo.file,
        headers: { 'Content-Type': newVideo.file.type },
      })

      if (!uploadRes.ok) throw new Error('Failed to upload to R2')

      setUploadProgress(70)

      // 3. Save to database
      const saveRes = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newVideo.title,
          description: newVideo.description,
          category: newVideo.category,
          isFeatured: newVideo.isFeatured,
          videoUrl: publicUrl,
          duration: 0, // Should be extracted ideally
        }),
      })

      if (!saveRes.ok) throw new Error('Failed to save to DB')

      setUploadProgress(100)
      setTimeout(() => {
        setUploading(false)
        setShowUploadModal(false)
        setNewVideo({ title: '', description: '', category: 'highlights', isFeatured: false, file: null })
        fetchVideos()
      }, 500)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Check console for details.')
      setUploading(false)
    }
  }

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <Video className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Video Library</h2>
            <p className="text-sm text-white/40">Manage your R2 video content</p>
          </div>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-cyan-600 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95"
        >
          <Upload className="h-4 w-4" /> Upload Video
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Videos', value: videos.length, icon: Video, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
          { label: 'Total Views', value: videos.reduce((acc, v) => acc + v.views, 0).toLocaleString(), icon: Eye, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Storage Used', value: '~1.2 GB', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Active Tasks', value: '0', icon: Info, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">{stat.label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
          <input 
            type="text" 
            placeholder="Search videos by title or category..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/[0.05]">
          <Filter className="h-4 w-4" /> Filter
        </button>
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500/20 border-t-cyan-500" />
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
          <div className="mb-4 rounded-full bg-white/[0.03] p-6 text-white/10">
            <Video className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-bold text-white/60">No videos found</h3>
          <p className="mt-1 text-sm text-white/30">Upload your first video to start building your library</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filteredVideos.map((video) => (
            <div key={video.id} className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all hover:border-white/10 hover:bg-white/[0.04]">
              <div className="relative aspect-video overflow-hidden bg-black/40">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white/10">
                    <Play className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-mono text-white">
                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{video.title}</h4>
                  <span className="flex-shrink-0 rounded-md bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-500">{video.category}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3">
                  <div className="flex items-center gap-3 text-[10px] text-white/30">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {video.views}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="rounded-lg p-1.5 text-white/30 hover:bg-white/10 hover:text-white" title="Preview"><Eye className="h-3.5 w-3.5" /></button>
                    <button className="rounded-lg p-1.5 text-white/30 hover:bg-white/10 hover:text-red-500" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !uploading && setShowUploadModal(false)} />
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#121212] p-6 shadow-2xl overflow-hidden">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Upload New Video</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
                className="rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Video Title</label>
                <input 
                  type="text" 
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  placeholder="Enter a descriptive title..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-cyan-500/50 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Category</label>
                  <select 
                    value={newVideo.category}
                    onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none appearance-none"
                  >
                    <option value="highlights">Highlights</option>
                    <option value="full-match">Full Match</option>
                    <option value="interviews">Interviews</option>
                    <option value="analysis">Analysis</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer py-2.5">
                    <input 
                      type="checkbox" 
                      checked={newVideo.isFeatured}
                      onChange={(e) => setNewVideo({ ...newVideo, isFeatured: e.target.checked })}
                      className="h-4 w-4 rounded border-white/10 bg-white/10 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-xs font-medium text-white/60">Featured Video</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Description (Optional)</label>
                <textarea 
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                  placeholder="Add a short description..."
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-cyan-500/50 focus:outline-none resize-none"
                />
              </div>

              <div className="relative group">
                <input 
                  type="file" 
                  id="video-file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden" 
                />
                <label 
                  htmlFor="video-file"
                  className="flex flex-col items-center justify-center gap-3 py-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02] cursor-pointer group-hover:bg-white/[0.04] group-hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">
                      {newVideo.file ? newVideo.file.name : 'Click to select or drag & drop'}
                    </p>
                    <p className="text-[10px] text-white/30 mt-1">MP4, WEBM or MOV (Max 500MB)</p>
                  </div>
                </label>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-white/40">
                    <span>Uploading to Cloudflare R2...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div 
                      className="h-full bg-cyan-500 transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button 
                  onClick={handleUpload}
                  disabled={uploading || !newVideo.file || !newVideo.title}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-sm font-bold text-white transition-all hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" /> Start Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

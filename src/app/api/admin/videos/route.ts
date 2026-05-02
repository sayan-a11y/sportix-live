import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, thumbnail, duration, category, videoUrl, isFeatured } = body

    if (!title || !videoUrl) {
      return NextResponse.json({ error: 'Missing title or video URL' }, { status: 400 })
    }

    const video = await db.video.create({
      data: {
        title,
        description,
        thumbnail: thumbnail || `https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2070&auto=format&fit=crop`, // Placeholder
        duration: duration || 0,
        category: category || 'highlights',
        videoUrl,
        isFeatured: !!isFeatured,
      },
    })

    return NextResponse.json(video)
  } catch (error: any) {
    console.error('Failed to create video:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

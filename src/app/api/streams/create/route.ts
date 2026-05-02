import { NextResponse } from 'next/server'
import { muxClient } from '@/lib/mux'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { title, description, category, homeTeam, awayTeam } = await req.json()

    // 1. Create a live stream in Mux
    const liveStream = await muxClient.liveStreams.create({
      playback_policy: ['public'],
      new_asset_settings: { playback_policy: ['public'] },
      test: true, // Use test mode initially
    })

    // 2. Save stream info to database
    const stream = await db.stream.create({
      data: {
        title: title || 'New Live Stream',
        description: description || '',
        category: category || 'football',
        rtmpUrl: 'rtmps://global-live.mux.com:443/app', 
        streamKey: liveStream.stream_key,
        status: 'offline',
        homeTeam: homeTeam || 'Team A',
        awayTeam: awayTeam || 'Team B',
      },
    })

    return NextResponse.json(stream)
  } catch (error: any) {
    console.error('Error creating stream:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

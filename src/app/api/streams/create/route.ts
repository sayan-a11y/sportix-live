import { NextResponse } from 'next/server'
import { muxClient } from '@/lib/mux'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { title, description, category, homeTeam, awayTeam } = await req.json()
    const serverIp = process.env.NEXT_PUBLIC_STREAM_SERVER_IP

    let streamData: any = {
      title: title || 'New Live Stream',
      description: description || '',
      category: category || 'football',
      status: 'offline',
      homeTeam: homeTeam || 'Team A',
      awayTeam: awayTeam || 'Team B',
    }

    if (serverIp) {
      // 1. FREE VPS Setup (Node Media Server)
      const streamKey = `stream_${Math.random().toString(36).substring(2, 10)}`
      streamData = {
        ...streamData,
        rtmpUrl: `rtmp://${serverIp}/live`,
        streamKey: streamKey,
        playbackId: `http://${serverIp}:8000/live/${streamKey}.m3u8`, // Store full URL in playbackId for FREE mode
      }
    } else {
      // 2. Mux Setup (Paid/Test)
      const liveStream = await muxClient.liveStreams.create({
        playback_policy: ['public'],
        new_asset_settings: { playback_policy: ['public'] },
        test: true,
      })

      streamData = {
        ...streamData,
        rtmpUrl: 'rtmps://global-live.mux.com:443/app',
        streamKey: liveStream.stream_key,
        playbackId: liveStream.playback_ids?.[0]?.id,
      }
    }

    // Save to database
    const stream = await db.stream.create({
      data: streamData,
    })

    return NextResponse.json(stream)
  } catch (error: any) {
    console.error('Error creating stream:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

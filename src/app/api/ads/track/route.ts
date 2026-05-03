import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { adId, action } = await req.json()

    if (!adId || !['impression', 'click'].includes(action)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const updateData = action === 'impression' 
      ? { impressions: { increment: 1 } }
      : { clicks: { increment: 1 } }

    await db.adStats.upsert({
      where: { adId },
      update: {
        ...updateData,
        updatedAt: new Date(),
      },
      create: {
        adId,
        impressions: action === 'impression' ? 1 : 0,
        clicks: action === 'click' ? 1 : 0,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ad tracking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

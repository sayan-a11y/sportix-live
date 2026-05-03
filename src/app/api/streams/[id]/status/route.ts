import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json()
    const { id } = params

    const updateData: any = { status }

    if (status === 'live') {
      updateData.startTime = new Date()
    } else if (status === 'offline') {
      updateData.endedAt = new Date()
    }

    const stream = await db.stream.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(stream)
  } catch (error: any) {
    console.error('Error updating stream status:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

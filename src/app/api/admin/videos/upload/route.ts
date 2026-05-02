import { NextResponse } from 'next/server'
import { getUploadUrl } from '@/lib/r2'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileName, contentType } = await request.json()

    if (!fileName || !contentType) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const key = `videos/${Date.now()}-${fileName}`
    const uploadUrl = await getUploadUrl(key, contentType)
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`

    return NextResponse.json({ uploadUrl, publicUrl, key })
  } catch (error: any) {
    console.error('R2 Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

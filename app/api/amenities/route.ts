import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabaseAdminClient' // uses service_role key

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('amenities')
    .select('id, name, order_index')
    .order('order_index', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    const { orderedIds } = await request.json()
    if (!Array.isArray(orderedIds)) {
      return NextResponse.json(
        { error: 'Invalid input, orderedIds must be an array' },
        { status: 400 }
      )
    }

    const updates = orderedIds.map((id: number, index: number) =>
      supabaseAdmin.from('amenities').update({ order_index: index }).eq('id', id)
    )

    const results = await Promise.all(updates)

    for (const res of results) {
      if (res.error) {
        return NextResponse.json({ error: res.error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, name } = await request.json()

    if (!id || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: id and name are required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('amenities')
      .update({ name })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

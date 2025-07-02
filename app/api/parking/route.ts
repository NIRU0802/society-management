import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabaseAdminClient'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('parking')
    .select('*')
    .order('slot_number')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { slotId, isOccupied, userId, name } = body

    if (typeof slotId !== 'number' || typeof isOccupied !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request. slotId and isOccupied are required.' },
        { status: 400 }
      )
    }

    const updatePayload: any = {
      is_occupied: isOccupied,
      updated_by: userId || null,
      booked_by_name: isOccupied ? name || null : null, // Set name on booking, clear on unbooking
    }

    const { data, error } = await supabaseAdmin
      .from('parking')
      .update(updatePayload)
      .eq('id', slotId)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, updated: data })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

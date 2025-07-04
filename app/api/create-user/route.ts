import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function isSuperAdmin(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  return !error && data?.role === 'superadmin'
}

export async function GET() {
  const { data, error } = await supabase
    .from('users')
    .select('id, email')
    .eq('role', 'manager')

  if (error) {
    console.error('Error fetching managers:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ managers: data }, { status: 200 })
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError && createError.message.includes('already been registered')) {
    const { data, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    const existingUser = data?.users?.find((user) => user.email === email)

    if (existingUser) {
      const exists = await supabase
        .from('users')
        .select('id')
        .eq('id', existingUser.id)
        .maybeSingle()

      if (!exists.data) {
        await supabase
          .from('users')
          .insert([{ id: existingUser.id, email, role: 'manager' }])
      }

      return NextResponse.json(
        { message: 'User already existed and added to manager list.' },
        { status: 200 }
      )
    }

    return NextResponse.json({ error: 'User exists in Auth but not found.' }, { status: 500 })
  }

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 })
  }

  const { id } = user.user!
  const { error: dbError } = await supabase
    .from('users')
    .insert([{ id, email, role: 'manager' }])

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Manager created successfully' }, { status: 200 })
}

export async function DELETE(req: NextRequest) {
  const { id, requesterId } = await req.json()

  if (!id || !requesterId) {
    return NextResponse.json({ error: 'User ID and requester ID required' }, { status: 400 })
  }

  const isSuper = await isSuperAdmin(requesterId)
  if (!isSuper) {
    return NextResponse.json({ error: 'Only superadmin can delete managers' }, { status: 403 })
  }

  const { error: authError } = await supabase.auth.admin.deleteUser(id)
  if (authError) {
    return NextResponse.json({ error: 'Failed to delete from Supabase Auth' }, { status: 500 })
  }

  const { error: dbError } = await supabase
    .from('users')
    .delete()
    .eq('id', id)

  if (dbError) {
    return NextResponse.json({ error: 'Deleted from Auth, but DB deletion failed' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Manager deleted successfully' }, { status: 200 })
}

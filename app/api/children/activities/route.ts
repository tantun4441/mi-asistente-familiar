import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('activities')
    .insert({
      child_id: body.child_id,
      name: body.name,
      day_of_week: body.day_of_week,
      time: body.time || null,
      location: body.location || null,
      notes: body.notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

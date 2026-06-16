import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { addEventToCalendar } from '@/lib/calendar'

export async function GET() {
  const { data, error } = await supabase
    .from('events')
    .select('*, children(name, color)')
    .order('event_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      child_id: body.child_id || null,
      title: body.title,
      description: body.description || '',
      event_date: body.event_date,
      event_time: body.event_time || null,
      notes: body.notes || null,
      needs_to_bring: body.needs_to_bring || null,
      dress_code: body.dress_code || null,
      source: body.source || 'manual',
    })
    .select('*, children(name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const childName = event.children?.name
  const calendarUid = await addEventToCalendar(event, childName)

  if (calendarUid) {
    await supabase.from('events').update({ calendar_uid: calendarUid }).eq('id', event.id)
  }

  return NextResponse.json(event)
}

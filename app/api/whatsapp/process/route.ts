import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { parseWhatsAppMessage } from '@/lib/claude'
import { addEventToCalendar } from '@/lib/calendar'

export async function POST(request: Request) {
  const body = await request.json()
  const { message, from, groupName } = body

  const secret = request.headers.get('x-bot-secret')
  if (secret !== process.env.BOT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: children } = await supabase.from('children').select('name')
  const childrenNames = children?.map((c) => c.name) || []

  const parsed = await parseWhatsAppMessage(message, childrenNames)
  if (!parsed) {
    return NextResponse.json({ message: 'No event found in message' })
  }

  let childId = null
  if (parsed.child_name) {
    const { data: child } = await supabase
      .from('children')
      .select('id, name')
      .ilike('name', `%${parsed.child_name}%`)
      .single()
    if (child) childId = child.id
  }

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      child_id: childId,
      title: parsed.title,
      description: `${parsed.description}\n\nFuente: ${groupName || from}`,
      event_date: parsed.event_date,
      event_time: parsed.event_time,
      notes: parsed.notes,
      needs_to_bring: parsed.needs_to_bring,
      dress_code: parsed.dress_code,
      source: 'whatsapp',
    })
    .select('*, children(name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const calendarUid = await addEventToCalendar(event, event.children?.name)
  if (calendarUid) {
    await supabase.from('events').update({ calendar_uid: calendarUid }).eq('id', event.id)
  }

  return NextResponse.json({ success: true, event })
}

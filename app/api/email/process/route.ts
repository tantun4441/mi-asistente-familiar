import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'
import { addEventToCalendar } from '@/lib/calendar'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const secret = request.headers.get('x-bot-secret')
  if (secret !== process.env.BOT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { subject, from, body, date } = await request.json()

  const { data: children } = await supabase.from('children').select('id, name')
  const { data: existingEvents } = await supabase.from('events').select('id, title, event_date, event_time, child_id')

  const childrenList = children?.map(c => c.name).join(', ') || ''
  const eventsList = existingEvents?.map(e => `- ID:${e.id} | ${e.title} | ${e.event_date} ${e.event_time || ''}`).join('\n') || 'Ninguno'

  const today = new Date().toISOString().split('T')[0]

  const prompt = `Eres un asistente familiar. Analiza este email y determina si hay un cambio de horario, cancelación, o nuevo evento para actividades de los hijos.

Hijos registrados: ${childrenList}

Eventos existentes en el sistema:
${eventsList}

Email recibido:
De: ${from}
Asunto: ${subject}
Fecha: ${date}
Cuerpo: ${body}

Hoy es: ${today}

Responde SOLO con JSON, sin texto adicional:

Si es un CAMBIO de horario de un evento existente:
{
  "action": "update",
  "event_id": "ID del evento a actualizar",
  "title": "título del evento",
  "new_date": "YYYY-MM-DD o null si no cambia",
  "new_time": "HH:MM o null si no cambia",
  "notes": "descripción del cambio"
}

Si es un evento NUEVO:
{
  "action": "create",
  "title": "título",
  "event_date": "YYYY-MM-DD",
  "event_time": "HH:MM o null",
  "child_name": "nombre del hijo o null",
  "needs_to_bring": "qué llevar o null",
  "dress_code": "vestimenta o null",
  "notes": "notas"
}

Si es una CANCELACIÓN:
{
  "action": "cancel",
  "event_id": "ID del evento a cancelar",
  "title": "título del evento",
  "notes": "razón de cancelación"
}

Si el email NO tiene información relevante de agenda:
{
  "action": "none"
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}'

  let parsed: any
  try {
    parsed = JSON.parse(text)
  } catch {
    return NextResponse.json({ action: 'none' })
  }

  if (parsed.action === 'none') {
    return NextResponse.json({ action: 'none' })
  }

  if (parsed.action === 'update' && parsed.event_id) {
    const updates: any = { notes: `Actualizado automáticamente por email de ${from}.\n${parsed.notes || ''}` }
    if (parsed.new_date) updates.event_date = parsed.new_date
    if (parsed.new_time) updates.event_time = parsed.new_time

    await supabase.from('events').update(updates).eq('id', parsed.event_id)

    const { data: updatedEvent } = await supabase
      .from('events')
      .select('*, children(name)')
      .eq('id', parsed.event_id)
      .single()

    if (updatedEvent) {
      const calUid = await addEventToCalendar(updatedEvent, updatedEvent.children?.name)
      if (calUid) await supabase.from('events').update({ calendar_uid: calUid }).eq('id', parsed.event_id)
    }

    return NextResponse.json({ action: 'update', title: parsed.title })
  }

  if (parsed.action === 'create') {
    let childId = null
    if (parsed.child_name) {
      const child = children?.find(c => c.name.toLowerCase().includes(parsed.child_name.toLowerCase()))
      if (child) childId = child.id
    }

    const { data: newEvent } = await supabase.from('events').insert({
      child_id: childId,
      title: parsed.title,
      description: `Detectado automáticamente de email de ${from}`,
      event_date: parsed.event_date,
      event_time: parsed.event_time || null,
      needs_to_bring: parsed.needs_to_bring || null,
      dress_code: parsed.dress_code || null,
      notes: parsed.notes || null,
      source: 'manual',
    }).select('*, children(name)').single()

    if (newEvent) {
      const calUid = await addEventToCalendar(newEvent, newEvent.children?.name)
      if (calUid) await supabase.from('events').update({ calendar_uid: calUid }).eq('id', newEvent.id)
    }

    return NextResponse.json({ action: 'create', title: parsed.title })
  }

  if (parsed.action === 'cancel' && parsed.event_id) {
    await supabase.from('events').update({
      notes: `CANCELADO — ${parsed.notes || ''}\nEmail de ${from}`,
      title: `[CANCELADO] ${parsed.title}`,
    }).eq('id', parsed.event_id)

    return NextResponse.json({ action: 'cancel', title: parsed.title })
  }

  return NextResponse.json({ action: 'none' })
}

import Anthropic from '@anthropic-ai/sdk'
import { ParsedEvent } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function parseWhatsAppMessage(
  message: string,
  childrenNames: string[]
): Promise<ParsedEvent | null> {
  const today = new Date().toISOString().split('T')[0]

  const prompt = `Eres un asistente que analiza mensajes de WhatsApp de grupos escolares, de ballet, fútbol y sinagoga para una familia con 6 hijos.

Los hijos se llaman: ${childrenNames.join(', ')}.

Analiza este mensaje y extrae la información del evento si existe uno. Si no hay evento, responde con null.

Mensaje: "${message}"

Fecha de hoy: ${today}

Responde SOLO con un JSON con esta estructura exacta (sin texto adicional):
{
  "title": "título del evento",
  "description": "descripción completa",
  "event_date": "YYYY-MM-DD",
  "event_time": "HH:MM o null",
  "notes": "notas adicionales o null",
  "needs_to_bring": "qué necesitan llevar o null",
  "dress_code": "cómo vestirse o null",
  "child_name": "nombre del hijo a quien aplica o null si es para todos"
}

Si no hay evento claro en el mensaje, responde exactamente: null`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : null
  if (!text || text === 'null') return null

  try {
    return JSON.parse(text) as ParsedEvent
  } catch {
    return null
  }
}

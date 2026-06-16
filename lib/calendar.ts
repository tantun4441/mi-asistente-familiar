import { DAVClient } from 'tsdav'
import { v4 as uuidv4 } from 'uuid'
import { Event } from '@/types'

function formatDateToICS(date: string, time: string | null): string {
  const d = date.replace(/-/g, '')
  if (time) {
    const t = time.replace(':', '') + '00'
    return `${d}T${t}00`
  }
  return d
}

export async function addEventToCalendar(event: Event, childName?: string): Promise<string | null> {
  const username = process.env.ICLOUD_EMAIL!
  const password = process.env.ICLOUD_APP_PASSWORD!

  try {
    const client = new DAVClient({
      serverUrl: 'https://caldav.icloud.com',
      credentials: { username, password },
      authMethod: 'Basic',
      defaultAccountType: 'caldav',
    })

    await client.login()
    const calendars = await client.fetchCalendars()
    const calendar = calendars[0]

    const uid = uuidv4()
    const startDate = formatDateToICS(event.event_date, event.event_time)
    const endDate = startDate
    const isAllDay = !event.event_time

    let description = event.description || ''
    if (event.needs_to_bring) description += `\n\nLlevar: ${event.needs_to_bring}`
    if (event.dress_code) description += `\n\nVestimenta: ${event.dress_code}`
    if (event.notes) description += `\n\nNotas: ${event.notes}`

    const summary = childName ? `[${childName}] ${event.title}` : event.title

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Mi Asistente Familiar//ES',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      isAllDay ? `DTSTART;VALUE=DATE:${startDate}` : `DTSTART:${startDate}`,
      isAllDay ? `DTEND;VALUE=DATE:${endDate}` : `DTEND:${endDate}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      `DESCRIPTION:Recordatorio: ${summary}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    await client.createCalendarObject({
      calendar,
      filename: `${uid}.ics`,
      iCalString: icsContent,
    })

    return uid
  } catch (error) {
    console.error('Error adding to calendar:', error)
    return null
  }
}

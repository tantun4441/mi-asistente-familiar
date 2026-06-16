export interface Child {
  id: string
  name: string
  color: string
  activities: Activity[]
  created_at: string
}

export interface Activity {
  id: string
  child_id: string
  name: string
  day_of_week: string
  time: string
  location: string
  notes: string
}

export interface Event {
  id: string
  child_id: string | null
  title: string
  description: string
  event_date: string
  event_time: string | null
  notes: string | null
  needs_to_bring: string | null
  dress_code: string | null
  source: 'whatsapp' | 'manual'
  calendar_uid: string | null
  created_at: string
}

export interface ParsedEvent {
  title: string
  description: string
  event_date: string
  event_time: string | null
  notes: string | null
  needs_to_bring: string | null
  dress_code: string | null
  child_name: string | null
}

'use client'
import { useEffect, useState } from 'react'
import { Event, Child } from '@/types'

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', event_date: '', event_time: '',
    child_id: '', needs_to_bring: '', dress_code: '', notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [filterChild, setFilterChild] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [eventsData, childrenData] = await Promise.all([
      fetch('/api/events').then(r => r.json()),
      fetch('/api/children').then(r => r.json()),
    ])
    setEvents(Array.isArray(eventsData) ? eventsData : [])
    setChildren(Array.isArray(childrenData) ? childrenData : [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ title: '', description: '', event_date: '', event_time: '', child_id: '', needs_to_bring: '', dress_code: '', notes: '' })
    setShowForm(false)
    setSaving(false)
    loadData()
  }

  const filtered = events.filter(e => !filterChild || (e as any).child_id === filterChild || (filterChild === 'todos' && !(e as any).child_id))
  const today = new Date().toISOString().split('T')[0]
  const past = filtered.filter(e => e.event_date < today)
  const upcoming = filtered.filter(e => e.event_date >= today)

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-slate-400">Cargando...</p></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Todos los eventos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + Agregar evento
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterChild('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium ${!filterChild ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          Todos
        </button>
        {children.map(child => (
          <button
            key={child.id}
            onClick={() => setFilterChild(child.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${filterChild === child.id ? 'text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
            style={filterChild === child.id ? { backgroundColor: child.color } : {}}
          >
            {child.name}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Nuevo evento</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">Título *</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Ej: Festival de ballet" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Fecha *</label>
              <input required type="date" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Hora</label>
              <input type="time" value={form.event_time} onChange={e => setForm({...form, event_time: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Hijo</label>
              <select value={form.child_id} onChange={e => setForm({...form, child_id: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Todos / Familia</option>
                {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Qué llevar</label>
              <input value={form.needs_to_bring} onChange={e => setForm({...form, needs_to_bring: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Ej: Dinero, uniforme, snack" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Vestimenta</label>
              <input value={form.dress_code} onChange={e => setForm({...form, dress_code: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Ej: Ropa de ballet rosa" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">Notas</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" rows={2} />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar y agregar al calendario'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="text-slate-600 px-4 py-2 rounded-lg text-sm border border-slate-200 hover:bg-slate-50">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <EventList title="Próximos" events={upcoming} children={children} />
      {past.length > 0 && <EventList title="Pasados" events={past} children={children} muted />}
    </div>
  )
}

function EventList({ title, events, children, muted }: { title: string; events: Event[]; children: Child[]; muted?: boolean }) {
  if (events.length === 0) return null
  return (
    <div>
      <h3 className={`text-sm font-semibold mb-3 ${muted ? 'text-slate-400' : 'text-slate-600'}`}>{title}</h3>
      <div className="space-y-2">
        {events.map(event => {
          const ev = event as any
          const child = children.find(c => c.id === ev.child_id)
          return (
            <div key={event.id} className={`bg-white rounded-xl border p-4 flex items-start gap-3 ${muted ? 'opacity-60' : 'border-slate-200'}`}>
              <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: child?.color || '#94a3b8' }} />
              <div className="flex-1">
                <p className="font-medium text-slate-800 text-sm">{event.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(event.event_date + 'T12:00:00').toLocaleDateString('es-MX', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                  {event.event_time && ` · ${event.event_time}`}
                </p>
                {child && <p className="text-xs text-slate-500 mt-0.5">{child.name}</p>}
                {event.needs_to_bring && <p className="text-xs text-amber-600 mt-1">Llevar: {event.needs_to_bring}</p>}
                {event.dress_code && <p className="text-xs text-purple-600 mt-0.5">Vestimenta: {event.dress_code}</p>}
                {event.notes && <p className="text-xs text-slate-500 mt-0.5">{event.notes}</p>}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${event.source === 'whatsapp' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {event.source === 'whatsapp' ? 'WhatsApp' : 'Manual'}
                </span>
                {ev.calendar_uid && <span className="text-xs text-slate-400">En calendario</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

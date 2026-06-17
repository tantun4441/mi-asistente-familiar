'use client'
import { useEffect, useState } from 'react'
import { Event, Child } from '@/types'

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', event_date: '', event_time: '', child_id: '', needs_to_bring: '', dress_code: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [filterChild, setFilterChild] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [e, c] = await Promise.all([
      fetch('/api/events').then(r => r.json()),
      fetch('/api/children').then(r => r.json()),
    ])
    setEvents(Array.isArray(e) ? e : [])
    setChildren(Array.isArray(c) ? c : [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setForm({ title: '', description: '', event_date: '', event_time: '', child_id: '', needs_to_bring: '', dress_code: '', notes: '' })
    setShowForm(false)
    setSaving(false)
    loadData()
  }

  const today = new Date().toISOString().split('T')[0]
  const filtered = events.filter(e => !filterChild || (e as any).child_id === filterChild)
  const upcoming = filtered.filter(e => e.event_date >= today)
  const past = filtered.filter(e => e.event_date < today)

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
  const inputStyle = { background: '#FAF3E0', border: '1px solid rgba(47,93,98,0.15)', color: '#2F5D62', focusRingColor: '#2F5D62' }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black" style={{ color: '#2F5D62' }}>Eventos</h2>
          <p className="text-sm mt-1" style={{ color: '#8aabaf' }}>{events.length} eventos guardados</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-all shadow-md"
          style={{ background: '#F28482' }}>
          + Nuevo evento
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterChild('')}
          className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
          style={!filterChild ? { background: '#2F5D62', color: '#FAF3E0' } : { background: '#fff', color: '#8aabaf', border: '1px solid rgba(47,93,98,0.15)' }}>
          Todos
        </button>
        {children.map(child => (
          <button key={child.id} onClick={() => setFilterChild(filterChild === child.id ? '' : child.id)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={filterChild === child.id
              ? { backgroundColor: child.color, color: 'white' }
              : { background: '#fff', color: '#8aabaf', border: '1px solid rgba(47,93,98,0.15)' }}>
            {child.name}
          </button>
        ))}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card p-6">
          <h3 className="font-bold mb-5" style={{ color: '#2F5D62' }}>Nuevo evento</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs mb-1.5 block" style={{ color: '#8aabaf' }}>Título *</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                className={inputClass} style={inputStyle} placeholder="Ej: Festival de ballet" />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: '#8aabaf' }}>Fecha *</label>
              <input required type="date" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})}
                className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: '#8aabaf' }}>Hora</label>
              <input type="time" value={form.event_time} onChange={e => setForm({...form, event_time: e.target.value})}
                className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: '#8aabaf' }}>Hijo</label>
              <select value={form.child_id} onChange={e => setForm({...form, child_id: e.target.value})}
                className={inputClass} style={inputStyle}>
                <option value="">Toda la familia</option>
                {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: '#8aabaf' }}>Qué llevar</label>
              <input value={form.needs_to_bring} onChange={e => setForm({...form, needs_to_bring: e.target.value})}
                className={inputClass} style={inputStyle} placeholder="Ej: Uniforme, snack, dinero" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs mb-1.5 block" style={{ color: '#8aabaf' }}>Vestimenta</label>
              <input value={form.dress_code} onChange={e => setForm({...form, dress_code: e.target.value})}
                className={inputClass} style={inputStyle} placeholder="Ej: Ropa de ballet rosa" />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saving}
                className="text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-all disabled:opacity-50"
                style={{ background: '#2F5D62' }}>
                {saving ? 'Guardando...' : 'Guardar y agregar al calendario'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="font-semibold px-5 py-2.5 rounded-full text-sm"
                style={{ background: '#FAF3E0', color: '#8aabaf', border: '1px solid rgba(47,93,98,0.15)' }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p style={{ color: '#8aabaf' }}>Cargando...</p> : (
        <>
          <EventList title="Próximos" events={upcoming} children={children} />
          {past.length > 0 && <EventList title="Pasados" events={past} children={children} muted />}
        </>
      )}
    </div>
  )
}

function EventList({ title, events, children, muted }: { title: string; events: Event[]; children: Child[]; muted?: boolean }) {
  if (events.length === 0) return null
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: muted ? '#b0c4c6' : '#84A98C' }}>{title}</p>
      <div className="space-y-2">
        {events.map(event => {
          const ev = event as any
          const child = children.find(c => c.id === ev.child_id)
          return (
            <div key={event.id} className={`flex items-start gap-4 p-4 rounded-xl ${muted ? 'opacity-50' : ''}`}
              style={{ background: '#fff', border: '1px solid rgba(47,93,98,0.08)' }}>
              <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: child?.color || '#84A98C' }} />
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: '#2F5D62' }}>{event.title}</p>
                <p className="text-xs mt-0.5" style={{ color: '#8aabaf' }}>
                  {new Date(event.event_date + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  {event.event_time && ` · ${event.event_time}`}
                </p>
                {child && <p className="text-xs mt-0.5 font-medium" style={{ color: child.color }}>{child.name}</p>}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {event.needs_to_bring && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: '#F2848218', color: '#c0504e' }}>
                      📦 {event.needs_to_bring}
                    </span>
                  )}
                  {event.dress_code && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: '#84A98C18', color: '#4a7a52' }}>
                      👗 {event.dress_code}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
                style={event.source === 'whatsapp'
                  ? { background: '#84A98C18', color: '#4a7a52' }
                  : { background: '#2F5D6218', color: '#2F5D62' }}>
                {event.source === 'whatsapp' ? '💬 WA' : '✏️ Manual'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

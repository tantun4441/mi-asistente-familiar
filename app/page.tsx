'use client'
import { useEffect, useState } from 'react'
import { Event, Child } from '@/types'

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/events').then(r => r.json()),
      fetch('/api/children').then(r => r.json()),
    ]).then(([e, c]) => {
      setEvents(Array.isArray(e) ? e : [])
      setChildren(Array.isArray(c) ? c : [])
      setLoading(false)
    })
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const upcoming = events.filter(e => e.event_date >= today).slice(0, 5)

  const features = [
    {
      icon: '📅',
      title: 'Agenda directo en tu calendario',
      desc: 'Detecta eventos de WhatsApp y los agrega automáticamente a tu Apple Calendar con recordatorio.',
      color: '#2F5D62',
    },
    {
      icon: '💬',
      title: 'Responde mensajes automáticamente',
      desc: 'Recibe avisos de la escuela, ballet o sinagoga y el asistente los procesa sin que tengas que hacer nada.',
      color: '#F28482',
    },
    {
      icon: '🔄',
      title: 'Trackea cambios de actividades',
      desc: 'Si cambia el horario de ballet o se cancela un entrenamiento, te notifica al instante y actualiza el calendario.',
      color: '#84A98C',
    },
  ]

  return (
    <div className="space-y-12">

      {/* HERO */}
      <div className="rounded-3xl overflow-hidden" style={{ background: '#2F5D62' }}>
        <div className="p-10 md:p-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5"
            style={{ background: 'rgba(250,243,224,0.15)', color: '#FAF3E0' }}>
            Life happens. We organize it.
          </span>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4" style={{ color: '#FAF3E0' }}>
            Welcome to the future<br />
            <span style={{ color: '#F28482' }}>of family organization.</span>
          </h1>
          <p className="text-lg max-w-lg leading-relaxed mb-8" style={{ color: 'rgba(250,243,224,0.75)' }}>
            Managing your family's schedule shouldn't feel like a full-time job. From invitations and extracurricular activities to schedule changes and reminders, everything is automatically organized in one place.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a href="/dashboard"
              className="font-bold px-6 py-3 rounded-full text-sm transition-all shadow-md"
              style={{ background: '#F28482', color: '#fff' }}>
              Ver mis eventos →
            </a>
            <a href="/children"
              className="font-semibold px-6 py-3 rounded-full text-sm transition-all"
              style={{ background: 'rgba(250,243,224,0.12)', color: '#FAF3E0', border: '1px solid rgba(250,243,224,0.2)' }}>
              Mis hijos
            </a>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map(f => (
          <div key={f.title} className="card p-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
              style={{ background: f.color + '18' }}>
              {f.icon}
            </div>
            <h3 className="font-bold text-base mb-2" style={{ color: '#2F5D62' }}>{f.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: '#6b8a8e' }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Hijos', value: loading ? '—' : children.length, color: '#2F5D62', bg: '#2F5D6212' },
          { label: 'Esta semana', value: loading ? '—' : upcoming.length, color: '#F28482', bg: '#F2848212' },
          { label: 'Total eventos', value: loading ? '—' : events.length, color: '#84A98C', bg: '#84A98C12' },
        ].map(s => (
          <div key={s.label} className="card p-6">
            <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-sm mt-1" style={{ color: '#8aabaf' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* UPCOMING EVENTS */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: '#2F5D62' }}>Próximos eventos</h2>
          <a href="/dashboard" className="text-sm font-semibold transition-colors" style={{ color: '#F28482' }}>
            Ver todos →
          </a>
        </div>
        {loading ? (
          <p className="text-sm" style={{ color: '#8aabaf' }}>Cargando...</p>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm" style={{ color: '#8aabaf' }}>No hay eventos próximos.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(event => {
              const ev = event as any
              return (
                <div key={event.id} className="flex items-start gap-4 p-4 rounded-xl transition-all"
                  style={{ background: '#FAF3E0', border: '1px solid rgba(47,93,98,0.08)' }}>
                  <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: ev.children?.color || '#84A98C' }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: '#2F5D62' }}>{event.title}</p>
                    {ev.children && <p className="text-xs mt-0.5" style={{ color: '#84A98C' }}>{ev.children.name}</p>}
                    <p className="text-xs mt-1" style={{ color: '#8aabaf' }}>
                      {new Date(event.event_date + 'T12:00:00').toLocaleDateString('es-MX', {
                        weekday: 'long', month: 'long', day: 'numeric'
                      })}
                      {event.event_time && ` · ${event.event_time}`}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {event.needs_to_bring && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: '#F2848220', color: '#c0504e' }}>
                          📦 {event.needs_to_bring}
                        </span>
                      )}
                      {event.dress_code && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: '#84A98C20', color: '#4a7a52' }}>
                          👗 {event.dress_code}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0`}
                    style={event.source === 'whatsapp'
                      ? { background: '#84A98C20', color: '#4a7a52' }
                      : { background: '#2F5D6220', color: '#2F5D62' }}>
                    {event.source === 'whatsapp' ? '💬 WA' : '✏️'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* CHILDREN */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: '#2F5D62' }}>Mis hijos</h2>
          <a href="/children" className="text-sm font-semibold" style={{ color: '#F28482' }}>
            Administrar →
          </a>
        </div>
        {loading ? (
          <p className="text-sm" style={{ color: '#8aabaf' }}>Cargando...</p>
        ) : children.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">👨‍👩‍👧‍👦</p>
            <p className="text-sm mb-4" style={{ color: '#8aabaf' }}>Aún no hay hijos registrados.</p>
            <a href="/children" className="text-white text-sm px-5 py-2.5 rounded-full font-semibold"
              style={{ background: '#2F5D62' }}>
              Agregar hijo
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {children.map(child => (
              <div key={child.id} className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: '#FAF3E0', border: '1px solid rgba(47,93,98,0.08)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                  style={{ backgroundColor: child.color }}>
                  {child.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#2F5D62' }}>{child.name}</p>
                  <p className="text-xs" style={{ color: '#84A98C' }}>{child.activities?.length || 0} actividades</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

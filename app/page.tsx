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
    ]).then(([eventsData, childrenData]) => {
      setEvents(Array.isArray(eventsData) ? eventsData : [])
      setChildren(Array.isArray(childrenData) ? childrenData : [])
      setLoading(false)
    })
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const upcoming = events.filter(e => e.event_date >= today).slice(0, 5)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-400">Cargando...</p>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Hijos registrados</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{children.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Eventos próximos</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{upcoming.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Total de eventos</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{events.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Próximos eventos</h2>
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">Ver todos</a>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-slate-400 text-sm">No hay eventos próximos registrados.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map(event => {
              const eventWithChild = event as any
              return (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                  <div
                    className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                    style={{ backgroundColor: eventWithChild.children?.color || '#94a3b8' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm">{event.title}</p>
                    {eventWithChild.children && (
                      <p className="text-xs text-slate-500">{eventWithChild.children.name}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(event.event_date + 'T12:00:00').toLocaleDateString('es-MX', {
                        weekday: 'long', month: 'long', day: 'numeric'
                      })}
                      {event.event_time && ` · ${event.event_time}`}
                    </p>
                    {event.needs_to_bring && (
                      <p className="text-xs text-amber-600 mt-1">Llevar: {event.needs_to_bring}</p>
                    )}
                    {event.dress_code && (
                      <p className="text-xs text-purple-600 mt-0.5">Vestimenta: {event.dress_code}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    event.source === 'whatsapp'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {event.source === 'whatsapp' ? 'WhatsApp' : 'Manual'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Mis hijos</h2>
        {children.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-400 text-sm mb-3">Aún no hay hijos registrados.</p>
            <a href="/children" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">
              Agregar hijo
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {children.map(child => (
              <div key={child.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: child.color }}>
                  {child.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-sm">{child.name}</p>
                  <p className="text-xs text-slate-500">{child.activities?.length || 0} actividades</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

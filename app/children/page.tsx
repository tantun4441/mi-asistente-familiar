'use client'
import { useEffect, useState } from 'react'
import { Child } from '@/types'

const COLORS = ['#F28482', '#2F5D62', '#84A98C', '#f59e0b', '#8b5cf6', '#ef4444']
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [saving, setSaving] = useState(false)
  const [showActivityForm, setShowActivityForm] = useState<string | null>(null)
  const [activityForm, setActivityForm] = useState({ name: '', day_of_week: 'Lunes', time: '', location: '', notes: '' })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const data = await fetch('/api/children').then(r => r.json())
    setChildren(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleAddChild(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/children', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, color }) })
    setName(''); setColor(COLORS[0]); setShowForm(false); setSaving(false)
    loadData()
  }

  async function handleAddActivity(e: React.FormEvent, childId: string) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/children/activities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...activityForm, child_id: childId }) })
    setActivityForm({ name: '', day_of_week: 'Lunes', time: '', location: '', notes: '' })
    setShowActivityForm(null); setSaving(false)
    loadData()
  }

  const inputStyle = { background: '#FAF3E0', border: '1px solid rgba(47,93,98,0.15)', color: '#2F5D62' }
  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black" style={{ color: '#2F5D62' }}>Mis hijos</h2>
          <p className="text-sm mt-1" style={{ color: '#8aabaf' }}>{children.length} registrados</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-all shadow-md"
          style={{ background: '#F28482' }}>
          + Agregar hijo
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h3 className="font-bold mb-4" style={{ color: '#2F5D62' }}>Nuevo hijo</h3>
          <form onSubmit={handleAddChild} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-48">
              <label className="text-xs mb-1.5 block" style={{ color: '#8aabaf' }}>Nombre</label>
              <input required value={name} onChange={e => setName(e.target.value)}
                className={inputClass} style={inputStyle} placeholder="Nombre del hijo" />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: '#8aabaf' }}>Color</label>
              <div className="flex gap-2 mt-1">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${color === c ? 'scale-125 ring-2 ring-offset-2' : 'opacity-60 hover:opacity-100'}`}
                    style={{ backgroundColor: c, '--tw-ring-color': c } as any} />
                ))}
              </div>
            </div>
            <button type="submit" disabled={saving}
              className="text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-all disabled:opacity-50"
              style={{ background: '#2F5D62' }}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      {loading ? <p style={{ color: '#8aabaf' }}>Cargando...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children.map(child => (
            <div key={child.id} className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-md"
                  style={{ backgroundColor: child.color }}>
                  {child.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{ color: '#2F5D62' }}>{child.name}</h3>
                  <p className="text-xs" style={{ color: '#84A98C' }}>{child.activities?.length || 0} actividades</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {child.activities?.length === 0 ? (
                  <p className="text-xs italic" style={{ color: '#b0c4c6' }}>Sin actividades aún</p>
                ) : child.activities?.map(activity => (
                  <div key={activity.id} className="flex items-start gap-2 p-2.5 rounded-lg text-xs"
                    style={{ background: '#FAF3E0' }}>
                    <div className="w-2 h-2 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: child.color }} />
                    <div>
                      <p className="font-semibold" style={{ color: '#2F5D62' }}>{activity.name}</p>
                      <p style={{ color: '#8aabaf' }}>{activity.day_of_week}{activity.time && ` · ${activity.time}`}</p>
                      {activity.location && <p style={{ color: '#b0c4c6' }}>{activity.location}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {showActivityForm === child.id ? (
                <form onSubmit={e => handleAddActivity(e, child.id)} className="space-y-3 pt-3"
                  style={{ borderTop: '1px solid rgba(47,93,98,0.08)' }}>
                  <p className="text-xs font-semibold" style={{ color: '#8aabaf' }}>Nueva actividad</p>
                  <input required value={activityForm.name} onChange={e => setActivityForm({...activityForm, name: e.target.value})}
                    className={inputClass} style={inputStyle} placeholder="Ej: Ballet, Fútbol, Piano" />
                  <div className="grid grid-cols-2 gap-2">
                    <select value={activityForm.day_of_week} onChange={e => setActivityForm({...activityForm, day_of_week: e.target.value})}
                      className={inputClass} style={inputStyle}>
                      {DAYS.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <input type="time" value={activityForm.time} onChange={e => setActivityForm({...activityForm, time: e.target.value})}
                      className={inputClass} style={inputStyle} />
                  </div>
                  <input value={activityForm.location} onChange={e => setActivityForm({...activityForm, location: e.target.value})}
                    className={inputClass} style={inputStyle} placeholder="Lugar (opcional)" />
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving}
                      className="text-white font-semibold px-4 py-2 rounded-full text-xs disabled:opacity-50"
                      style={{ backgroundColor: child.color }}>
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button type="button" onClick={() => setShowActivityForm(null)}
                      className="font-semibold px-4 py-2 rounded-full text-xs"
                      style={{ background: '#FAF3E0', color: '#8aabaf', border: '1px solid rgba(47,93,98,0.15)' }}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setShowActivityForm(child.id)}
                  className="text-xs font-bold transition-colors"
                  style={{ color: child.color }}>
                  + Agregar actividad
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

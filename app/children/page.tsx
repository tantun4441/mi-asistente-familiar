'use client'
import { useEffect, useState } from 'react'
import { Child } from '@/types'

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
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
    await fetch('/api/children', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    })
    setName('')
    setColor(COLORS[0])
    setShowForm(false)
    setSaving(false)
    loadData()
  }

  async function handleAddActivity(e: React.FormEvent, childId: string) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/children/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...activityForm, child_id: childId }),
    })
    setActivityForm({ name: '', day_of_week: 'Lunes', time: '', location: '', notes: '' })
    setShowActivityForm(null)
    setSaving(false)
    loadData()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-slate-400">Cargando...</p></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Mis hijos</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + Agregar hijo
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Nuevo hijo</h3>
          <form onSubmit={handleAddChild} className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Nombre</label>
              <input required value={name} onChange={e => setName(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Nombre del hijo" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Color</label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 ${color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <button type="submit" disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="text-slate-600 px-4 py-2 rounded-lg text-sm border border-slate-200">
              Cancelar
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children.map(child => (
          <div key={child.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: child.color }}>
                {child.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-semibold text-slate-800">{child.name}</h3>
            </div>

            <div className="space-y-2 mb-4">
              {child.activities?.length === 0 ? (
                <p className="text-xs text-slate-400">Sin actividades registradas</p>
              ) : (
                child.activities?.map(activity => (
                  <div key={activity.id} className="flex items-start gap-2 text-xs bg-slate-50 rounded-lg p-2">
                    <div className="w-2 h-2 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: child.color }} />
                    <div>
                      <p className="font-medium text-slate-700">{activity.name}</p>
                      <p className="text-slate-500">{activity.day_of_week} {activity.time && `· ${activity.time}`}</p>
                      {activity.location && <p className="text-slate-400">{activity.location}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>

            {showActivityForm === child.id ? (
              <form onSubmit={e => handleAddActivity(e, child.id)} className="space-y-3 border-t border-slate-100 pt-4">
                <p className="text-xs font-medium text-slate-600">Nueva actividad</p>
                <input required value={activityForm.name} onChange={e => setActivityForm({...activityForm, name: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs" placeholder="Nombre (ej: Ballet, Fútbol)" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={activityForm.day_of_week} onChange={e => setActivityForm({...activityForm, day_of_week: e.target.value})}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-xs">
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <input type="time" value={activityForm.time} onChange={e => setActivityForm({...activityForm, time: e.target.value})}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-xs" />
                </div>
                <input value={activityForm.location} onChange={e => setActivityForm({...activityForm, location: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs" placeholder="Lugar (opcional)" />
                <div className="flex gap-2">
                  <button type="submit" disabled={saving}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50">
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button type="button" onClick={() => setShowActivityForm(null)}
                    className="text-slate-600 px-3 py-1.5 rounded-lg text-xs border border-slate-200">
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button onClick={() => setShowActivityForm(child.id)}
                className="text-xs text-blue-600 hover:underline">
                + Agregar actividad
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mi Asistente Familiar',
  description: 'Organiza tu familia con inteligencia artificial',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50">
        <nav className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800">Mi Asistente Familiar</h1>
            <div className="flex gap-6">
              <a href="/" className="text-slate-600 hover:text-slate-900 text-sm font-medium">Inicio</a>
              <a href="/dashboard" className="text-slate-600 hover:text-slate-900 text-sm font-medium">Eventos</a>
              <a href="/children" className="text-slate-600 hover:text-slate-900 text-sm font-medium">Mis Hijos</a>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}

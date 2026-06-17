import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mi Asistente Familiar',
  description: 'Tu asistente personal para organizar la familia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ background: '#FAF3E0', minHeight: '100vh' }}>
        <nav style={{ background: '#2F5D62' }} className="px-6 py-4 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏡</span>
              <span className="font-bold text-white text-base tracking-tight">Mi Asistente Familiar</span>
            </div>
            <div className="flex gap-1">
              {[['/', 'Inicio'], ['/dashboard', 'Eventos'], ['/children', 'Mis Hijos']].map(([href, label]) => (
                <a key={href} href={href}
                  className="px-4 py-2 rounded-full text-sm font-medium nav-link">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-10">
          {children}
        </main>
        <style>{`
          .nav-link { color: rgba(250,243,224,0.75); transition: all 0.15s; }
          .nav-link:hover { color: #FAF3E0; background: rgba(250,243,224,0.12); }
        `}</style>
      </body>
    </html>
  )
}

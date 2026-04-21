'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Kanban, Megaphone, Tags,
  MessageSquare, Bell, BarChart3, Settings, Zap, Rocket
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Panel', icon: LayoutDashboard },
  { href: '/prospectos', label: 'Prospectos', icon: Users },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/campanas', label: 'Campañas', icon: Megaphone },
  { href: '/rubros', label: 'Rubros', icon: Tags },
  { href: '/plantillas', label: 'Plantillas', icon: MessageSquare },
  { href: '/seguimientos', label: 'Seguimientos', icon: Bell },
  { href: '/analiticas', label: 'Analíticas', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-950 border-r border-gray-800 flex flex-col z-40">
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Opus Prospect</p>
            <p className="text-gray-500 text-xs mt-0.5">CRM Argentina</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Modo prospección — CTA destacado */}
        <Link
          href="/prospeccion"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all mb-2',
            pathname === '/prospeccion'
              ? 'bg-violet-600 text-white'
              : 'bg-violet-900/40 border border-violet-700/50 text-violet-300 hover:bg-violet-800/50 hover:text-white'
          )}
        >
          <Rocket className="w-4 h-4 shrink-0" />
          Modo Prospección
        </Link>

        <div className="h-px bg-gray-800 my-2" />

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link
          href="/configuracion"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            pathname === '/configuracion'
              ? 'bg-violet-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          )}
        >
          <Settings className="w-4 h-4" />
          Configuración
        </Link>
        <div className="mt-3 px-3 py-3 bg-gray-900 rounded-lg">
          <p className="text-xs text-gray-500">Sesión activa</p>
          <p className="text-xs text-white font-medium mt-0.5 truncate">camilamaraio1996@gmail.com</p>
        </div>
      </div>
    </aside>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, Kanban, Megaphone, Tags,
  MessageSquare, Bell, BarChart3, Settings, Zap, Rocket,
  LogOut, User, ShieldAlert
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

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
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: profile } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }
    }
    getData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: p } = await supabase.from('perfiles').select('*').eq('id', session.user.id).single()
        setProfile(p)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Sesión cerrada')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-950 border-r border-gray-800 flex flex-col z-40">
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-900/20">
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
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20'
              : 'bg-violet-900/20 border border-violet-700/30 text-violet-300 hover:bg-violet-800/40 hover:text-white'
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
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}

        {profile?.rol === 'super_admin' && (
          <>
            <div className="h-px bg-gray-800 my-4" />
            <p className="px-3 mb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Administración</p>
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all',
                pathname.startsWith('/admin')
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                  : 'text-gray-400 hover:text-red-400 hover:bg-red-900/10'
              )}
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              Super Admin
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-3">
        <Link
          href="/configuracion"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            pathname === '/configuracion'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          )}
        >
          <Settings className="w-4 h-4" />
          Configuración
        </Link>

        <div className="px-3 py-3 bg-gray-900/50 border border-gray-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-violet-600/20 flex items-center justify-center">
              <User className="w-3 h-3 text-violet-400" />
            </div>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Sesión activa</p>
          </div>
          <p className="text-xs text-white font-medium truncate mb-2">
            {user?.user_metadata?.nombre || user?.email || 'Cargando...'}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start h-8 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 gap-2 border border-transparent hover:border-red-900/50"
          >
            <LogOut className="w-3 h-3" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </aside>
  )
}

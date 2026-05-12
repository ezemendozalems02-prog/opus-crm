'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from './sidebar'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Perfil } from '@/lib/types'
import { Star, Clock, Menu, Zap } from 'lucide-react'
import Link from 'next/link'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<Perfil | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createClient()

  const isAuthRoute = pathname === '/login' || pathname.startsWith('/auth')
  const isSuscripcionRoute = pathname.startsWith('/suscripcion')
  const isAdminRoute = pathname.startsWith('/admin')

  useEffect(() => {
    if (isAuthRoute || isSuscripcionRoute || isAdminRoute) return

    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!data) return

      setProfile(data)

      // Solo aplicar restricciones a clientes normales (no super_admin)
      if (data.rol !== 'cliente') return

      if (!data.habilitado || data.estado_cuenta === 'suspendida') {
        router.push('/suscripcion/suspendida')
        return
      }

      // Si el trial venció, actualizar BD y redirigir
      if (data.estado_cuenta === 'trial' && data.trial_fin && new Date(data.trial_fin) < new Date()) {
        await supabase
          .from('perfiles')
          .update({ estado_cuenta: 'vencida' })
          .eq('id', user.id)
        router.push('/suscripcion/vencida')
        return
      }

      if (data.estado_cuenta === 'vencida') {
        router.push('/suscripcion/vencida')
        return
      }
    }

    getProfile()
  }, [pathname, supabase, router, isAuthRoute, isSuscripcionRoute, isAdminRoute])

  if (isAuthRoute || isSuscripcionRoute || isAdminRoute) {
    return <>{children}</>
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-gray-950 border-b border-gray-800 flex items-center px-4 z-30 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="flex items-center gap-2 ml-3">
          <div className="w-6 h-6 bg-violet-600 rounded-md flex items-center justify-center shadow-lg shadow-violet-900/20">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <p className="text-white font-bold text-sm">Opus Prospect</p>
        </Link>
      </div>

      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      <div className="md:ml-64 min-h-screen flex flex-col pt-14 md:pt-0">
        {profile?.es_demo && (
          <div className="bg-purple-600 text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg z-20">
            <Star className="w-3 h-3 fill-current" /> Modo Demostración Limitado <Star className="w-3 h-3 fill-current" />
          </div>
        )}
        {profile?.estado_cuenta === 'trial' && !profile?.es_demo && (
          <div className="bg-yellow-500 text-black px-4 py-1 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 z-20">
            <Clock className="w-3 h-3" /> Periodo de Prueba Gratuito (Trial) <Clock className="w-3 h-3" />
          </div>
        )}
        <main className="p-4 md:p-8 flex-1">
          {children}
        </main>
      </div>
    </>
  )
}

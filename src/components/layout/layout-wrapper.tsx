'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, Clock } from 'lucide-react'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('perfiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
    }
    getProfile()
  }, [pathname, supabase])

  const isAuthRoute = pathname === '/login' || pathname.startsWith('/auth')
  const isSuscripcionRoute = pathname.startsWith('/suscripcion')

  if (isAuthRoute || isSuscripcionRoute) {
    return <>{children}</>
  }

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        {profile?.es_demo && (
          <div className="bg-purple-600 text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg z-50">
            <Star className="w-3 h-3 fill-current" /> Modo Demostración Limitado <Star className="w-3 h-3 fill-current" />
          </div>
        )}
        {profile?.estado_cuenta === 'trial' && !profile?.es_demo && (
          <div className="bg-yellow-500 text-black px-4 py-1 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 z-50">
            <Clock className="w-3 h-3" /> Periodo de Prueba Gratuito (Trial) <Clock className="w-3 h-3" />
          </div>
        )}
        <main className="p-8 flex-1">
          {children}
        </main>
      </div>
    </>
  )
}

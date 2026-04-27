'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  LayoutDashboard, Users, LogOut, ShieldAlert, Menu
} from 'lucide-react'

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [supabase])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Sesión cerrada')
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-gray-950 border-b border-red-900/30 flex items-center px-4 z-30 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-gray-400 hover:text-white hover:bg-red-900/20 rounded-lg transition-colors"
          aria-label="Abrir menú admin"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center shadow-lg">
            <ShieldAlert className="w-3 h-3 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Opus Admin</p>
          </div>
        </div>
      </div>

      {/* Sidebar admin */}
      <aside className={cn(
        'fixed left-0 top-0 h-screen w-64 bg-gray-950 border-r border-red-900/30 flex flex-col z-50 transition-transform duration-300',
        'md:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-red-900/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/30">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Opus Admin</p>
              <p className="text-red-500 text-xs mt-0.5 font-black uppercase tracking-widest">Super Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                    : 'text-gray-400 hover:text-white hover:bg-red-900/10'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-red-900/30 space-y-3">
          <div className="px-3 py-3 bg-red-950/30 border border-red-900/20 rounded-lg">
            <p className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-1">Sesión admin</p>
            <p className="text-xs text-white font-medium truncate mb-2">{user?.email || '...'}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start h-8 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 gap-2"
            >
              <LogOut className="w-3 h-3" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <main className="md:ml-64 flex-1 p-4 md:p-8 pt-16 md:pt-8">
        {children}
      </main>
    </div>
  )
}

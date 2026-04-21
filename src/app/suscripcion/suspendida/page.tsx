'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldAlert, MessageCircle, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CuentaSuspendidaPage() {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gray-900 border-gray-800 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-800/30">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-black text-white uppercase tracking-tight">
            Cuenta Suspendida
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 text-center">
          <p className="text-gray-400 text-sm leading-relaxed">
            Tu cuenta ha sido suspendida por el administrador. Si creés que esto es un error o necesitás más información, contactate con nuestro equipo de soporte.
          </p>

          <div className="space-y-3">
            <Button 
              className="w-full h-12 bg-gray-800 hover:bg-gray-700 text-white font-black uppercase text-xs tracking-widest rounded-xl border border-gray-700"
              onClick={() => window.open('https://wa.me/YOUR_WHATSAPP', '_blank')}
            >
              <MessageCircle className="w-4 h-4 mr-2 text-green-500" /> Contactar Soporte
            </Button>

            <button 
              onClick={handleSignOut}
              className="text-xs text-gray-600 hover:text-gray-400 font-medium flex items-center justify-center gap-1.5 mx-auto mt-4"
            >
              <LogOut className="w-3.5 h-3.5" /> Cerrar sesión
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

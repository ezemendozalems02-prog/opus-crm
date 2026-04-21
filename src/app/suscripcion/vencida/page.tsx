'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CreditCard, MessageCircle, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function SuscripcionVencidaPage() {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handlePagar = async () => {
    toast.info('Redirigiendo a Mercado Pago...')
    // Aquí integraremos la generación de preferencia
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Error al generar el pago')
      }
    } catch (err) {
      toast.error('Ocurrió un error inesperado')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gray-900 border-gray-800 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-800/30">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-black text-white uppercase tracking-tight">
            Tu prueba gratis terminó
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 text-center">
          <p className="text-gray-400 text-sm leading-relaxed">
            Para seguir usando **Opus Prospect CRM** y no perder el acceso a tus prospectos y métricas, activá tu suscripción mensual.
          </p>

          <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700 text-left">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Plan Mensual</span>
              <span className="text-sm font-black text-violet-400">ARS $15.000 / mes</span>
            </div>
            <p className="text-xs text-gray-400">Acceso ilimitado a todas las herramientas de prospección y cierre.</p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handlePagar}
              className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-violet-900/20"
            >
              <CreditCard className="w-4 h-4 mr-2" /> Activar mi suscripción
            </Button>
            
            <Button 
              variant="outline"
              className="w-full h-12 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white font-bold uppercase text-[10px] tracking-widest rounded-xl"
              onClick={() => window.open('https://wa.me/YOUR_WHATSAPP', '_blank')}
            >
              <MessageCircle className="w-4 h-4 mr-2" /> Contactar soporte
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

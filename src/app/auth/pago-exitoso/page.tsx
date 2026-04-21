'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

function PagoExitosoContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function verifyPago() {
      const paymentId = searchParams.get('payment_id')
      const statusMP = searchParams.get('status')
      
      if (statusMP === 'approved') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Actualizar perfil y suscripción
          const now = new Date()
          const nextMonth = new Date()
          nextMonth.setMonth(now.getMonth() + 1)

          await supabase.from('perfiles').update({
            estado_cuenta: 'activa',
            habilitado: true
          }).eq('id', user.id)

          await supabase.from('suscripciones').update({
            estado: 'activa',
            fecha_inicio: now.toISOString(),
            fecha_fin: nextMonth.toISOString(),
            mercado_pago_payment_id: paymentId,
            mercado_pago_status: statusMP
          }).eq('user_id', user.id)

          // Registrar el pago
          await supabase.from('pagos').insert({
            user_id: user.id,
            monto: 15000,
            estado: 'approved',
            payment_id: paymentId,
            detalle: 'Suscripción mensual activada'
          })
          
          setStatus('success')
        }
      } else {
        setStatus('error')
      }
    }
    verifyPago()
  }, [searchParams, supabase])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gray-900 border-gray-800 shadow-2xl">
        <CardHeader className="text-center">
          {status === 'loading' && <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />}
          {status === 'success' && <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />}
          <CardTitle className="text-2xl font-black text-white uppercase tracking-tight">
            {status === 'loading' ? 'Verificando pago...' : status === 'success' ? '¡Pago Aprobado!' : 'Hubo un problema'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-400 text-sm">
            {status === 'loading' 
              ? 'Estamos confirmando tu transacción con Mercado Pago.' 
              : status === 'success' 
              ? 'Tu cuenta ha sido activada con éxito. Ya podés volver al CRM.' 
              : 'No pudimos confirmar tu pago. Si creés que es un error, contactá a soporte.'}
          </p>

          {status === 'success' && (
            <Button 
              onClick={() => router.push('/')}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-black uppercase text-xs tracking-widest rounded-xl"
            >
              Ir al CRM <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {status === 'error' && (
            <Button 
              onClick={() => router.push('/suscripcion/vencida')}
              className="w-full h-12 bg-gray-800 hover:bg-gray-700 text-white font-black uppercase text-xs tracking-widest rounded-xl"
            >
              Reintentar pago
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function PagoExitosoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
      </div>
    }>
      <PagoExitosoContent />
    </Suspense>
  )
}

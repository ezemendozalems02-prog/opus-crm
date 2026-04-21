import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export async function POST(request: Request) {
  const url = new URL(request.url)
  const type = url.searchParams.get('type') || (await request.json()).type
  const dataId = url.searchParams.get('data.id') || (await request.json()).data?.id

  if (type === 'payment' && dataId) {
    // Configurar MP
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MP_ACCESS_TOKEN || '' 
    })
    const payment = new Payment(client)

    try {
      const p = await payment.get({ id: dataId })
      
      if (p.status === 'approved') {
        const userId = p.external_reference
        
        // Supabase Admin Client (necesario para saltar RLS si es necesario, pero aquí usamos roles)
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY! // IMPORTANTE: Usar Service Role para webhooks
        )

        const now = new Date()
        const nextMonth = new Date()
        nextMonth.setMonth(now.getMonth() + 1)

        // 1. Actualizar Perfil
        await supabase.from('perfiles').update({
          estado_cuenta: 'activa',
          habilitado: true
        }).eq('id', userId)

        // 2. Actualizar Suscripción
        await supabase.from('suscripciones').update({
          estado: 'activa',
          fecha_inicio: now.toISOString(),
          fecha_fin: nextMonth.toISOString(),
          mercado_pago_payment_id: dataId,
          mercado_pago_status: 'approved'
        }).eq('user_id', userId)

        // 3. Registrar Pago
        await supabase.from('pagos').insert({
          user_id: userId,
          monto: p.transaction_amount,
          estado: 'approved',
          payment_id: dataId,
          detalle: 'Pago aprobado vía Webhook'
        })
      }
    } catch (error) {
      console.error('Error procesando webhook MP:', error)
      return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

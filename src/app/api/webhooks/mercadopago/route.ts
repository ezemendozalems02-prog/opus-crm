import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createHmac, timingSafeEqual } from 'crypto'

function validateSignature(request: Request, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  // Si no hay secret configurado, saltar validación en desarrollo
  if (!secret) return process.env.NODE_ENV !== 'production'

  const signature = request.headers.get('x-signature')
  const requestId = request.headers.get('x-request-id')

  if (!signature || !requestId) return false

  const ts = signature.split(',').find(p => p.startsWith('ts='))?.slice(3)
  const v1 = signature.split(',').find(p => p.startsWith('v1='))?.slice(3)

  if (!ts || !v1) return false

  const signedTemplate = `id:${dataId};request-id:${requestId};ts:${ts};`
  const expected = createHmac('sha256', secret).update(signedTemplate).digest('hex')

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(v1))
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url)

  // Mercado Pago puede enviar los datos como query params o en el body
  let type: string | null = url.searchParams.get('type')
  let dataId: string | null = url.searchParams.get('data.id')

  // Clonar el request para poder leer el body sin consumirlo
  const body = await request.clone().json().catch(() => ({}))
  if (!type) type = body.type ?? null
  if (!dataId) dataId = body.data?.id ?? null

  if (!validateSignature(request, dataId ?? '')) {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
  }

  if (type === 'payment' && dataId) {
    const mpClient = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN || '',
    })
    const payment = new Payment(mpClient)

    try {
      const p = await payment.get({ id: dataId })

      if (p.status === 'approved') {
        const userId = p.external_reference

        if (!userId) {
          return NextResponse.json({ error: 'external_reference faltante' }, { status: 400 })
        }

        // Service Role necesario para escribir por fuera de RLS desde webhook
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const now = new Date()
        const nextMonth = new Date()
        nextMonth.setMonth(now.getMonth() + 1)

        await supabase
          .from('perfiles')
          .update({ estado_cuenta: 'activa', habilitado: true })
          .eq('id', userId)

        await supabase
          .from('suscripciones')
          .update({
            estado: 'activa',
            fecha_inicio: now.toISOString(),
            fecha_fin: nextMonth.toISOString(),
            mercado_pago_payment_id: dataId,
            mercado_pago_status: 'approved',
          })
          .eq('user_id', userId)

        await supabase.from('pagos').insert({
          user_id: userId,
          monto: p.transaction_amount,
          moneda: p.currency_id ?? 'ARS',
          proveedor: 'mercado_pago',
          estado: 'approved',
          payment_id: dataId,
          detalle: 'Pago aprobado vía Webhook',
        })
      }
    } catch (error) {
      console.error('Error procesando webhook MP:', error)
      return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

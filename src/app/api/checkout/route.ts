import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

export async function POST() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Configurar Mercado Pago
  const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-7833116812345678-042116-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-123456789' 
  })

  const preference = new Preference(client)

  try {
    const body = {
      items: [
        {
          id: 'plan-mensual',
          title: 'Opus Prospect CRM - Plan Mensual',
          quantity: 1,
          unit_price: 15000,
          currency_id: 'ARS',
          description: 'Suscripción mensual para Opus Prospect CRM'
        }
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/auth/pago-exitoso`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/suscripcion/vencida`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/suscripcion/vencida`
      },
      auto_return: 'approved' as const,
      external_reference: user.id,
      metadata: {
        user_id: user.id
      }
    }

    const response = await preference.create({ body })
    
    // Guardar la preferencia en la DB (opcional, pero recomendado)
    await supabase.from('suscripciones').update({
      mercado_pago_preference_id: response.id
    }).eq('user_id', user.id)

    return NextResponse.json({ url: response.init_point })
  } catch (error) {
    console.error('Error creando preferencia MP:', error)
    return NextResponse.json({ error: 'Error al procesar el pago' }, { status: 500 })
  }
}

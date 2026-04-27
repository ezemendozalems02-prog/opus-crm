import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/auth')
  const isSuscripcionRoute = request.nextUrl.pathname.startsWith('/suscripcion')

  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    // Fetch profile to check role and status
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol, estado_cuenta, habilitado')
      .eq('id', user.id)
      .single()

    if (perfil) {
      // 1. Check if disabled
      if (!perfil.habilitado && !isAuthRoute && !isSuscripcionRoute) {
         const url = request.nextUrl.clone()
         url.pathname = '/suscripcion/suspendida'
         return NextResponse.redirect(url)
      }

      // 2. Super Admin check
      const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
      if (isAdminRoute && perfil.rol !== 'super_admin') {
         const url = request.nextUrl.clone()
         url.pathname = '/'
         return NextResponse.redirect(url)
      }

      // 3. Subscription status check for regular clients
      if (perfil.rol === 'cliente') {
        const isVencida = perfil.estado_cuenta === 'vencida'
        const isSuspendida = perfil.estado_cuenta === 'suspendida'
        
        // Trial check logic (if trial_fin < now, we should mark as vencida in DB, but here we just redirect)
        // Note: Real trial expiration should be handled by a background job or during login
        
        if ((isVencida || isSuspendida) && !isSuscripcionRoute && !isAdminRoute) {
          const url = request.nextUrl.clone()
          url.pathname = isSuspendida ? '/suscripcion/suspendida' : '/suscripcion/vencida'
          return NextResponse.redirect(url)
        }
      }
    }

    // Redirect logged in users away from login
    if (isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = perfil?.rol === 'super_admin' ? '/admin' : '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

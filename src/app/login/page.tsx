'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Zap, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nombre: nombre,
            },
          },
        })
        if (error) throw error
        toast.success('Cuenta creada. Ya podés ingresar.')
        setIsRegister(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        toast.success('Sesión iniciada correctamente')
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Credenciales inválidas' : err.message)
      toast.error('Error al autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-900/20">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-xl leading-none">Opus Prospect</p>
          <p className="text-gray-500 text-xs mt-0.5">CRM Argentina</p>
        </div>
      </div>

      <Card className="w-full max-w-md bg-gray-900 border-gray-800 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-white">
            {isRegister ? 'Creá tu cuenta' : 'Ingresá a tu cuenta'}
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            {isRegister ? 'Completá tus datos para empezar' : 'Ingresá tus credenciales para acceder'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-700/50 p-3 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            
            {isRegister && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-gray-300">Nombre completo</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Juan Pérez"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white focus:border-violet-500 focus:ring-violet-500"
                    required
                  />
                </div>
                <div className="bg-violet-900/10 border border-violet-800/30 p-3 rounded-lg text-xs text-violet-300 text-center font-medium">
                  🚀 Al registrarte obtenés **7 días de prueba gratis** sin compromiso y sin tarjeta.
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white focus:border-violet-500 focus:ring-violet-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white focus:border-violet-500 focus:ring-violet-500"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-6 shadow-lg shadow-violet-900/20"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isRegister ? 'Crear cuenta' : 'Ingresar'
              )}
            </Button>
            
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-gray-400 hover:text-violet-400 transition-colors"
            >
              {isRegister ? '¿Ya tenés cuenta? Ingresá' : '¿No tenés cuenta? Creala acá'}
            </button>
          </CardFooter>
        </form>
      </Card>

      <p className="mt-8 text-gray-600 text-xs">
        &copy; {new Date().getFullYear()} Opus Prospect CRM. Todos los derechos reservados.
      </p>
    </div>
  )
}

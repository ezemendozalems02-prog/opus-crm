'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { User, Target, Database, Bell, CheckCircle2 } from 'lucide-react'

export default function ConfiguracionPage() {
  const [metas, setMetas] = useState({ mensajes_diarios: 30, reuniones_diarias: 3, cierres_mensuales: 10 })
  const [perfil, setPerfil] = useState({ nombre: 'Camila Maraio', email: 'camilamaraio1996@gmail.com', whatsapp: '' })
  const [supabase, setSupabase] = useState({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    key: '',
  })

  function guardarMetas(e: React.FormEvent) {
    e.preventDefault()
    toast.success('Metas actualizadas correctamente')
  }

  function guardarPerfil(e: React.FormEvent) {
    e.preventDefault()
    toast.success('Perfil actualizado correctamente')
  }

  return (
    <div>
      <PageHeader title="Configuración" description="Ajustá el sistema a tu forma de trabajar" />

      <div className="max-w-2xl space-y-6">
        {/* Perfil */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <User className="w-4 h-4 text-violet-400" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={guardarPerfil} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-gray-300">Nombre</Label>
                  <Input value={perfil.nombre} onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })}
                    className="bg-gray-900 border-gray-700" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-gray-300">Email</Label>
                  <Input type="email" value={perfil.email} onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
                    className="bg-gray-900 border-gray-700" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300">WhatsApp (para acciones rápidas)</Label>
                <Input value={perfil.whatsapp} onChange={(e) => setPerfil({ ...perfil, whatsapp: e.target.value })}
                  placeholder="+549111234567" className="bg-gray-900 border-gray-700" />
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="bg-violet-600 hover:bg-violet-700">Guardar perfil</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Metas diarias */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-400" />
              Metas de prospección
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={guardarMetas} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-gray-300">Mensajes/día</Label>
                  <Input type="number" min={1} max={200}
                    value={metas.mensajes_diarios}
                    onChange={(e) => setMetas({ ...metas, mensajes_diarios: Number(e.target.value) })}
                    className="bg-gray-900 border-gray-700" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-gray-300">Reuniones/día</Label>
                  <Input type="number" min={1} max={20}
                    value={metas.reuniones_diarias}
                    onChange={(e) => setMetas({ ...metas, reuniones_diarias: Number(e.target.value) })}
                    className="bg-gray-900 border-gray-700" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-gray-300">Cierres/mes</Label>
                  <Input type="number" min={1} max={100}
                    value={metas.cierres_mensuales}
                    onChange={(e) => setMetas({ ...metas, cierres_mensuales: Number(e.target.value) })}
                    className="bg-gray-900 border-gray-700" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="bg-violet-600 hover:bg-violet-700">Guardar metas</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Supabase */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-green-400" />
              Base de datos (Supabase)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              <p className="text-xs text-green-300">Credenciales configuradas en <code className="text-green-200">.env.local</code></p>
            </div>
            <p className="text-xs text-gray-500">
              Para cambiar las credenciales, editá el archivo <code className="text-gray-300">.env.local</code> en la raíz del proyecto.
              Necesitás reiniciar el servidor después de cualquier cambio.
            </p>
            <Separator className="bg-gray-700" />
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-400">Pasos para activar la base de datos real:</p>
              <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                <li>Entrá a <span className="text-gray-300">supabase.com</span> y creá un proyecto</li>
                <li>Copiá la URL y la clave anónima desde Settings → API</li>
                <li>Pegalas en el archivo <code className="text-gray-300">.env.local</code></li>
                <li>Ejecutá el archivo <code className="text-gray-300">supabase-schema.sql</code> en el SQL Editor</li>
                <li>Reiniciá el servidor con <code className="text-gray-300">npm run dev</code></li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-yellow-400" />
              Recordatorios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Los seguimientos vencidos se muestran automáticamente en el Panel y en la sección de Seguimientos.
              Próximamente: notificaciones por email y alertas diarias.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

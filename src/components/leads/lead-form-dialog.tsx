'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Prospecto, Rubro, LeadStatus } from '@/lib/types'
import { Loader2 } from 'lucide-react'

interface ProspectoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead?: Prospecto
  onSave: () => void
}

export function ProspectoFormDialog({
  open,
  onOpenChange,
  lead,
  onSave,
}: ProspectoFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [rubros, setRubros] = useState<Rubro[]>([])
  const supabase = createClient()

  const [formData, setFormData] = useState<Partial<Prospecto>>({
    nombre: '',
    negocio: '',
    rubro_id: '',
    rubro_nombre: '',
    ciudad: '',
    instagram: '',
    whatsapp: '',
    sitio_web: '',
    estado: 'Nuevo',
    nivel_interes: 1,
    notas: '',
  })

  useEffect(() => {
    if (lead) {
      setFormData({
        nombre: lead.nombre,
        negocio: lead.negocio,
        rubro_id: lead.rubro_id || '',
        rubro_nombre: lead.rubro_nombre || (lead as any).rubros?.nombre || '',
        ciudad: lead.ciudad || '',
        instagram: lead.instagram || '',
        whatsapp: lead.whatsapp || '',
        sitio_web: lead.sitio_web || '',
        estado: lead.estado,
        nivel_interes: lead.nivel_interes,
        notas: lead.notas || '',
      })
    } else {
      setFormData({
        nombre: '',
        negocio: '',
        rubro_id: '',
        rubro_nombre: '',
        ciudad: '',
        instagram: '',
        whatsapp: '',
        sitio_web: '',
        estado: 'Nuevo',
        nivel_interes: 1,
        notas: '',
      })
    }
  }, [lead, open])

  useEffect(() => {
    async function fetchRubros() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('rubros')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('nombre')
      if (data) setRubros(data)
    }
    if (open) fetchRubros()
  }, [open, supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No hay sesión activa')

      // Logic for Rubro:
      // 1. Check if the typed name matches an existing rubro
      const existingRubro = rubros.find(r => r.nombre.toLowerCase() === formData.rubro_nombre?.toLowerCase())
      
      const payload = {
        ...formData,
        user_id: user.id,
        rubro_id: existingRubro ? existingRubro.id : null,
        rubro_nombre: existingRubro ? null : formData.rubro_nombre,
      }

      if (lead) {
        const { error } = await supabase
          .from('prospectos')
          .update(payload)
          .eq('id', lead.id)
        if (error) throw error
        toast.success('Prospecto actualizado')
      } else {
        const { error } = await supabase.from('prospectos').insert([payload])
        if (error) throw error
        toast.success('Prospecto creado')
      }
      onSave()
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {lead ? 'Editar Prospecto' : 'Nuevo Prospecto'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Completá los datos del negocio para dar seguimiento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-gray-300">Nombre del contacto</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white focus:border-violet-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="negocio" className="text-gray-300">Nombre del negocio</Label>
              <Input
                id="negocio"
                value={formData.negocio}
                onChange={(e) => setFormData({ ...formData, negocio: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white focus:border-violet-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rubro_nombre" className="text-gray-300">Rubro</Label>
              <Input
                id="rubro_nombre"
                list="rubros-list"
                value={formData.rubro_nombre || ''}
                onChange={(e) => setFormData({ ...formData, rubro_nombre: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white focus:border-violet-500"
                placeholder="Escribí o seleccioná un rubro"
              />
              <datalist id="rubros-list">
                {rubros.map((r) => (
                  <option key={r.id} value={r.nombre} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ciudad" className="text-gray-300">Ciudad / Zona</Label>
              <Input
                id="ciudad"
                value={formData.ciudad || ''}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white focus:border-violet-500"
                placeholder="Ej: Córdoba Capital"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-gray-300">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram || ''}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white focus:border-violet-500"
                placeholder="@usuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-gray-300">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp || ''}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white focus:border-violet-500"
                placeholder="Ej: 3511234567"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estado" className="text-gray-300">Estado inicial</Label>
              <Select
                value={formData.estado}
                onValueChange={(val: any) => setFormData({ ...formData, estado: val || 'Nuevo' })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="Nuevo">Nuevo</SelectItem>
                  <SelectItem value="Contactado">Contactado</SelectItem>
                  <SelectItem value="Respondió">Respondió</SelectItem>
                  <SelectItem value="Interesado">Interesado</SelectItem>
                  <SelectItem value="Reunión">Reunión</SelectItem>
                  <SelectItem value="Propuesta">Propuesta</SelectItem>
                  <SelectItem value="Ganado">Ganado</SelectItem>
                  <SelectItem value="Perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interes" className="text-gray-300">Nivel de interés (1-5)</Label>
              <Select
                value={String(formData.nivel_interes)}
                onValueChange={(val) => setFormData({ ...formData, nivel_interes: Number(val) })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} Estrellas</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas" className="text-gray-300">Notas internas</Label>
            <Textarea
              id="notas"
              value={formData.notas || ''}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              className="bg-gray-800 border-gray-700 text-white focus:border-violet-500 h-24"
              placeholder="Anotá detalles relevantes de la conversación..."
            />
          </div>

          <DialogFooter className="pt-4 border-t border-gray-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-violet-600 hover:bg-violet-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {lead ? 'Guardar Cambios' : 'Crear Prospecto'}
            </Button>
          </DialogFooter>
        </form>
    </DialogContent>
  </Dialog>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { 
  Plus, Search, MessageSquare, Copy, Edit2, Trash2, 
  Tag, Layers, Sparkles, Loader2, Check 
} from 'lucide-react'
import type { Plantilla, Rubro } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const TIPO_LABELS = {
  initial: 'Primer contacto',
  followup: 'Seguimiento',
  reenganche: 'Re-enganche',
  closing: 'Cierre',
}

export default function PlantillasPage() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [rubros, setRubros] = useState<Rubro[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editPlantilla, setEditPlantilla] = useState<Plantilla | undefined>()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    const { data: pData } = await supabase.from('plantillas').select('*').order('created_at', { ascending: false })
    const { data: rData } = await supabase.from('rubros').select('*').order('nombre')
    if (pData) setPlantillas(pData)
    if (rData) setRubros(rData)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [supabase])

  const filtered = plantillas.filter(p => 
    p.titulo.toLowerCase().includes(search.toLowerCase()) ||
    p.contenido.toLowerCase().includes(search.toLowerCase())
  )

  function handleCopy(p: Plantilla) {
    navigator.clipboard.writeText(p.contenido)
    setCopiedId(p.id)
    toast.success('Contenido copiado al portapapeles')
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return
    const { error } = await supabase.from('plantillas').delete().eq('id', id)
    if (error) toast.error('Error al eliminar')
    else {
      toast.success('Plantilla eliminada')
      setPlantillas(prev => prev.filter(p => p.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plantillas de Mensajes"
        description="Textos optimizados para aumentar tu tasa de respuesta"
        action={
          <Button onClick={() => { setEditPlantilla(undefined); setShowForm(true) }} className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-900/20">
            <Plus className="w-4 h-4 mr-2" /> Nueva plantilla
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          placeholder="Buscar plantillas por título o contenido..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-gray-900 border-gray-800 text-white focus:border-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            <p className="text-gray-500">Cargando plantillas...</p>
          </div>
        ) : filtered.map((plantilla) => {
          const rubro = rubros.find(r => r.id === plantilla.rubro_id)
          return (
            <Card key={plantilla.id} className="bg-gray-800/40 border-gray-700 hover:border-violet-500/50 transition-all flex flex-col group overflow-hidden">
              <CardHeader className="pb-3 border-b border-gray-700/50 bg-gray-900/30">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                      {plantilla.titulo}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-violet-900/30 text-violet-300 px-2 py-0.5 rounded-full border border-violet-700/30 font-bold uppercase tracking-wider">
                        {TIPO_LABELS[plantilla.tipo]}
                      </span>
                      {rubro && (
                        <span className="text-[10px] bg-gray-900 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700 font-bold uppercase tracking-wider">
                          {rubro.nombre}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditPlantilla(plantilla); setShowForm(true) }} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(plantilla.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-md">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800 relative group/msg">
                  <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap font-medium">
                    {plantilla.contenido}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(plantilla)}
                    className="absolute top-2 right-2 h-7 w-7 p-0 bg-gray-900 border border-gray-800 opacity-0 group-hover/msg:opacity-100 transition-opacity"
                  >
                    {copiedId === plantilla.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4 px-6 justify-between items-center">
                <p className="text-[10px] text-gray-600 font-medium">
                  Agregada el {new Date(plantilla.created_at).toLocaleDateString('es-AR')}
                </p>
                <div className="flex items-center gap-1.5">
                   <Sparkles className="w-3 h-3 text-yellow-500/50" />
                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Optimizado</span>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <PlantillaFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        plantilla={editPlantilla}
        rubros={rubros}
        onSave={fetchData}
      />
    </div>
  )
}

function PlantillaFormDialog({ open, onOpenChange, plantilla, rubros, onSave }: { open: boolean, onOpenChange: (o: boolean) => void, plantilla?: Plantilla, rubros: Rubro[], onSave: () => void }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const [formData, setFormData] = useState<Partial<Plantilla>>({
    titulo: '',
    contenido: '',
    tipo: 'initial',
    rubro_id: ''
  })

  useEffect(() => {
    if (plantilla) setFormData({
      titulo: plantilla.titulo,
      contenido: plantilla.contenido,
      tipo: plantilla.tipo,
      rubro_id: plantilla.rubro_id || ''
    })
    else setFormData({ titulo: '', contenido: '', tipo: 'initial', rubro_id: '' })
  }, [plantilla, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const payload = { ...formData, user_id: user?.id, rubro_id: formData.rubro_id === '' ? null : formData.rubro_id }
      
      if (plantilla) {
        const { error } = await supabase.from('plantillas').update(payload).eq('id', plantilla.id)
        if (error) throw error
        toast.success('Plantilla actualizada')
      } else {
        const { error } = await supabase.from('plantillas').insert([payload])
        if (error) throw error
        toast.success('Plantilla creada')
      }
      onSave()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{plantilla ? 'Editar Plantilla' : 'Nueva Plantilla'}</DialogTitle>
          <DialogDescription className="text-gray-400">Personalizá tus mensajes para conectar mejor.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título interno</Label>
              <Input value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })} className="bg-gray-800 border-gray-700" placeholder="Ej: Contacto inicial Parrillas" required />
            </div>
            <div className="space-y-2">
              <Label>Tipo de mensaje</Label>
              <Select value={formData.tipo} onValueChange={(v: any) => setFormData({ ...formData, tipo: v })}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="initial">Primer contacto</SelectItem>
                  <SelectItem value="followup">Seguimiento</SelectItem>
                  <SelectItem value="reenganche">Re-enganche</SelectItem>
                  <SelectItem value="closing">Cierre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Rubro asociado (opcional)</Label>
            <Select value={formData.rubro_id || 'none'} onValueChange={v => setFormData({ ...formData, rubro_id: v === 'none' ? '' : v })}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Seleccionar rubro" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="none">General (todos los rubros)</SelectItem>
                {rubros.map(r => <SelectItem key={r.id} value={r.id}>{r.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <Label>Contenido del mensaje</Label>
              <p className="text-[10px] text-gray-500 font-bold">Usá {"{{nombre}}"} para personalizar</p>
            </div>
            <Textarea 
              value={formData.contenido} 
              onChange={e => setFormData({ ...formData, contenido: e.target.value })} 
              className="bg-gray-800 border-gray-700 h-40 focus:border-violet-500" 
              placeholder="Hola {{nombre}}, vi lo que hacen en su negocio y..."
              required 
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

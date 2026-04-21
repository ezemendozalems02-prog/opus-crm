'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, Tag, MessageSquare, Target, User, AlertCircle, Loader2, Trash2, Edit2 } from 'lucide-react'
import type { Rubro } from '@/lib/types'
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

export default function RubrosPage() {
  const [rubros, setRubros] = useState<Rubro[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editRubro, setEditRubro] = useState<Rubro | undefined>()
  const supabase = createClient()

  const fetchRubros = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('rubros')
      .select('*')
      .order('nombre')
    
    if (data) setRubros(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchRubros()
  }, [supabase])

  const filtered = rubros.filter((r) =>
    r.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (r.descripcion || '').toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar este rubro?')) return
    const { error } = await supabase.from('rubros').delete().eq('id', id)
    if (error) toast.error('Error al eliminar')
    else {
      toast.success('Rubro eliminado')
      setRubros(prev => prev.filter(r => r.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rubros"
        description="Gestioná los nichos de mercado y sus estrategias específicas"
        action={
          <Button onClick={() => { setEditRubro(undefined); setShowForm(true) }} className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-900/20">
            <Plus className="w-4 h-4 mr-2" /> Nuevo rubro
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          placeholder="Buscar rubros..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-gray-900 border-gray-800 text-white focus:border-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            <p className="text-gray-500">Cargando rubros...</p>
          </div>
        ) : filtered.map((rubro) => (
          <Card key={rubro.id} className="bg-gray-800/40 border-gray-700 hover:border-violet-500/50 transition-all group overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-700/50 bg-gray-900/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-violet-400" />
                  {rubro.nombre}
                </CardTitle>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditRubro(rubro); setShowForm(true) }} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(rubro.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-md">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3 text-red-400" /> Problema común
                </p>
                <p className="text-xs text-gray-300 leading-relaxed italic">"{rubro.problema_comun || 'No definido'}"</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-green-400" /> Oportunidad
                </p>
                <p className="text-xs text-gray-300 leading-relaxed font-medium">{rubro.oportunidad || 'No definida'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <User className="w-3 h-3 text-blue-400" /> Tipo de cliente
                </p>
                <p className="text-xs text-gray-300">{rubro.tipo_cliente || 'No definido'}</p>
              </div>

              <div className="pt-4 border-t border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">Mensaje Sugerido</p>
                  <MessageSquare className="w-3 h-3 text-violet-500" />
                </div>
                <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
                  <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-3">
                    {rubro.mensaje_sugerido || 'Sin mensaje sugerido'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <RubroFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        rubro={editRubro}
        onSave={fetchRubros}
      />
    </div>
  )
}

function RubroFormDialog({ open, onOpenChange, rubro, onSave }: { open: boolean, onOpenChange: (o: boolean) => void, rubro?: Rubro, onSave: () => void }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const [formData, setFormData] = useState<Partial<Rubro>>({
    nombre: '',
    descripcion: '',
    problema_comun: '',
    oportunidad: '',
    tipo_cliente: '',
    mensaje_sugerido: ''
  })

  useEffect(() => {
    if (rubro) setFormData(rubro)
    else setFormData({ nombre: '', descripcion: '', problema_comun: '', oportunidad: '', tipo_cliente: '', mensaje_sugerido: '' })
  }, [rubro, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (rubro) {
        const { error } = await supabase.from('rubros').update(formData).eq('id', rubro.id)
        if (error) throw error
        toast.success('Rubro actualizado')
      } else {
        const { error } = await supabase.from('rubros').insert([formData])
        if (error) throw error
        toast.success('Rubro creado')
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
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{rubro ? 'Editar Rubro' : 'Nuevo Rubro'}</DialogTitle>
          <DialogDescription className="text-gray-400">Completá los detalles estratégicos para este rubro.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nombre del rubro</Label>
            <Input value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} className="bg-gray-800 border-gray-700" required />
          </div>
          <div className="space-y-2">
            <Label>Problema común</Label>
            <Textarea value={formData.problema_comun || ''} onChange={e => setFormData({ ...formData, problema_comun: e.target.value })} className="bg-gray-800 border-gray-700 h-20" />
          </div>
          <div className="space-y-2">
            <Label>Oportunidad / Solución</Label>
            <Input value={formData.oportunidad || ''} onChange={e => setFormData({ ...formData, oportunidad: e.target.value })} className="bg-gray-800 border-gray-700" />
          </div>
          <div className="space-y-2">
            <Label>Mensaje Sugerido</Label>
            <Textarea value={formData.mensaje_sugerido || ''} onChange={e => setFormData({ ...formData, mensaje_sugerido: e.target.value })} className="bg-gray-800 border-gray-700 h-24" />
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

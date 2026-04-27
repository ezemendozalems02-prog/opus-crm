'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { 
  Megaphone, Plus, Search, Play, Pause, CheckCircle2, 
  Target, Users, MessageSquare, BarChart3, Loader2,
  Trash2, Edit2, Tag
} from 'lucide-react'
import type { Campaña, Rubro } from '@/lib/types'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function CampanasPage() {
  const [campanas, setCampanas] = useState<Campaña[]>([])
  const [rubros, setRubros] = useState<Rubro[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editCampana, setEditCampana] = useState<Campaña | undefined>()
  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    const { data: cData } = await supabase.from('campañas').select('*, rubros(*)').order('created_at', { ascending: false })
    const { data: rData } = await supabase.from('rubros').select('*').order('nombre')
    if (cData) setCampanas(cData)
    if (rData) setRubros(rData)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [supabase])

  const filtered = campanas.filter(c => 
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.objetivo || '').toLowerCase().includes(search.toLowerCase())
  )

  async function handleToggleEstado(c: Campaña) {
    const nuevoEstado = c.estado === 'activa' ? 'pausada' : 'activa'
    const { error } = await supabase.from('campañas').update({ estado: nuevoEstado }).eq('id', c.id)
    if (error) toast.error('Error al actualizar')
    else {
      toast.success(`Campaña ${nuevoEstado}`)
      setCampanas(prev => prev.map(item => item.id === c.id ? { ...item, estado: nuevoEstado } : item))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro?')) return
    const { error } = await supabase.from('campañas').delete().eq('id', id)
    if (error) toast.error('Error al eliminar')
    else {
      toast.success('Campaña eliminada')
      setCampanas(prev => prev.filter(c => c.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campañas"
        description="Gestioná tus iniciativas de prospección por rubro u objetivo"
        action={
          <Button onClick={() => { setEditCampana(undefined); setShowForm(true) }} className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-900/20">
            <Plus className="w-4 h-4 mr-2" /> Nueva campaña
          </Button>
        }
      />

      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          placeholder="Buscar campañas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-gray-900 border-gray-800 text-white focus:border-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            <p className="text-gray-500">Cargando campañas...</p>
          </div>
        ) : campanas.length === 0 ? (
          <>
            <div className="col-span-full flex items-center gap-2 bg-violet-900/20 border border-violet-700/30 rounded-xl px-4 py-2.5">
              <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest border border-violet-500/50 rounded-full px-2 py-0.5">Ejemplos</span>
              <span className="text-xs text-violet-300 font-medium">Así se ven tus campañas — creá la primera con &quot;Nueva campaña&quot;</span>
            </div>
            {[
              { nombre: 'Estéticas CABA — Primavera', objetivo: 'Conseguir 20 reuniones con dueñas de centros de estética en Capital Federal', estado: 'activa', rubro: 'Estéticas' },
              { nombre: 'Restaurantes Córdoba Centro', objetivo: 'Prospectar parrillas y restós en el centro de Córdoba para ofrecer sistema de fidelización', estado: 'pausada', rubro: 'Restaurantes' },
              { nombre: 'Inmobiliarias Gran Rosario', objetivo: 'Demostrar el CRM a inmobiliarias de Rosario que responden tarde a portales', estado: 'activa', rubro: 'Inmobiliarias' },
            ].map((ej, i) => (
              <Card key={i} className="bg-gray-800/40 border-gray-700 flex flex-col opacity-40 pointer-events-none select-none overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-700/50 bg-gray-900/30">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-white">{ej.nombre}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${ej.estado === 'activa' ? 'bg-green-900/20 text-green-400 border-green-700/30' : 'bg-yellow-900/20 text-yellow-400 border-yellow-700/30'}`}>{ej.estado}</span>
                      <span className="text-[10px] bg-gray-900 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700 font-bold uppercase tracking-wider flex items-center gap-1"><Tag className="w-2.5 h-2.5" />{ej.rubro}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex-1 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5"><Target className="w-3 h-3 text-violet-400" />Objetivo</p>
                    <p className="text-xs text-gray-300 leading-relaxed font-medium">{ej.objetivo}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-gray-950/40 p-2.5 rounded-xl border border-gray-800">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Impacto</p>
                      <div className="flex items-center gap-1.5 text-white"><Users className="w-3.5 h-3.5 text-cyan-400" /><span className="text-sm font-black">---</span></div>
                    </div>
                    <div className="bg-gray-950/40 p-2.5 rounded-xl border border-gray-800">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Respuesta</p>
                      <div className="flex items-center gap-1.5 text-white"><BarChart3 className="w-3.5 h-3.5 text-green-400" /><span className="text-sm font-black">---</span></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 pb-4 px-6 border-t border-gray-700/30 bg-gray-900/20">
                  <div className="w-full h-9 rounded-lg bg-gray-800/50" />
                </CardFooter>
              </Card>
            ))}
          </>
        ) : filtered.map((c) => {
          const rubro = (c as any).rubros
          return (
            <Card key={c.id} className={`bg-gray-800/40 border-gray-700 hover:border-violet-500/50 transition-all flex flex-col group overflow-hidden ${c.estado === 'pausada' ? 'opacity-70' : ''}`}>
              <CardHeader className="pb-3 border-b border-gray-700/50 bg-gray-900/30">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                      {c.nombre}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                       <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
                         c.estado === 'activa' ? 'bg-green-900/20 text-green-400 border-green-700/30' : 'bg-yellow-900/20 text-yellow-400 border-yellow-700/30'
                       }`}>
                         {c.estado}
                       </span>
                       {rubro && (
                         <span className="text-[10px] bg-gray-900 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700 font-bold uppercase tracking-wider flex items-center gap-1">
                           <Tag className="w-2.5 h-2.5" /> {rubro.nombre}
                         </span>
                       )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditCampana(c); setShowForm(true) }} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-md transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1 space-y-4">
                <div className="space-y-1">
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <Target className="w-3 h-3 text-violet-400" /> Objetivo
                   </p>
                   <p className="text-xs text-gray-300 leading-relaxed font-medium">
                      {c.objetivo || 'Sin objetivo definido'}
                   </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                   <div className="bg-gray-950/40 p-2.5 rounded-xl border border-gray-800">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Impacto</p>
                      <div className="flex items-center gap-1.5 text-white">
                         <Users className="w-3.5 h-3.5 text-cyan-400" />
                         <span className="text-sm font-black">---</span>
                      </div>
                   </div>
                   <div className="bg-gray-950/40 p-2.5 rounded-xl border border-gray-800">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Respuesta</p>
                      <div className="flex items-center gap-1.5 text-white">
                         <BarChart3 className="w-3.5 h-3.5 text-green-400" />
                         <span className="text-sm font-black">---</span>
                      </div>
                   </div>
                </div>
              </CardContent>
              <CardFooter className="pt-3 pb-4 px-6 border-t border-gray-700/30 bg-gray-900/20">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleToggleEstado(c)}
                  className={`w-full h-9 text-[10px] font-bold uppercase tracking-widest gap-2 ${
                    c.estado === 'activa' 
                      ? 'text-yellow-400 hover:text-white hover:bg-yellow-600' 
                      : 'text-green-400 hover:text-white hover:bg-green-600'
                  }`}
                >
                  {c.estado === 'activa' ? (
                    <> <Pause className="w-3 h-3" /> Pausar campaña </>
                  ) : (
                    <> <Play className="w-3 h-3" /> Reanudar campaña </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <CampanaFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        campana={editCampana}
        rubros={rubros}
        onSave={fetchData}
      />
    </div>
  )
}

function CampanaFormDialog({ open, onOpenChange, campana, rubros, onSave }: { open: boolean, onOpenChange: (o: boolean) => void, campana?: Campaña, rubros: Rubro[], onSave: () => void }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const [formData, setFormData] = useState<Partial<Campaña>>({
    nombre: '',
    objetivo: '',
    estado: 'activa',
    rubro_id: ''
  })

  useEffect(() => {
    if (campana) setFormData({
      nombre: campana.nombre,
      objetivo: campana.objetivo,
      estado: campana.estado,
      rubro_id: campana.rubro_id || ''
    })
    else setFormData({ nombre: '', objetivo: '', estado: 'activa', rubro_id: '' })
  }, [campana, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const payload = { ...formData, user_id: user?.id, rubro_id: formData.rubro_id === '' ? null : formData.rubro_id }
      
      if (campana) {
        const { error } = await supabase.from('campañas').update(payload).eq('id', campana.id)
        if (error) throw error
        toast.success('Campaña actualizada')
      } else {
        const { error } = await supabase.from('campañas').insert([payload])
        if (error) throw error
        toast.success('Campaña creada')
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
          <DialogTitle>{campana ? 'Editar Campaña' : 'Nueva Campaña'}</DialogTitle>
          <DialogDescription className="text-gray-400">Estructurá tu estrategia de prospección.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nombre de la campaña</Label>
            <Input value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} className="bg-gray-800 border-gray-700" placeholder="Ej: Outbound LinkedIn Q2" required />
          </div>
          <div className="space-y-2">
            <Label>Rubro asociado</Label>
            <Select value={formData.rubro_id || 'none'} onValueChange={v => setFormData({ ...formData, rubro_id: v === 'none' ? '' : v })}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Seleccionar rubro" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="none">Sin rubro específico</SelectItem>
                {rubros.map(r => <SelectItem key={r.id} value={r.id}>{r.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Objetivo principal</Label>
            <Input value={formData.objetivo || ''} onChange={e => setFormData({ ...formData, objetivo: e.target.value })} className="bg-gray-800 border-gray-700" placeholder="Ej: Conseguir 10 reuniones en Abril" />
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

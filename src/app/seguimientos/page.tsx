'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { 
  Bell, Calendar, Clock, CheckCircle2, XCircle, 
  Search, Plus, MapPin, AtSign, Phone, Loader2,
  ChevronRight, AlertTriangle, Trash2
} from 'lucide-react'
import type { Seguimiento, Prospecto } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { format, isToday, isBefore, parseISO, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
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

export default function SeguimientosPage() {
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([])
  const [prospectos, setProspectos] = useState<Prospecto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'todos' | 'hoy' | 'vencidos' | 'pendientes'>('todos')
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    const { data: sData } = await supabase
      .from('seguimientos')
      .select('*, prospectos(*)')
      .order('fecha', { ascending: true })
    
    const { data: pData } = await supabase.from('prospectos').select('*').order('nombre')
    
    if (sData) setSeguimientos(sData)
    if (pData) setProspectos(pData)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [supabase])

  const filtered = seguimientos.filter((s) => {
    const matchSearch = (s as any).prospectos?.nombre.toLowerCase().includes(search.toLowerCase()) || 
                       s.titulo.toLowerCase().includes(search.toLowerCase())
    
    const sDate = parseISO(s.fecha)
    if (filter === 'hoy') return matchSearch && isToday(sDate) && s.estado === 'pendiente'
    if (filter === 'vencidos') return matchSearch && isBefore(sDate, new Date()) && !isToday(sDate) && s.estado === 'pendiente'
    if (filter === 'pendientes') return matchSearch && isAfter(sDate, new Date()) && s.estado === 'pendiente'
    return matchSearch
  })

  async function handleToggleEstado(s: Seguimiento) {
    const nuevoEstado = s.estado === 'pendiente' ? 'completado' : 'pendiente'
    const { error } = await supabase
      .from('seguimientos')
      .update({ estado: nuevoEstado })
      .eq('id', s.id)
    
    if (error) toast.error('Error al actualizar')
    else {
      toast.success(nuevoEstado === 'completado' ? 'Seguimiento completado' : 'Seguimiento pendiente')
      setSeguimientos(prev => prev.map(item => item.id === s.id ? { ...item, estado: nuevoEstado } : item))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro?')) return
    const { error } = await supabase.from('seguimientos').delete().eq('id', id)
    if (error) toast.error('Error al eliminar')
    else {
      toast.success('Seguimiento eliminado')
      setSeguimientos(prev => prev.filter(s => s.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seguimientos"
        description="Programá tus próximos pasos para no perder ninguna oportunidad"
        action={
          <Button onClick={() => setShowForm(true)} className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-900/20">
            <Plus className="w-4 h-4 mr-2" /> Programar seguimiento
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-gray-900/50 p-4 rounded-xl border border-gray-800">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Buscar por prospecto o título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {(['todos', 'hoy', 'vencidos', 'pendientes'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                filter === f
                  ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-900/20'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            <p className="text-gray-500">Cargando seguimientos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-gray-900/30 rounded-2xl border border-dashed border-gray-800">
             <Bell className="w-10 h-10 text-gray-700 mx-auto mb-4" />
             <p className="text-gray-500 font-medium">No tenés seguimientos para esta categoría</p>
          </div>
        ) : filtered.map((s) => {
          const prospecto = (s as any).prospectos
          const sDate = parseISO(s.fecha)
          const vencido = isBefore(sDate, new Date()) && !isToday(sDate) && s.estado === 'pendiente'
          const hoy = isToday(sDate) && s.estado === 'pendiente'

          return (
            <Card key={s.id} className={`bg-gray-800/40 border-gray-700 hover:border-gray-500 transition-all overflow-hidden ${s.estado === 'completado' ? 'opacity-60' : ''}`}>
              <CardHeader className={`pb-3 border-b border-gray-700/50 ${vencido ? 'bg-red-900/10' : hoy ? 'bg-yellow-900/10' : 'bg-gray-900/30'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${s.estado === 'completado' ? 'bg-green-900/20 text-green-400' : vencido ? 'bg-red-900/20 text-red-400' : 'bg-violet-900/20 text-violet-400'}`}>
                      {s.estado === 'completado' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-white line-clamp-1">{s.titulo}</CardTitle>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <span className={`text-[10px] font-bold uppercase tracking-tight ${vencido ? 'text-red-400' : hoy ? 'text-yellow-400' : 'text-gray-500'}`}>
                          {format(sDate, "d 'de' MMM, HH:mm", { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <Link href={`/prospectos/${prospecto?.id}`} className="block group">
                  <div className="flex items-center justify-between p-2.5 bg-gray-900/50 rounded-xl border border-gray-800 group-hover:border-violet-500/30 transition-all">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-violet-400 transition-colors truncate">{prospecto?.nombre}</p>
                      <p className="text-[10px] text-gray-500 font-medium truncate">{prospecto?.negocio}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-violet-500 transition-colors" />
                  </div>
                </Link>

                <p className="text-xs text-gray-400 leading-relaxed italic line-clamp-2">
                  {s.descripcion || 'Sin descripción adicional'}
                </p>
              </CardContent>
              <CardFooter className="pt-3 border-t border-gray-700/50 bg-gray-900/20">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleToggleEstado(s)}
                  className={`w-full h-9 text-[10px] font-bold uppercase tracking-widest gap-2 ${
                    s.estado === 'completado' 
                      ? 'text-gray-500 hover:text-white' 
                      : 'text-violet-400 hover:text-white hover:bg-violet-600 shadow-sm'
                  }`}
                >
                  {s.estado === 'completado' ? (
                    <> <XCircle className="w-3 h-3" /> Marcar como pendiente </>
                  ) : (
                    <> <CheckCircle2 className="w-3 h-3" /> Marcar como completado </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <SeguimientoFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        prospectos={prospectos}
        onSave={fetchData}
      />
    </div>
  )
}

function SeguimientoFormDialog({ open, onOpenChange, prospectos, onSave }: { open: boolean, onOpenChange: (o: boolean) => void, prospectos: Prospecto[], onSave: () => void }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const [formData, setFormData] = useState({
    prospecto_id: '',
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '10:00'
  })

  useEffect(() => {
    if (open) setFormData({ prospecto_id: '', titulo: '', descripcion: '', fecha: format(new Date(), 'yyyy-MM-dd'), hora: '10:00' })
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const combinedDate = new Date(`${formData.fecha}T${formData.hora}:00`).toISOString()
      
      const { error } = await supabase.from('seguimientos').insert([{
        prospecto_id: formData.prospecto_id,
        user_id: user?.id,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fecha: combinedDate,
        estado: 'pendiente'
      }])
      
      if (error) throw error
      toast.success('Seguimiento programado')
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
          <DialogTitle>Programar Seguimiento</DialogTitle>
          <DialogDescription className="text-gray-400">No dejes que se enfríe la relación con el prospecto.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Prospecto</Label>
            <Select value={formData.prospecto_id} onValueChange={v => setFormData({ ...formData, prospecto_id: v || '' })}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Seleccionar prospecto" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {prospectos.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre} ({p.negocio})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Título / Acción</Label>
            <Input value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })} className="bg-gray-800 border-gray-700" placeholder="Ej: Llamada de cierre" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input type="date" value={formData.fecha} onChange={e => setFormData({ ...formData, fecha: e.target.value })} className="bg-gray-800 border-gray-700" required />
            </div>
            <div className="space-y-2">
              <Label>Hora</Label>
              <Input type="time" value={formData.hora} onChange={e => setFormData({ ...formData, hora: e.target.value })} className="bg-gray-800 border-gray-700" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} className="bg-gray-800 border-gray-700" placeholder="Detalles de lo que hay que hablar..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading || !formData.prospecto_id} className="bg-violet-600 hover:bg-violet-700">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Programar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

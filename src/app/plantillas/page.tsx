'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { 
  Plus, Search, MessageSquare, Copy, Edit2, Trash2, 
  Tag, Layers, Sparkles, Loader2, Check, ExternalLink,
  Target, Zap, Filter, X
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
import { Badge } from '@/components/ui/badge'

const TIPO_LABELS = {
  initial: 'Primer contacto',
  followup: 'Seguimiento',
  reenganche: 'Re-enganche',
  closing: 'Cierre',
  presentation: 'Presentación',
}

export default function PlantillasPage() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [rubros, setRubros] = useState<Rubro[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [rubroFilter, setRubroFilter] = useState<string>('all')
  const [tipoFilter, setTipoFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editPlantilla, setEditPlantilla] = useState<Plantilla | undefined>()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [prefillRubroId, setPrefillRubroId] = useState<string>('')
  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: pData } = await supabase
        .from('plantillas')
        .select('*')
        .or(`user_id.eq.${user?.id},user_id.is.null`)
        .order('created_at', { ascending: false })
        
      const { data: rData } = await supabase
        .from('rubros')
        .select('*')
        .or(`user_id.eq.${user?.id},user_id.is.null`)
        .order('nombre')

      if (pData) setPlantillas(pData)
      if (rData) setRubros(rData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Handle query params to open form automatically
    const params = new URLSearchParams(window.location.search)
    if (params.get('nuevo') === 'true') {
      const rid = params.get('rubro_id')
      setEditPlantilla(undefined)
      if (rid) setPrefillRubroId(rid)
      setShowForm(true)
    }
  }, [supabase])

  const filtered = plantillas.filter(p => {
    const matchesSearch = p.titulo.toLowerCase().includes(search.toLowerCase()) ||
      p.contenido.toLowerCase().includes(search.toLowerCase())
    const matchesRubro = rubroFilter === 'all' || p.rubro_id === rubroFilter
    const matchesTipo = tipoFilter === 'all' || p.tipo === tipoFilter
    return matchesSearch && matchesRubro && matchesTipo
  })

  function handleCopy(p: Plantilla) {
    navigator.clipboard.writeText(p.contenido)
    setCopiedId(p.id)
    toast.success('Copiado!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return
    const { error } = await supabase.from('plantillas').delete().eq('id', id)
    if (error) toast.error('Error al eliminar')
    else {
      toast.success('Plantilla eliminada')
      setPlantillas(prev => prev.filter(p => p.id !== id))
    }
  }

  return (
    <div className="space-y-6 pb-24 md:pb-10 px-4 md:px-0">
      <PageHeader
        title="Biblioteca de Mensajes"
        description="Textos humanos optimizados para vender. Copiá y pegá lo que necesites."
        action={
          <Button onClick={() => { setEditPlantilla(undefined); setShowForm(true) }} className="w-full md:w-auto bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-900/20 rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Nueva plantilla
          </Button>
        }
      />

      <div className="bg-gray-900/30 p-4 md:p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Buscar por título o contenido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-950 border-gray-800 text-white focus:border-violet-500 h-11 text-sm rounded-xl"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={rubroFilter} onValueChange={setRubroFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-gray-950 border-gray-800 h-11 rounded-xl text-xs">
                <SelectValue placeholder="Filtrar por Rubro" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800 text-white">
                <SelectItem value="all">Todos los rubros</SelectItem>
                {rubros.map(r => <SelectItem key={r.id} value={r.id}>{r.nombre}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-gray-950 border-gray-800 h-11 rounded-xl text-xs">
                <SelectValue placeholder="Tipo de Mensaje" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800 text-white">
                <SelectItem value="all">Cualquier tipo</SelectItem>
                {Object.entries(TIPO_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(rubroFilter !== 'all' || tipoFilter !== 'all' || search !== '') && (
              <Button variant="ghost" onClick={() => { setRubroFilter('all'); setTipoFilter('all'); setSearch('') }} className="h-11 px-4 text-gray-500 hover:text-white rounded-xl text-xs font-bold uppercase">
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-800/20 rounded-2xl animate-pulse border border-gray-800" />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center border border-gray-800">
              <MessageSquare className="w-8 h-8 text-gray-700" />
            </div>
            <div>
              <p className="text-white font-bold">No hay plantillas</p>
              <p className="text-gray-500 text-xs">Ajustá los filtros o creá una nueva.</p>
            </div>
          </div>
        ) : filtered.map((plantilla) => {
          const rubro = rubros.find(r => r.id === plantilla.rubro_id)
          return (
            <Card key={plantilla.id} className="bg-gray-900/40 border-gray-800 hover:border-violet-500/50 transition-all flex flex-col group overflow-hidden relative rounded-2xl">
              <CardHeader className="pb-3 border-b border-gray-800/50 bg-gray-950/40">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary" className="text-[7px] md:text-[8px] uppercase font-bold tracking-widest bg-violet-600/10 text-violet-400 border-violet-500/20 px-1.5 py-0">
                        {TIPO_LABELS[plantilla.tipo as keyof typeof TIPO_LABELS] || plantilla.tipo}
                      </Badge>
                      {rubro && (
                        <Badge variant="outline" className="text-[7px] md:text-[8px] uppercase font-bold tracking-widest text-gray-500 border-gray-800 px-1.5 py-0 truncate max-w-[100px]">
                          {rubro.nombre}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xs md:text-sm font-black text-white group-hover:text-violet-300 transition-colors truncate">
                      {plantilla.titulo}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditPlantilla(plantilla); setShowForm(true) }} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg border border-transparent hover:border-gray-700">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => handleDelete(e, plantilla.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg border border-transparent hover:border-red-900/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <div className="bg-gray-950/80 p-4 rounded-xl border border-gray-800/50 relative group/msg h-full min-h-[120px] flex flex-col justify-center">
                  <p className="text-[11px] md:text-xs text-gray-400 leading-relaxed whitespace-pre-wrap font-medium italic">
                    "{plantilla.contenido}"
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4 px-4 flex flex-col gap-3">
                <div className="flex items-center justify-between w-full px-2">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-500/50" />
                    <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Tono {plantilla.tono}</span>
                  </div>
                  <span className="text-[8px] text-gray-700 font-bold uppercase tracking-tight truncate max-w-[120px]">
                    CTA: <span className="text-gray-500 italic lowercase">{plantilla.cta || 'no definido'}</span>
                  </span>
                </div>
                
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(plantilla)}
                    className="flex-1 bg-gray-950 border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl text-[10px] font-bold uppercase"
                  >
                    {copiedId === plantilla.id ? <Check className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                    Copiar
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-[10px] font-bold uppercase shadow-lg shadow-violet-900/20"
                    onClick={() => {
                      const text = encodeURIComponent(plantilla.contenido)
                      window.open(`https://wa.me/?text=${text}`, '_blank')
                    }}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    Usar
                  </Button>
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
        prefillRubroId={prefillRubroId}
      />
    </div>
  )
}

function PlantillaFormDialog({ open, onOpenChange, plantilla, rubros, onSave, prefillRubroId }: { open: boolean, onOpenChange: (o: boolean) => void, plantilla?: Plantilla, rubros: Rubro[], onSave: () => void, prefillRubroId?: string }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const [formData, setFormData] = useState<Partial<Plantilla>>({
    titulo: '',
    contenido: '',
    tipo: 'initial',
    rubro_id: '',
    tono: 'profesional',
    objetivo: '',
    cta: ''
  })

  useEffect(() => {
    if (plantilla) setFormData({
      titulo: plantilla.titulo,
      contenido: plantilla.contenido,
      tipo: plantilla.tipo,
      rubro_id: plantilla.rubro_id || '',
      tono: plantilla.tono || 'profesional',
      objetivo: plantilla.objetivo || '',
      cta: plantilla.cta || ''
    })
    else setFormData({ 
      titulo: '', 
      contenido: '', 
      tipo: 'initial', 
      rubro_id: prefillRubroId || '', 
      tono: 'profesional', 
      objetivo: '', 
      cta: '' 
    })
  }, [plantilla, open, prefillRubroId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const payload = { ...formData, user_id: user?.id, rubro_id: formData.rubro_id === '' ? null : formData.rubro_id }
      
      if (plantilla) {
        const { error } = await supabase.from('plantillas').update(payload).eq('id', plantilla.id)
        if (error) throw error
        toast.success('Actualizado')
      } else {
        const { error } = await supabase.from('plantillas').insert([payload])
        if (error) throw error
        toast.success('Creado')
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
      <DialogContent className="bg-gray-950 border-gray-800 text-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Configuración de Plantilla</DialogTitle>
          <DialogDescription className="text-gray-400 text-xs">Personalizá tu mensaje de prospección.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500">Título interno</Label>
              <Input value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })} className="bg-gray-900 border-gray-800 rounded-xl" placeholder="Ej: Contacto inicial Parrillas" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500">Tipo de mensaje</Label>
              <Select value={formData.tipo} onValueChange={(v: any) => setFormData({ ...formData, tipo: v })}>
                <SelectTrigger className="bg-gray-900 border-gray-800 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                  {Object.entries(TIPO_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500">Rubro asociado</Label>
              <Select value={formData.rubro_id || 'none'} onValueChange={v => setFormData({ ...formData, rubro_id: v === 'none' ? '' : v })}>
                <SelectTrigger className="bg-gray-900 border-gray-800 rounded-xl">
                  <SelectValue placeholder="Seleccionar rubro" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                  <SelectItem value="none">General (Todos)</SelectItem>
                  {rubros.map(r => <SelectItem key={r.id} value={r.id}>{r.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500">Tono del mensaje</Label>
              <Select value={formData.tono} onValueChange={(v: any) => setFormData({ ...formData, tono: v })}>
                <SelectTrigger className="bg-gray-900 border-gray-800 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                  <SelectItem value="cercano">Cercano (Tuteo)</SelectItem>
                  <SelectItem value="profesional">Profesional</SelectItem>
                  <SelectItem value="relajado">Relajado / Informal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-500">Llamado a la acción (CTA)</Label>
            <Input value={formData.cta || ''} onChange={e => setFormData({ ...formData, cta: e.target.value })} className="bg-gray-900 border-gray-800 rounded-xl" placeholder="Ej: ¿Te interesa que te cuente?" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <Label className="text-xs font-bold text-gray-500">Contenido del mensaje</Label>
              <p className="text-[10px] text-gray-600 font-bold tracking-tight">Usá {"{{nombre}}"} para personalizar</p>
            </div>
            <Textarea 
              value={formData.contenido} 
              onChange={e => setFormData({ ...formData, contenido: e.target.value })} 
              className="bg-gray-900 border-gray-800 h-40 focus:border-violet-500 rounded-2xl p-4 text-xs leading-relaxed" 
              placeholder="Hola! Cómo va? Vi lo que hacen en su negocio y..."
              required 
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700 rounded-xl px-8 font-bold uppercase text-xs">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar Plantilla
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

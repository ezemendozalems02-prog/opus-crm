'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, Search, Tag, MessageSquare, Target, User, 
  AlertCircle, Loader2, Trash2, Edit2, TrendingUp, 
  BarChart3, Zap, ArrowRight, X, Info, Layers, 
  Smartphone, Utensils, Sparkles, Home, Dumbbell, 
  Stethoscope, Flame, Gavel, Building, Truck, 
  Box, Scissors, Warehouse, PencilLine, Activity, 
  Pizza, Car, Briefcase, ShoppingCart, Gem, 
  Hammer, Lightbulb, Fish, IceCream, Users, Coffee, Menu, Copy
} from 'lucide-react'
import type { Rubro, Plantilla } from '@/lib/types'
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
import { Badge } from '@/components/ui/badge'

const ICON_MAP: Record<string, any> = {
  Smartphone, Utensils, Sparkles, Home, Dumbbell, 
  Stethoscope, Flame, Gavel, Building, Truck, 
  Box, Scissors, Warehouse, PencilLine, Activity, 
  Pizza, Car, Briefcase, ShoppingCart, Gem, 
  Hammer, Lightbulb, Fish, IceCream, Users, Coffee,
  Tag
}

export default function RubrosPage() {
  const [rubros, setRubros] = useState<Rubro[]>([])
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPotential, setFilterPotential] = useState<'all' | 'alto' | 'medio' | 'bajo'>('all')
  const [showForm, setShowForm] = useState(false)
  const [selectedRubro, setSelectedRubro] = useState<Rubro | null>(null)
  const [editRubro, setEditRubro] = useState<Rubro | undefined>()
  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Fetch rubros (mine or global)
      const { data: rData } = await supabase
        .from('rubros')
        .select('*')
        .or(`user_id.eq.${user?.id},user_id.is.null`)
        .order('nombre')
        
      const { data: pData } = await supabase
        .from('plantillas')
        .select('*')
        .or(`user_id.eq.${user?.id},user_id.is.null`)

      if (rData) setRubros(rData)
      if (pData) setPlantillas(pData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [supabase])

  const filtered = rubros.filter((r) => {
    const matchesSearch = r.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (r.descripcion || '').toLowerCase().includes(search.toLowerCase())
    const matchesPotential = filterPotential === 'all' || r.potencial_comercial === filterPotential
    return matchesSearch && matchesPotential
  })

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (!confirm('¿Estás seguro de eliminar este rubro?')) return
    const { error } = await supabase.from('rubros').delete().eq('id', id)
    if (error) toast.error('Error al eliminar')
    else {
      toast.success('Rubro eliminado')
      setRubros(prev => prev.filter(r => r.id !== id))
    }
  }

  return (
    <div className="space-y-6 pb-24 md:pb-10 px-4 md:px-0">
      <PageHeader
        title="Rubros y Estrategia"
        description="Niches de mercado precargados con inteligencia comercial y plantillas optimizadas."
        action={
          <Button onClick={() => { setEditRubro(undefined); setShowForm(true) }} className="w-full md:w-auto bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-900/20 rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Nuevo rubro
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-900/30 p-4 rounded-2xl border border-gray-800">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Buscar rubros..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-gray-950 border-gray-800 text-white focus:border-violet-500 h-11 text-sm rounded-xl"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar py-1">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider hidden md:block">Potencial:</span>
          <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800 shrink-0">
            {(['all', 'alto', 'medio', 'bajo'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPotential(p)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                  filterPotential === p 
                    ? 'bg-violet-600 text-white' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {p === 'all' ? 'Todos' : p}
              </button>
            ))}
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
              <Search className="w-8 h-8 text-gray-700" />
            </div>
            <div>
              <p className="text-white font-bold">No hay resultados</p>
              <p className="text-gray-500 text-xs">Probá con otros términos.</p>
            </div>
          </div>
        ) : filtered.map((rubro) => {
          const Icon = ICON_MAP[rubro.icono || 'Tag'] || Tag
          const rubroPlantillas = plantillas.filter(p => p.rubro_id === rubro.id)
          
          return (
            <Card 
              key={rubro.id} 
              onClick={() => setSelectedRubro(rubro)}
              className="bg-gray-900/40 border-gray-800 hover:border-violet-500/50 transition-all group overflow-hidden cursor-pointer relative rounded-2xl"
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden md:flex gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditRubro(rubro); setShowForm(true) }} 
                  className="p-2 bg-gray-950 text-gray-400 hover:text-white rounded-lg border border-gray-800"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={(e) => handleDelete(e, rubro.id)} 
                  className="p-2 bg-gray-950 text-gray-400 hover:text-red-400 rounded-lg border border-gray-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <CardHeader className="pb-3 border-b border-gray-800/50 bg-gray-950/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-violet-600/10 rounded-xl flex items-center justify-center border border-violet-500/20 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm md:text-base font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                      {rubro.nombre}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-[8px] md:text-[9px] uppercase font-bold tracking-tighter ${
                        rubro.potencial_comercial === 'alto' ? 'border-green-500/30 text-green-400 bg-green-500/5' : 
                        rubro.potencial_comercial === 'medio' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5' : 'border-gray-700 text-gray-500'
                      }`}>
                        {rubro.potencial_comercial}
                      </Badge>
                      <span className="text-[9px] text-gray-600 font-medium">
                        {rubroPlantillas.length} plantillas
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <p className="text-[11px] text-gray-500 line-clamp-2 italic leading-relaxed">
                  {rubro.descripcion || 'Estrategia comercial no definida aún.'}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-950/50 p-2 rounded-xl border border-gray-800/50">
                    <p className="text-[8px] text-gray-600 font-bold uppercase mb-1">Dificultad</p>
                    <p className="text-[10px] text-gray-300 font-bold capitalize">{rubro.dificultad_cierre}</p>
                  </div>
                  <div className="bg-gray-950/50 p-2 rounded-xl border border-gray-800/50">
                    <p className="text-[8px] text-gray-600 font-bold uppercase mb-1">Leads Est.</p>
                    <p className="text-[10px] text-gray-300 font-bold">{rubro.prospectos_estimados?.toLocaleString() || '0'}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between group/btn text-violet-400">
                    <span className="text-[9px] font-bold uppercase tracking-widest group-hover:text-violet-300 transition-colors">Ver inteligencia</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={!!selectedRubro} onOpenChange={(o) => !o && setSelectedRubro(null)}>
        <DialogContent className="bg-gray-950 border-gray-800 text-white max-w-5xl p-0 overflow-hidden md:max-h-[85vh] h-full md:h-auto rounded-none md:rounded-3xl">
          {selectedRubro && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-4 md:p-8 bg-gray-900/60 border-b border-gray-800 relative">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-violet-600/10 rounded-3xl flex items-center justify-center border border-violet-500/20 shadow-2xl shadow-violet-500/10">
                    {(() => {
                      const Icon = ICON_MAP[selectedRubro.icono || 'Tag'] || Tag
                      return <Icon className="w-8 h-8 md:w-10 md:h-10 text-violet-400" />
                    })()}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">{selectedRubro.nombre}</h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <Badge className="bg-green-600/10 text-green-400 border-green-500/20 text-[10px] py-0.5 font-bold">
                        POTENCIAL {selectedRubro.potencial_comercial?.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500 font-medium">
                        Nicho: <span className="text-gray-300">{selectedRubro.tipo_cliente || 'No especificado'}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedRubro(null)}
                  className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-8">
                    <section className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400 flex items-center gap-2">
                        <Info className="w-4 h-4" /> Análisis Estratégico
                      </h3>
                      <div className="bg-gray-900/40 p-5 md:p-7 rounded-3xl border border-gray-800 leading-relaxed text-gray-300 text-sm md:text-base">
                        {selectedRubro.descripcion || 'Análisis de mercado pendiente.'}
                      </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 bg-red-500/5 p-6 rounded-3xl border border-red-500/10">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Dolores del Cliente
                        </h3>
                        <ul className="space-y-3">
                          {(selectedRubro.dolores_comunes || []).map((dolor, i) => (
                            <li key={i} className="text-xs md:text-sm text-gray-400 flex items-start gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500/40 mt-1.5 shrink-0" />
                              {dolor}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4 bg-green-500/5 p-6 rounded-3xl border border-green-500/10">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-400 flex items-center gap-2">
                          <Zap className="w-4 h-4" /> Estrategias de Venta
                        </h3>
                        <ul className="space-y-3">
                          {(selectedRubro.estrategias || []).map((est, i) => (
                            <li key={i} className="text-xs md:text-sm text-gray-400 flex items-start gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500/40 mt-1.5 shrink-0" />
                              {est}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gray-900/60 p-6 rounded-3xl border border-gray-800 space-y-6">
                      <h3 className="text-xs font-bold text-white uppercase tracking-widest text-center border-b border-gray-800 pb-4">Métricas</h3>
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-gray-500">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs font-medium">Potencial</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] border-green-500/20 text-green-400 uppercase">{selectedRubro.potencial_comercial}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-gray-500">
                            <Target className="w-4 h-4" />
                            <span className="text-xs font-medium">Dificultad</span>
                          </div>
                          <span className="text-xs font-bold text-white capitalize">{selectedRubro.dificultad_cierre}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-gray-500">
                            <BarChart3 className="w-4 h-4" />
                            <span className="text-xs font-medium">Leads Est.</span>
                          </div>
                          <span className="text-xs font-black text-white">{selectedRubro.prospectos_estimados?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-violet-600/10 p-6 rounded-3xl border border-violet-500/20 space-y-4">
                      <h3 className="text-xs font-bold text-violet-300 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Enfoque Ganador
                      </h3>
                      <p className="text-xs text-violet-200/70 leading-relaxed italic">
                        "{selectedRubro.oportunidad || 'Foco en la inmediatez de respuesta y personalización del servicio.'}"
                      </p>
                    </div>
                  </div>
                </div>

                <section className="space-y-6 pt-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-violet-400" />
                      <h3 className="text-base font-bold text-white">Plantillas Sugeridas</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-[10px] font-bold uppercase border-violet-500/30 text-violet-400 hover:bg-violet-600 hover:text-white rounded-xl"
                        onClick={() => window.location.href=`/plantillas?nuevo=true&rubro_id=${selectedRubro.id}`}
                      >
                        <Plus className="w-3 h-3 mr-2" /> Nueva Plantilla
                      </Button>
                      <Button variant="ghost" className="text-xs text-violet-400 hover:text-white" onClick={() => window.location.href='/plantillas'}>
                        Biblioteca <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plantillas.filter(p => p.rubro_id === selectedRubro.id).length === 0 ? (
                      <div className="col-span-full py-12 bg-gray-900/20 rounded-3xl border border-dashed border-gray-800 flex flex-col items-center gap-3 text-center">
                        <MessageSquare className="w-8 h-8 text-gray-700" />
                        <p className="text-gray-600 text-xs font-medium">No hay plantillas específicas para este rubro.</p>
                      </div>
                    ) : plantillas.filter(p => p.rubro_id === selectedRubro.id).map((p) => (
                      <Card key={p.id} className="bg-gray-900/60 border-gray-800 hover:border-gray-700 transition-all p-5 space-y-4 group/p rounded-2xl">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-[8px] uppercase tracking-widest bg-gray-950 text-gray-500 border-gray-800">
                            {p.tipo}
                          </Badge>
                          <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">
                            Tono {p.tono}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-200">{p.titulo}</h4>
                        <p className="text-xs text-gray-500 line-clamp-3 italic leading-relaxed">"{p.contenido}"</p>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="w-full justify-between text-[10px] text-violet-400 hover:bg-violet-600 hover:text-white rounded-xl font-bold uppercase tracking-widest"
                          onClick={() => {
                            navigator.clipboard.writeText(p.contenido)
                            toast.success('Copiado!')
                          }}
                        >
                          Copiar Mensaje <CopyIcon className="w-3.5 h-3.5 ml-2" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RubroFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        rubro={editRubro}
        onSave={fetchData}
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
    mensaje_sugerido: '',
    icono: 'Tag',
    potencial_comercial: 'medio',
    dificultad_cierre: 'media',
    prospectos_estimados: 0
  })

  useEffect(() => {
    if (rubro) setFormData(rubro)
    else setFormData({ 
      nombre: '', 
      descripcion: '', 
      problema_comun: '', 
      oportunidad: '', 
      tipo_cliente: '', 
      mensaje_sugerido: '',
      icono: 'Tag',
      potencial_comercial: 'medio',
      dificultad_cierre: 'media',
      prospectos_estimados: 0
    })
  }, [rubro, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No hay sesión activa')

      const payload = { ...formData, user_id: user.id }

      if (rubro) {
        const { error } = await supabase.from('rubros').update(payload).eq('id', rubro.id)
        if (error) throw error
        toast.success('Actualizado')
      } else {
        const { error } = await supabase.from('rubros').insert([payload])
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
          <DialogTitle className="text-xl font-bold">Configuración de Rubro</DialogTitle>
          <DialogDescription className="text-gray-500">Definí los parámetros comerciales de este nicho.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-400">Nombre</Label>
              <Input value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} className="bg-gray-900 border-gray-800 focus:border-violet-500 rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-400">Icono (Lucide)</Label>
              <Input value={formData.icono || ''} onChange={e => setFormData({ ...formData, icono: e.target.value })} className="bg-gray-900 border-gray-800 focus:border-violet-500 rounded-xl" placeholder="Smartphone, Utensils..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-400">Análisis del Mercado</Label>
            <Textarea value={formData.descripcion || ''} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} className="bg-gray-900 border-gray-800 focus:border-violet-500 h-24 rounded-xl" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-400">Potencial</Label>
              <select 
                value={formData.potencial_comercial} 
                onChange={e => setFormData({ ...formData, potencial_comercial: e.target.value as any })}
                className="w-full bg-gray-900 border-gray-800 rounded-xl p-2 text-sm text-white"
              >
                <option value="alto">Alto</option>
                <option value="medio">Medio</option>
                <option value="bajo">Bajo</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-400">Dificultad</Label>
              <select 
                value={formData.dificultad_cierre} 
                onChange={e => setFormData({ ...formData, dificultad_cierre: e.target.value as any })}
                className="w-full bg-gray-900 border-gray-800 rounded-xl p-2 text-sm text-white"
              >
                <option value="fácil">Fácil</option>
                <option value="media">Media</option>
                <option value="difícil">Difícil</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-400">Leads Est.</Label>
              <Input type="number" value={formData.prospectos_estimados || 0} onChange={e => setFormData({ ...formData, prospectos_estimados: Number(e.target.value) })} className="bg-gray-900 border-gray-800 focus:border-violet-500 rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-400">Oportunidad Clave</Label>
            <Textarea value={formData.oportunidad || ''} onChange={e => setFormData({ ...formData, oportunidad: e.target.value })} className="bg-gray-900 border-gray-800 focus:border-violet-500 h-20 rounded-xl" />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700 rounded-xl px-8">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CopyIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

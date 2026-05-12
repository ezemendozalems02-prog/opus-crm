'use client'

import { useState, useEffect, useMemo } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, Search, AtSign, Phone, MapPin, 
  Tag, Info, Zap, TrendingUp, Users, MessageSquare,
  CheckCircle2, Clock, AlertCircle, ArrowRight,
  MoreVertical, Edit2, Trash2, Rocket, Star,
  Filter, X, ChevronDown, BarChart3, ExternalLink,
  Loader2, Sparkles, Flame, History, Bookmark
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Lead, Rubro, LeadStatus, LeadPriority } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<LeadStatus, { color: string, bg: string, border: string }> = {
  'Nuevo': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  'Investigando': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  'Pendiente contacto': { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  'Contactado': { color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  'Respondió': { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  'Interesado': { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  'Cliente potencial fuerte': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  'No interesado': { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
  'Descartado': { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  'Convertido': { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
}

const PRIORITY_CONFIG: Record<LeadPriority, { icon: any, color: string, glow: string }> = {
  'Baja': { icon: Clock, color: 'text-gray-500', glow: '' },
  'Media': { icon: TrendingUp, color: 'text-yellow-500', glow: 'shadow-[0_0_10px_rgba(234,179,8,0.2)]' },
  'Alta': { icon: Zap, color: 'text-orange-500', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]' },
  'Muy alta': { icon: Flame, color: 'text-red-500', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]' },
}

export default function ProspeccionPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [rubros, setRubros] = useState<Rubro[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [rubroFilter, setRubroFilter] = useState<string>('all')
  
  const [showQuickForm, setShowQuickForm] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showConvertModal, setShowConvertModal] = useState(false)
  
  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: lData } = await supabase
          .from('leads')
          .select('*, rubro:rubros(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          
        const { data: rData } = await supabase
          .from('rubros')
          .select('*')
          .or(`user_id.eq.${user.id},user_id.is.null`)
          .order('nombre')

        if (lData) setLeads(lData)
        if (rData) setRubros(rData)
      }
    } catch (e) {
      console.error(e)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [supabase])

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = l.nombre.toLowerCase().includes(search.toLowerCase()) || 
                          (l.instagram || '').toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || l.estado === statusFilter
      const matchesPriority = priorityFilter === 'all' || l.prioridad === priorityFilter
      const matchesRubro = rubroFilter === 'all' || l.rubro_id === rubroFilter
      return matchesSearch && matchesStatus && matchesPriority && matchesRubro
    })
  }, [leads, search, statusFilter, priorityFilter, rubroFilter])

  // Stats
  const stats = useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0]
    return {
      total: leads.length,
      hoy: leads.filter(l => l.created_at.startsWith(hoy)).length,
      calientes: leads.filter(l => l.prioridad === 'Muy alta' || l.prioridad === 'Alta').length,
      contactados: leads.filter(l => l.estado === 'Contactado').length
    }
  }, [leads])

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Rocket className="w-8 h-8 text-violet-500" />
            MODO PROSPECCIÓN
          </h1>
          <p className="text-gray-500 font-medium">Radar inteligente de captación de leads.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowBulkModal(true)}
            className="bg-gray-900 border-gray-800 text-gray-400 hover:text-white h-14 rounded-2xl px-6 font-bold uppercase tracking-widest text-[10px]"
          >
            Importar Masivo
          </Button>
          <Button 
            onClick={() => setShowQuickForm(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-6 rounded-2xl shadow-lg shadow-violet-900/20 font-bold gap-2 text-base"
          >
            <Plus className="w-5 h-5" /> CAPTURA RÁPIDA
          </Button>
        </div>
      </div>

      {/* DASHBOARD DE MÉTRICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Leads" value={stats.total} icon={Users} color="violet" />
        <MetricCard label="Captados Hoy" value={stats.hoy} icon={TrendingUp} color="green" />
        <MetricCard label="Prioridad Alta" value={stats.calientes} icon={Flame} color="orange" />
        <MetricCard label="Pendientes" value={leads.filter(l => l.estado === 'Nuevo').length} icon={Clock} color="blue" />
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="bg-gray-900/50 p-4 rounded-3xl border border-gray-800 backdrop-blur-xl flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input 
            placeholder="Buscar por nombre o Instagram..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-950 border-gray-800 pl-12 h-14 rounded-2xl focus:border-violet-500 text-base"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] bg-gray-950 border-gray-800 h-14 rounded-2xl">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="bg-gray-950 border-gray-800 text-white">
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.keys(STATUS_CONFIG).map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-[160px] bg-gray-950 border-gray-800 h-14 rounded-2xl">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent className="bg-gray-950 border-gray-800 text-white">
              <SelectItem value="all">Todas</SelectItem>
              {Object.keys(PRIORITY_CONFIG).map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="ghost" 
            onClick={() => { setSearch(''); setStatusFilter('all'); setPriorityFilter('all'); setRubroFilter('all'); }}
            className="text-gray-500 hover:text-white h-14"
          >
            <X className="w-4 h-4 mr-2" /> Limpiar
          </Button>
        </div>
      </div>

      {/* LISTA DE LEADS */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-900/50 rounded-3xl animate-pulse border border-gray-800" />
          ))
        ) : filteredLeads.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center border border-gray-800">
              <Search className="w-10 h-10 text-gray-700" />
            </div>
            <p className="text-gray-500 font-medium">No se encontraron leads con esos filtros.</p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              onSelect={() => setSelectedLead(lead)}
              onConvert={() => { setSelectedLead(lead); setShowConvertModal(true); }}
            />
          ))
        )}
      </div>

      {/* MODALES */}
      <LeadQuickForm 
        open={showQuickForm} 
        onOpenChange={setShowQuickForm} 
        rubros={rubros} 
        onSave={fetchData} 
      />

      <BulkImportModal
        open={showBulkModal}
        onOpenChange={setShowBulkModal}
        rubros={rubros}
        onSave={fetchData}
      />

      <LeadDetailModal 
        lead={selectedLead} 
        open={!!selectedLead && !showConvertModal} 
        onOpenChange={(o) => !o && setSelectedLead(null)}
        onSave={fetchData}
      />

      <ConvertModal 
        lead={selectedLead}
        open={showConvertModal}
        onOpenChange={setShowConvertModal}
        onComplete={() => { setSelectedLead(null); setShowConvertModal(false); fetchData(); }}
      />
    </div>
  )
}

function MetricCard({ label, value, icon: Icon, color }: { label: string, value: number, icon: any, color: 'violet' | 'green' | 'orange' | 'blue' }) {
  const colors = {
    violet: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
    green: 'text-green-400 bg-green-400/10 border-green-400/20',
    orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  }
  return (
    <div className="bg-gray-900/40 p-6 rounded-3xl border border-gray-800 hover:border-gray-700 transition-all group">
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-2xl border", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-3xl font-black text-white tabular-nums group-hover:scale-110 transition-transform">{value}</span>
      </div>
      <p className="mt-4 text-gray-500 text-xs font-bold uppercase tracking-widest">{label}</p>
    </div>
  )
}

function LeadCard({ lead, onSelect, onConvert }: { lead: Lead, onSelect: () => void, onConvert: () => void }) {
  const status = STATUS_CONFIG[lead.estado]
  const priority = PRIORITY_CONFIG[lead.prioridad]
  const PriorityIcon = priority.icon

  return (
    <div 
      className="bg-gray-900/40 border border-gray-800 p-5 md:p-6 rounded-3xl hover:border-violet-500/50 transition-all group relative overflow-hidden"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-5 min-w-0 flex-1">
          <div 
            onClick={onSelect}
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 cursor-pointer group-hover:scale-105 transition-transform",
              priority.color, priority.glow, "bg-gray-950 border-gray-800"
            )}
          >
            <PriorityIcon className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h3 
                onClick={onSelect}
                className="text-lg font-black text-white group-hover:text-violet-300 transition-colors cursor-pointer truncate"
              >
                {lead.nombre}
              </h3>
              <Badge className={cn("text-[10px] uppercase font-bold tracking-widest", status.bg, status.color, status.border)}>
                {lead.estado}
              </Badge>
              <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-800 bg-gray-950">
                {lead.fuente}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Tag className="w-3.5 h-3.5 text-violet-500" />
                <span className="font-medium">{(lead as any).rubro?.nombre || 'General'}</span>
              </div>
              {lead.ciudad && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span className="font-medium">{lead.ciudad}</span>
                </div>
              )}
              {lead.ultima_actividad && (
                <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  Hace {new Date(lead.ultima_actividad).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <div className="flex items-center gap-2 mr-2">
            {lead.instagram && (
              <a href={`https://instagram.com/${lead.instagram.replace('@','')}`} target="_blank" className="p-3 bg-pink-500/10 text-pink-500 rounded-xl border border-pink-500/20 hover:bg-pink-500 hover:text-white transition-all">
                <AtSign className="w-5 h-5" />
              </a>
            )}
            {lead.whatsapp && (
              <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g,'')}`} target="_blank" className="p-3 bg-green-500/10 text-green-500 rounded-xl border border-green-500/20 hover:bg-green-500 hover:text-white transition-all">
                <Phone className="w-5 h-5" />
              </a>
            )}
          </div>
          <Button 
            onClick={onConvert}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold gap-2 shadow-lg shadow-indigo-900/20"
          >
            <Sparkles className="w-4 h-4" /> CONVERTIR
          </Button>
          <Button variant="ghost" size="icon" onClick={onSelect} className="text-gray-500 hover:text-white rounded-xl">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Mini etiquetas rápidas */}
      {lead.etiquetas && lead.etiquetas.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {lead.etiquetas.slice(0, 5).map(tag => (
            <span key={tag} className="text-[9px] font-bold text-gray-500 bg-gray-950 px-2 py-0.5 rounded border border-gray-800">
              #{tag}
            </span>
          ))}
          {lead.etiquetas.length > 5 && <span className="text-[9px] text-gray-600">+{lead.etiquetas.length - 5}</span>}
        </div>
      )}
    </div>
  )
}

function LeadQuickForm({ open, onOpenChange, rubros, onSave }: { open: boolean, onOpenChange: (o: boolean) => void, rubros: Rubro[], onSave: () => void }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const [formData, setFormData] = useState<Partial<Lead>>({
    nombre: '',
    rubro_id: '',
    instagram: '',
    whatsapp: '',
    ciudad: '',
    fuente: 'Instagram',
    prioridad: 'Media',
    estado: 'Nuevo',
    observaciones: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('leads').insert([{
        ...formData,
        user_id: user?.id,
        score: 0,
        ultima_actividad: new Date().toISOString()
      }])
      if (error) throw error
      toast.success('Lead capturado con éxito')
      onSave()
      onOpenChange(false)
      setFormData({ nombre: '', rubro_id: '', instagram: '', whatsapp: '', ciudad: '', fuente: 'Instagram', prioridad: 'Media', estado: 'Nuevo', observaciones: '' })
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-950 border-gray-800 text-white sm:max-w-[600px] rounded-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-white tracking-tight">CAPTURA RÁPIDA DE LEAD</DialogTitle>
          <DialogDescription className="text-gray-500">Agregá un potencial cliente en segundos para investigarlo luego.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nombre del Negocio</Label>
              <Input 
                value={formData.nombre} 
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                className="bg-gray-900 border-gray-800 focus:border-violet-500 h-12 rounded-xl"
                placeholder="Ej: Parrilla Don Juan"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Rubro</Label>
              <Select value={formData.rubro_id || ''} onValueChange={v => setFormData({ ...formData, rubro_id: v })}>
                <SelectTrigger className="bg-gray-900 border-gray-800 h-12 rounded-xl">
                  <SelectValue placeholder="Seleccionar rubro" />
                </SelectTrigger>
                <SelectContent className="bg-gray-950 border-gray-800 text-white">
                  {rubros.map(r => <SelectItem key={r.id} value={r.id}>{r.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Instagram (@)</Label>
              <Input 
                value={formData.instagram || ''} 
                onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                className="bg-gray-900 border-gray-800 focus:border-violet-500 h-12 rounded-xl"
                placeholder="parrilla_donjuan"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">WhatsApp</Label>
              <Input 
                value={formData.whatsapp || ''} 
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                className="bg-gray-900 border-gray-800 focus:border-violet-500 h-12 rounded-xl"
                placeholder="54911..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Prioridad</Label>
              <Select value={formData.prioridad} onValueChange={(v: any) => setFormData({ ...formData, prioridad: v })}>
                <SelectTrigger className="bg-gray-900 border-gray-800 h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-950 border-gray-800 text-white">
                  <SelectItem value="Baja">⚪ Baja</SelectItem>
                  <SelectItem value="Media">🟡 Media</SelectItem>
                  <SelectItem value="Alta">⚡ Alta</SelectItem>
                  <SelectItem value="Muy alta">🔥 Muy Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fuente</Label>
              <Select value={formData.fuente} onValueChange={v => setFormData({ ...formData, fuente: v })}>
                <SelectTrigger className="bg-gray-900 border-gray-800 h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-950 border-gray-800 text-white">
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Google Maps">Google Maps</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Referido">Referido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ciudad</Label>
              <Input 
                value={formData.ciudad || ''} 
                onChange={e => setFormData({ ...formData, ciudad: e.target.value })}
                className="bg-gray-900 border-gray-800 focus:border-violet-500 h-12 rounded-xl"
                placeholder="Ej: Posadas"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Observaciones Iniciales</Label>
            <Textarea 
              value={formData.observaciones || ''} 
              onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
              className="bg-gray-900 border-gray-800 focus:border-violet-500 h-24 rounded-xl resize-none"
              placeholder="¿Qué detectaste en este lead?"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700 h-12 px-8 rounded-xl font-bold uppercase tracking-widest">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              GUARDAR LEAD
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function LeadDetailModal({ lead, open, onOpenChange, onSave }: { lead: Lead | null, open: boolean, onOpenChange: (o: boolean) => void, onSave: () => void }) {
  if (!lead) return null
  const [loading, setLoading] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [notes, setNotes] = useState<any[]>([])
  const [etiquetaInput, setEtiquetaInput] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (open && lead) {
      loadNotes()
    }
  }, [open, lead])

  async function loadNotes() {
    const { data } = await supabase.from('lead_notes').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false })
    if (data) setNotes(data)
  }

  async function addNote() {
    if (!newNote.trim()) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('lead_notes').insert({ lead_id: lead.id, user_id: user?.id, contenido: newNote })
    setNewNote('')
    loadNotes()
    setLoading(false)
  }

  async function updateStatus(newStatus: LeadStatus) {
    const { error } = await supabase.from('leads').update({ estado: newStatus, ultima_actividad: new Date().toISOString() }).eq('id', lead.id)
    if (!error) {
      toast.success('Estado actualizado')
      onSave()
    }
  }

  async function addTag() {
    if (!etiquetaInput.trim()) return
    const newTags = [...(lead.etiquetas || []), etiquetaInput.trim()]
    const { error } = await supabase.from('leads').update({ etiquetas: newTags }).eq('id', lead.id)
    if (!error) {
      setEtiquetaInput('')
      onSave()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-950 border-gray-800 text-white sm:max-w-3xl rounded-[2.5rem] max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <div className="p-8 border-b border-gray-800 bg-gray-900/40">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-white tracking-tight">{lead.nombre}</h2>
              <div className="flex items-center gap-2">
                <Badge className={cn("text-[10px] uppercase font-bold", STATUS_CONFIG[lead.estado].bg, STATUS_CONFIG[lead.estado].color)}>
                  {lead.estado}
                </Badge>
                <span className="text-xs text-gray-500 font-medium italic">{(lead as any).rubro?.nombre}</span>
              </div>
            </div>
            <div className="flex gap-2">
               <Select value={lead.estado} onValueChange={(v: any) => updateStatus(v)}>
                  <SelectTrigger className="bg-gray-950 border-gray-800 w-[160px] h-10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800 text-white">
                    {Object.keys(STATUS_CONFIG).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
               </Select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-6">
                <section className="space-y-4">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Info className="w-4 h-4 text-violet-500" /> Datos de Contacto
                  </h3>
                  <div className="bg-gray-900/40 p-4 rounded-3xl border border-gray-800 space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Instagram</span>
                        <a href={`https://instagram.com/${lead.instagram?.replace('@','')}`} target="_blank" className="text-sm font-bold text-pink-400 hover:underline flex items-center gap-2">
                          @{lead.instagram} <ExternalLink className="w-3 h-3" />
                        </a>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">WhatsApp</span>
                        <a href={`https://wa.me/${lead.whatsapp?.replace(/\D/g,'')}`} target="_blank" className="text-sm font-bold text-green-400 hover:underline flex items-center gap-2">
                          {lead.whatsapp} <Phone className="w-3 h-3" />
                        </a>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Ubicación</span>
                        <span className="text-sm font-bold text-white">{lead.ciudad || 'No especificada'}</span>
                     </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Tag className="w-4 h-4 text-violet-500" /> Etiquetas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Nueva etiqueta..." 
                        value={etiquetaInput} 
                        onChange={e => setEtiquetaInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addTag()}
                        className="bg-gray-900 border-gray-800 h-9 rounded-xl text-xs"
                      />
                      <Button size="sm" onClick={addTag} className="bg-gray-800 hover:bg-gray-700 rounded-xl h-9">
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(lead.etiquetas || []).map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-violet-400 bg-violet-400/10 px-3 py-1 rounded-full border border-violet-400/20">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
             </div>

             <div className="space-y-6">
                <section className="space-y-4">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <History className="w-4 h-4 text-violet-500" /> Bitácora de Prospección
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Textarea 
                        placeholder="Escribí una nota rápida..." 
                        value={newNote} 
                        onChange={e => setNewNote(e.target.value)}
                        className="bg-gray-900 border-gray-800 rounded-2xl text-sm h-20 resize-none"
                      />
                    </div>
                    <Button 
                      onClick={addNote} 
                      disabled={loading || !newNote.trim()}
                      className="w-full bg-violet-600 hover:bg-violet-700 h-10 rounded-xl font-bold uppercase text-[10px] tracking-widest"
                    >
                      {loading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                      GUARDAR NOTA
                    </Button>

                    <div className="space-y-4 pt-2">
                      {notes.map(note => (
                        <div key={note.id} className="bg-gray-900/60 p-4 rounded-2xl border border-gray-800 space-y-2">
                          <p className="text-xs text-gray-300 leading-relaxed">{note.contenido}</p>
                          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">
                            {new Date(note.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ConvertModal({ lead, open, onOpenChange, onComplete }: { lead: Lead | null, open: boolean, onOpenChange: (o: boolean) => void, onComplete: () => void }) {
  if (!lead) return null
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleConvert() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // 1. Create Prospecto
      const { error: pError } = await supabase.from('prospectos').insert([{
        user_id: user?.id,
        nombre: lead.nombre,
        negocio: lead.nombre,
        rubro_id: lead.rubro_id,
        ciudad: lead.ciudad,
        instagram: lead.instagram,
        whatsapp: lead.whatsapp,
        estado: 'Nuevo',
        nivel_interes: lead.prioridad === 'Muy alta' ? 100 : lead.prioridad === 'Alta' ? 75 : lead.prioridad === 'Media' ? 50 : 25,
        score: lead.score,
        notas: lead.observaciones
      }])
      if (pError) throw pError

      // 2. Mark Lead as Converted
      const { error: lError } = await supabase.from('leads').update({ estado: 'Convertido' }).eq('id', lead.id)
      if (lError) throw lError

      toast.success('¡Convertido a Prospecto exitosamente!')
      onComplete()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-950 border-gray-800 text-white rounded-[2rem] sm:max-w-md">
        <DialogHeader>
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 mb-4">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <DialogTitle className="text-2xl font-black text-white">¿Convertir en Prospecto?</DialogTitle>
          <DialogDescription className="text-gray-500 pt-2">
            Este lead pasará oficialmente a tu Pipeline de ventas. Mantendrá toda la información y notas acumuladas durante la prospección.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 my-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-950 rounded-xl flex items-center justify-center border border-gray-800">
               <Users className="w-5 h-5 text-gray-500" />
            </div>
            <div>
               <p className="text-sm font-bold text-white">{lead.nombre}</p>
               <p className="text-[10px] text-gray-500 font-bold uppercase">{(lead as any).rubro?.nombre || 'General'}</p>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            onClick={handleConvert} 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold uppercase tracking-widest px-8"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            SÍ, CONVERTIR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BulkImportModal({ open, onOpenChange, rubros, onSave }: { open: boolean, onOpenChange: (o: boolean) => void, rubros: Rubro[], onSave: () => void }) {
  const [loading, setLoading] = useState(false)
  const [rawText, setRawText] = useState('')
  const [rubroId, setRubroId] = useState('')
  const supabase = createClient()

  async function handleImport() {
    if (!rawText.trim()) return
    setLoading(true)
    try {
      const lines = rawText.split('\n').filter(l => l.trim())
      const { data: { user } } = await supabase.auth.getUser()
      
      const newLeads = lines.map(line => {
        // Simple parser: try to detect name and IG/WA
        const parts = line.split(/[,;\t]/)
        const nombre = parts[0]?.trim() || 'Lead sin nombre'
        const ig = parts.find(p => p.includes('@'))?.replace('@', '').trim() || null
        const wa = parts.find(p => /^\d+$/.test(p.replace(/\D/g, '')))?.trim() || null
        
        return {
          user_id: user?.id,
          nombre,
          instagram: ig,
          whatsapp: wa,
          rubro_id: rubroId === 'none' ? null : (rubroId || null),
          estado: 'Nuevo',
          prioridad: 'Media',
          fuente: 'Importación'
        }
      })

      const { error } = await supabase.from('leads').insert(newLeads)
      if (error) throw error
      
      toast.success(`¡${newLeads.length} leads importados!`)
      onSave()
      onOpenChange(false)
      setRawText('')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-950 border-gray-800 text-white sm:max-w-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">IMPORTACIÓN MASIVA</DialogTitle>
          <DialogDescription className="text-gray-500">Pegá una lista de nombres, Instagrams o WhatsApps (uno por línea).</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-500 uppercase">Rubro para todos</Label>
            <Select value={rubroId} onValueChange={setRubroId}>
              <SelectTrigger className="bg-gray-900 border-gray-800 h-12 rounded-xl">
                <SelectValue placeholder="Opcional: Asignar rubro" />
              </SelectTrigger>
              <SelectContent className="bg-gray-950 border-gray-800 text-white">
                <SelectItem value="none">Sin rubro</SelectItem>
                {rubros.map(r => <SelectItem key={r.id} value={r.id}>{r.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-500 uppercase">Datos (Nombre, @IG, WhatsApp)</Label>
            <Textarea 
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="Ejemplo:&#10;Juan Perez, @juan_p, 54911...&#10;Maria Lopez, @marial, 54911..."
              className="bg-gray-900 border-gray-800 h-64 rounded-2xl p-4 text-xs font-mono"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            onClick={handleImport} 
            disabled={loading || !rawText.trim()}
            className="bg-violet-600 hover:bg-violet-700 h-12 px-8 rounded-xl font-bold uppercase"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            PROCESAR E IMPORTAR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { LeadStatusBadge } from '@/components/leads/lead-status-badge'
import { InterestStars } from '@/components/leads/interest-stars'
import { ScoreBadge } from '@/components/leads/score-badge'
import type { Prospecto, LeadStatus } from '@/lib/types'
import { computeScore, getScoreTier } from '@/lib/score'
import { Plus, Search, AtSign, Phone, MapPin, ChevronRight, Loader2, Trash2, Settings } from 'lucide-react'
import Link from 'next/link'
import { ProspectoFormDialog } from '@/components/leads/lead-form-dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const STATUS_OPTIONS: { value: LeadStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'Nuevo', label: 'Nuevo' },
  { value: 'Contactado', label: 'Contactado' },
  { value: 'Respondió', label: 'Respondió' },
  { value: 'Interesado', label: 'Interesado' },
  { value: 'Reunión', label: 'Reunión' },
  { value: 'Propuesta', label: 'Propuesta' },
  { value: 'Ganado', label: 'Ganado' },
  { value: 'Perdido', label: 'Perdido' },
]

type TierFilter = 'all' | 'listo' | 'interesado' | 'tibio' | 'frio'

const TIER_OPTIONS: { value: TierFilter; label: string; color: string }[] = [
  { value: 'all', label: 'Todos los scores', color: '' },
  { value: 'listo', label: 'Listo para cerrar', color: 'text-green-400' },
  { value: 'interesado', label: 'Interesado', color: 'text-yellow-400' },
  { value: 'tibio', label: 'Tibio', color: 'text-orange-400' },
  { value: 'frio', label: 'Frío', color: 'text-gray-400' },
]

export default function ProspectosPage() {
  const [prospectos, setProspectos] = useState<Prospecto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [tierFilter, setTierFilter] = useState<TierFilter>('all')
  const [showForm, setShowForm] = useState(false)
  const [editProspecto, setEditProspecto] = useState<Prospecto | undefined>()
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()

  const fetchProspectos = async () => {
    setLoading(true)
    
    // Fetch profile and prospectos
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data: p } = await supabase.from('perfiles').select('*').eq('id', user.id).single()
    setProfile(p)

    const { data, error } = await supabase
      .from('prospectos')
      .select('*, rubros(nombre)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      toast.error('Error al cargar prospectos')
    } else {
      setProspectos(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProspectos()
  }, [supabase])

  const handleNewProspecto = () => {
    if (profile?.es_demo && prospectos.length >= 20) {
      toast.error('Límite de Demo alcanzado (máx 20 prospectos). Contactanos para activar tu cuenta.')
      return
    }
    setEditProspecto(undefined)
    setShowForm(true)
  }

  const filtered = prospectos
    .filter((l) => {
      const matchSearch =
        l.nombre.toLowerCase().includes(search.toLowerCase()) ||
        l.negocio.toLowerCase().includes(search.toLowerCase()) ||
        (l as any).rubros?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        (l.rubro_nombre || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.ciudad || '').toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || l.estado === statusFilter
      const matchTier = tierFilter === 'all' || getScoreTier(computeScore(l as any)).tier === tierFilter
      return matchSearch && matchStatus && matchTier
    })

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar este prospecto?')) return

    const { error } = await supabase.from('prospectos').delete().eq('id', id)
    if (error) {
      toast.error('Error al eliminar')
    } else {
      toast.success('Prospecto eliminado')
      setProspectos((prev) => prev.filter((l) => l.id !== id))
    }
  }

  const stats = {
    total: prospectos.length,
    activos: prospectos.filter((l) => !['Ganado', 'Perdido', 'Nuevo'].includes(l.estado)).length,
    ganados: prospectos.filter((l) => l.estado === 'Ganado').length,
    perdidos: prospectos.filter((l) => l.estado === 'Perdido').length,
  }

  return (
    <div>
      <PageHeader
        title="Prospectos"
        description={`${filtered.length} prospectos encontrados`}
        action={
          <Button onClick={handleNewProspecto} className="bg-violet-600 hover:bg-violet-700 font-bold uppercase text-[10px] tracking-widest px-6 h-11 rounded-xl shadow-lg shadow-violet-900/20">
            <Plus className="w-4 h-4 mr-2" /> Nuevo prospecto
          </Button>
        }
      />

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Activos', value: stats.activos, color: 'text-blue-400' },
          { label: 'Ganados', value: stats.ganados, color: 'text-green-400' },
          { label: 'Perdidos', value: stats.perdidos, color: 'text-red-400' },
        ].map((s) => (
          <Card key={s.label} className="bg-gray-800/50 border-gray-700 shadow-sm">
            <CardContent className="pt-3 pb-3">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <div className="space-y-3 mb-5 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, negocio, rubro o ciudad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-violet-500"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap items-center">
            <span className="text-xs text-gray-500 shrink-0">Score:</span>
            {TIER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTierFilter(opt.value)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  tierFilter === opt.value
                    ? 'bg-violet-600 text-white border-violet-500'
                    : `bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white ${opt.color}`
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                statusFilter === opt.value
                  ? 'bg-violet-600 text-white border-violet-500'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <Card className="bg-gray-800/50 border-gray-700 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-900/50">
                  <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Prospecto</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rubro</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contacto</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Estado</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Interés</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Score</th>
                  <th className="text-right py-4 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
                        <span className="text-sm text-gray-500">Cargando prospectos...</span>
                      </div>
                    </td>
                  </tr>
                ) : prospectos.length === 0 ? (
                  <>
                    <tr>
                      <td colSpan={7} className="pt-6 pb-2 px-4">
                        <div className="flex items-center gap-2 bg-violet-900/20 border border-violet-700/30 rounded-xl px-4 py-2.5">
                          <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest border border-violet-500/50 rounded-full px-2 py-0.5">Ejemplos</span>
                          <span className="text-xs text-violet-300 font-medium">Así se ven tus prospectos — agregá el tuyo con el botón &quot;Nuevo prospecto&quot;</span>
                        </div>
                      </td>
                    </tr>
                    {[
                      { nombre: 'Laura García', negocio: 'Estética Luminous', rubro: 'Estéticas', ciudad: 'Buenos Aires', estado: 'Interesado', nivel_interes: 4, instagram: '@luminous.estetica', whatsapp: '1154321098' },
                      { nombre: 'Marcos Rodríguez', negocio: 'Parrilla Don Marcos', rubro: 'Restaurantes', ciudad: 'Córdoba', estado: 'Contactado', nivel_interes: 3, instagram: '@donmarcos.parrilla', whatsapp: '3514567890' },
                      { nombre: 'Sofía Benítez', negocio: 'Inmobiliaria Sur', rubro: 'Inmobiliarias', ciudad: 'Rosario', estado: 'Nuevo', nivel_interes: 2, instagram: '@inmosur', whatsapp: '3411234567' },
                    ].map((ej, i) => (
                      <tr key={i} className="opacity-40 pointer-events-none select-none">
                        <td className="py-4 px-4">
                          <p className="text-sm font-semibold text-white">{ej.nombre}</p>
                          <p className="text-xs text-gray-500">{ej.negocio}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs text-gray-300">{ej.rubro}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-gray-600" />
                            <span className="text-[10px] text-gray-600 font-medium">{ej.ciudad}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5"><AtSign className="w-3 h-3 text-pink-500" /><span className="text-xs text-gray-400">{ej.instagram}</span></div>
                            <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-green-500" /><span className="text-xs text-gray-400">{ej.whatsapp}</span></div>
                          </div>
                        </td>
                        <td className="py-4 px-4"><LeadStatusBadge status={ej.estado as any} /></td>
                        <td className="py-4 px-4"><InterestStars level={ej.nivel_interes} /></td>
                        <td className="py-4 px-4"><span className="text-xs text-gray-500">—</span></td>
                        <td className="py-4 px-4" />
                      </tr>
                    ))}
                  </>
                ) : filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">{lead.nombre}</p>
                        <p className="text-xs text-gray-500">{lead.negocio}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs text-gray-300">{lead.rubro_nombre || (lead as any).rubros?.nombre || 'General'}</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-600" />
                        <span className="text-[10px] text-gray-600 font-medium">{lead.ciudad || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        {lead.instagram && (
                          <div className="flex items-center gap-1.5">
                            <AtSign className="w-3 h-3 text-pink-500" />
                            <span className="text-xs text-gray-400">{lead.instagram}</span>
                          </div>
                        )}
                        {lead.whatsapp && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-gray-400">{lead.whatsapp}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <LeadStatusBadge status={lead.estado} />
                    </td>
                    <td className="py-4 px-4">
                      <InterestStars level={lead.nivel_interes} />
                    </td>
                    <td className="py-4 px-4">
                      <ScoreBadge lead={lead as any} showBar />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => { setEditProspecto(lead); setShowForm(true) }} 
                          className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(lead.id)} 
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link href={`/prospectos/${lead.id}`} className="p-1.5 text-violet-400 hover:text-violet-300 hover:bg-violet-900/20 rounded-lg transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-20 bg-gray-900/30">
              <div className="bg-gray-800/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-gray-500 text-sm font-medium">No se encontraron prospectos con estos filtros</p>
              <Button 
                variant="link" 
                onClick={() => { setSearch(''); setStatusFilter('all'); setTierFilter('all') }}
                className="text-violet-400 mt-2"
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ProspectoFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        lead={editProspecto as any}
        onSave={() => {
          fetchProspectos()
          setShowForm(false)
          setEditProspecto(undefined)
        }}
      />
    </div>
  )
}

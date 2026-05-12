'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { InterestStars } from '@/components/leads/interest-stars'
import type { Prospecto, LeadStatus } from '@/lib/types'
import { AtSign, Phone, MapPin, GripVertical, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { computeScore, getScoreTier } from '@/lib/score'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const ETAPAS: { status: LeadStatus; label: string; color: string; dot: string }[] = [
  { status: 'Nuevo', label: 'Nuevo', color: 'border-gray-500', dot: 'bg-gray-400' },
  { status: 'Contactado', label: 'Contactado', color: 'border-blue-500', dot: 'bg-blue-400' },
  { status: 'Respondió', label: 'Respondió', color: 'border-cyan-500', dot: 'bg-cyan-400' },
  { status: 'Interesado', label: 'Interesado', color: 'border-yellow-500', dot: 'bg-yellow-400' },
  { status: 'Reunión', label: 'Reunión', color: 'border-purple-500', dot: 'bg-purple-400' },
  { status: 'Propuesta', label: 'Propuesta', color: 'border-orange-500', dot: 'bg-orange-400' },
  { status: 'Ganado', label: 'Ganado', color: 'border-green-500', dot: 'bg-green-400' },
  { status: 'Perdido', label: 'Perdido', color: 'border-red-500', dot: 'bg-red-400' },
]

const TEMP_COLORS: Partial<Record<LeadStatus, string>> = {
  'Nuevo': 'border-gray-700',
  'Contactado': 'border-gray-700',
  'Respondió': 'border-yellow-600/30',
  'Interesado': 'border-yellow-500/50',
  'Reunión': 'border-green-500/50',
  'Propuesta': 'border-green-600/60',
  'Ganado': 'border-green-500',
  'Perdido': 'border-red-800/40',
}

export default function PipelinePage() {
  const [prospectos, setProspectos] = useState<Prospecto[]>([])
  const [loading, setLoading] = useState(true)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProspectos() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data, error } = await supabase
        .from('prospectos')
        .select('*, rubros(nombre)')
        .eq('user_id', user.id)
        .order('score', { ascending: false })

      if (data) setProspectos(data)
      setLoading(false)
    }
    fetchProspectos()
  }, [supabase])

  function handleDragStart(id: string) { setDragging(id) }

  async function handleDrop(status: LeadStatus) {
    if (!dragging) return
    
    // Update local state for optimistic UI
    const originalProspectos = [...prospectos]
    setProspectos((prev) => prev.map((l) => l.id === dragging ? { ...l, estado: status } : l))
    
    const { error } = await supabase
      .from('prospectos')
      .update({ estado: status })
      .eq('id', dragging)

    if (error) {
      toast.error('Error al actualizar estado')
      setProspectos(originalProspectos) // Revert on error
    } else {
      // Also track activity
      await supabase.from('actividades_prospecto').insert({
        prospecto_id: dragging,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        tipo: 'status_change',
        contenido: `Estado cambiado a ${status}`
      })
      toast.success('Estado actualizado')
    }

    setDragging(null)
    setDragOver(null)
  }

  function handleDragOver(e: React.DragEvent, status: LeadStatus) {
    e.preventDefault()
    setDragOver(status)
  }

  const getLeadsByStatus = (status: LeadStatus) => prospectos.filter((l) => l.estado === status)
  const totalActivos = prospectos.filter((l) => !['Ganado', 'Perdido'].includes(l.estado)).length

  const EJEMPLOS_PIPELINE: Record<string, { nombre: string; negocio: string; ciudad: string; rubro: string; nivel_interes: number }[]> = {
    'Nuevo': [{ nombre: 'Sofía Benítez', negocio: 'Inmobiliaria Sur', ciudad: 'Rosario', rubro: 'Inmobiliarias', nivel_interes: 2 }],
    'Contactado': [{ nombre: 'Marcos Rodríguez', negocio: 'Parrilla Don Marcos', ciudad: 'Córdoba', rubro: 'Restaurantes', nivel_interes: 3 }],
    'Interesado': [{ nombre: 'Laura García', negocio: 'Estética Luminous', ciudad: 'Buenos Aires', rubro: 'Estéticas', nivel_interes: 4 }],
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <p className="text-gray-400 text-sm animate-pulse">Cargando pipeline...</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Pipeline"
        description={prospectos.length === 0 ? 'Ejemplos de cómo se ve el pipeline — agregá prospectos para ver los reales' : `${totalActivos} prospectos activos — arrastrar para cambiar etapa`}
      />
      {prospectos.length === 0 && (
        <div className="flex items-center gap-2 bg-violet-900/20 border border-violet-700/30 rounded-xl px-4 py-2.5 mb-4">
          <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest border border-violet-500/50 rounded-full px-2 py-0.5">Ejemplos</span>
          <span className="text-xs text-violet-300 font-medium">Agregá prospectos desde la sección Prospectos para verlos acá y arrastrarlos entre etapas</span>
        </div>
      )}

      <p className="text-[10px] text-gray-600 mb-3 flex items-center gap-1 md:hidden">
        <span>←</span> Deslizá para ver todas las etapas <span>→</span>
      </p>
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0" style={{ minHeight: '75vh' }}>
        {ETAPAS.map((etapa) => {
          const etapaLeads = getLeadsByStatus(etapa.status)
          const isDragTarget = dragOver === etapa.status

          return (
            <div
              key={etapa.status}
              className="flex-shrink-0 w-56 sm:w-64"
              onDragOver={(e) => handleDragOver(e, etapa.status)}
              onDrop={() => handleDrop(etapa.status)}
              onDragLeave={() => setDragOver(null)}
            >
              <div className={`border-t-2 ${etapa.color} bg-gray-800/60 rounded-t-lg px-3 py-3 flex items-center justify-between mb-2 shadow-sm`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${etapa.dot} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                  <span className="text-sm font-bold text-white">{etapa.label}</span>
                </div>
                <span className="text-[10px] bg-gray-900 text-gray-400 rounded-full px-2 py-0.5 font-bold border border-gray-700">
                  {etapaLeads.length}
                </span>
              </div>

              <div
                className={`min-h-[500px] rounded-b-lg rounded-tr-lg p-2 space-y-2 transition-all duration-200 ${
                  isDragTarget ? 'bg-violet-600/10 border-2 border-dashed border-violet-500 shadow-inner' : 'bg-gray-900/30'
                }`}
              >
                {etapaLeads.map((lead) => (
                  <KanbanCard
                    key={lead.id}
                    lead={lead}
                    tempColor={TEMP_COLORS[lead.estado] ?? 'border-gray-700'}
                    onDragStart={() => handleDragStart(lead.id)}
                  />
                ))}
                {etapaLeads.length === 0 && prospectos.length > 0 && (
                  <div className="text-center text-[10px] text-gray-700 py-12 font-medium uppercase tracking-widest border border-dashed border-gray-800 rounded-lg">
                    Soltá acá
                  </div>
                )}
                {prospectos.length === 0 && EJEMPLOS_PIPELINE[etapa.status]?.map((ej, i) => (
                  <div key={i} className="opacity-40 pointer-events-none select-none bg-gray-800 border border-gray-700 rounded-xl p-3 shadow-md">
                    <p className="text-sm font-bold text-white truncate">{ej.nombre}</p>
                    <p className="text-[11px] text-gray-500 font-medium truncate mb-2">{ej.negocio}</p>
                    <div className="flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3 text-gray-600" />
                      <span className="text-[10px] text-gray-500">{ej.ciudad}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <InterestStars level={ej.nivel_interes} />
                      <span className="text-[10px] text-gray-500 font-bold uppercase">{ej.rubro}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function KanbanCard({ lead, tempColor, onDragStart }: { lead: Prospecto; tempColor: string; onDragStart: () => void }) {
  const score = computeScore(lead as any)
  const tier = getScoreTier(score)

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`bg-gray-800 border rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-violet-500/50 hover:bg-gray-800/80 transition-all shadow-md ${tempColor} group`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <Link 
            href={`/prospectos/${lead.id}`} 
            className="text-sm font-bold text-white hover:text-violet-400 truncate block transition-colors" 
            onClick={(e) => e.stopPropagation()}
          >
            {lead.nombre}
          </Link>
          <p className="text-[11px] text-gray-500 truncate font-medium">{lead.negocio}</p>
        </div>
        <GripVertical className="w-4 h-4 text-gray-700 shrink-0 ml-1 group-hover:text-gray-500 transition-colors" />
      </div>

      <div className="flex items-center gap-1.5 mb-2">
        <MapPin className="w-3 h-3 text-gray-600" />
        <span className="text-[10px] text-gray-500 font-medium truncate">{lead.ciudad || 'Sin ubicación'}</span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <InterestStars level={lead.nivel_interes} />
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{(lead as any).rubros?.nombre || 'General'}</span>
      </div>

      <div className={`flex items-center gap-2 px-2 py-1 rounded-lg mb-3 border ${tier.bg} ${tier.border} shadow-sm`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tier.dot}`} />
        <span className={`text-[10px] font-bold flex-1 uppercase tracking-tight ${tier.text}`}>{tier.label}</span>
        <span className={`text-[10px] font-black tabular-nums ${tier.text}`}>{score}</span>
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-gray-700/50">
        {lead.instagram && (
          <a href={`https://instagram.com/${lead.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1 hover:bg-pink-900/20 rounded-md transition-colors">
            <AtSign className="w-3.5 h-3.5 text-pink-500" />
          </a>
        )}
        {lead.whatsapp && (
          <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1 hover:bg-green-900/20 rounded-md transition-colors">
            <Phone className="w-3.5 h-3.5 text-green-500" />
          </a>
        )}
        <div className="ml-auto">
          <div className="w-12 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
            <div className={`h-full rounded-full ${tier.barColor} shadow-[0_0_5px_rgba(0,0,0,0.5)]`} style={{ width: `${score}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { InterestStars } from '@/components/leads/interest-stars'
import { mockLeads } from '@/lib/mock-data'
import type { Lead, LeadStatus } from '@/lib/types'
import { AtSign, Phone, MapPin, GripVertical } from 'lucide-react'
import Link from 'next/link'
import { ScoreChip } from '@/components/leads/score-badge'
import { computeScore, getScoreTier } from '@/lib/score'

const ETAPAS: { status: LeadStatus; label: string; color: string; dot: string }[] = [
  { status: 'new', label: 'Nuevo', color: 'border-gray-500', dot: 'bg-gray-400' },
  { status: 'contacted', label: 'Contactado', color: 'border-blue-500', dot: 'bg-blue-400' },
  { status: 'replied', label: 'Respondió', color: 'border-cyan-500', dot: 'bg-cyan-400' },
  { status: 'interested', label: 'Interesado', color: 'border-yellow-500', dot: 'bg-yellow-400' },
  { status: 'meeting', label: 'Reunión', color: 'border-purple-500', dot: 'bg-purple-400' },
  { status: 'proposal', label: 'Propuesta', color: 'border-orange-500', dot: 'bg-orange-400' },
  { status: 'won', label: 'Ganado', color: 'border-green-500', dot: 'bg-green-400' },
  { status: 'lost', label: 'Perdido', color: 'border-red-500', dot: 'bg-red-400' },
]

const TEMP_COLORS: Record<LeadStatus, string> = {
  new: 'border-gray-700',
  contacted: 'border-gray-700',
  replied: 'border-yellow-600/30',
  interested: 'border-yellow-500/50',
  meeting: 'border-green-500/50',
  proposal: 'border-green-600/60',
  won: 'border-green-500',
  lost: 'border-red-800/40',
}

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null)

  function handleDragStart(id: string) { setDragging(id) }

  function handleDrop(status: LeadStatus) {
    if (!dragging) return
    setLeads((prev) => prev.map((l) => l.id === dragging ? { ...l, status } : l))
    setDragging(null)
    setDragOver(null)
  }

  function handleDragOver(e: React.DragEvent, status: LeadStatus) {
    e.preventDefault()
    setDragOver(status)
  }

  const getLeadsByStatus = (status: LeadStatus) => leads.filter((l) => l.status === status)

  const totalActivos = leads.filter((l) => !['won', 'lost'].includes(l.status)).length

  return (
    <div>
      <PageHeader
        title="Pipeline"
        description={`${totalActivos} prospectos activos — arrastrar para cambiar etapa`}
      />

      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: '75vh' }}>
        {ETAPAS.map((etapa) => {
          const etapaLeads = getLeadsByStatus(etapa.status)
          const isDragTarget = dragOver === etapa.status

          return (
            <div
              key={etapa.status}
              className="flex-shrink-0 w-60"
              onDragOver={(e) => handleDragOver(e, etapa.status)}
              onDrop={() => handleDrop(etapa.status)}
              onDragLeave={() => setDragOver(null)}
            >
              <div className={`border-t-2 ${etapa.color} bg-gray-800/60 rounded-t-lg px-3 py-2 flex items-center justify-between mb-2`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${etapa.dot}`} />
                  <span className="text-sm font-medium text-white">{etapa.label}</span>
                </div>
                <span className="text-xs bg-gray-700 text-gray-300 rounded-full px-2 py-0.5 font-medium">
                  {etapaLeads.length}
                </span>
              </div>

              <div
                className={`min-h-64 rounded-b-lg rounded-tr-lg p-2 space-y-2 transition-colors ${
                  isDragTarget ? 'bg-violet-900/20 border border-dashed border-violet-500' : 'bg-gray-900/30'
                }`}
              >
                {etapaLeads.map((lead) => (
                  <KanbanCard
                    key={lead.id}
                    lead={lead}
                    tempColor={TEMP_COLORS[lead.status]}
                    onDragStart={() => handleDragStart(lead.id)}
                  />
                ))}
                {etapaLeads.length === 0 && (
                  <div className="text-center text-xs text-gray-700 py-8">Soltá acá</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function KanbanCard({ lead, tempColor, onDragStart }: { lead: Lead; tempColor: string; onDragStart: () => void }) {
  const score = computeScore(lead)
  const tier = getScoreTier(score)

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`bg-gray-800 border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-gray-500 transition-colors ${tempColor}`}
    >
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex-1 min-w-0">
          <Link href={`/prospectos/${lead.id}`} className="text-sm font-medium text-white hover:text-violet-400 truncate block" onClick={(e) => e.stopPropagation()}>
            {lead.name}
          </Link>
          <p className="text-xs text-gray-400 truncate">{lead.business_name}</p>
        </div>
        <GripVertical className="w-4 h-4 text-gray-600 shrink-0 ml-1" />
      </div>

      <div className="flex items-center gap-1 mb-2">
        <MapPin className="w-3 h-3 text-gray-500" />
        <span className="text-xs text-gray-500 truncate">{lead.city}</span>
      </div>

      <div className="flex items-center justify-between mb-2">
        <InterestStars level={lead.interest_level} />
        <span className="text-xs text-gray-600 truncate ml-1">{lead.niche}</span>
      </div>

      {/* Score tier badge */}
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md mb-2 border ${tier.bg} ${tier.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tier.dot}`} />
        <span className={`text-xs font-medium flex-1 ${tier.text}`}>{tier.label}</span>
        <span className={`text-xs font-bold tabular-nums ${tier.text}`}>{score}</span>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-gray-700/50">
        {lead.instagram && (
          <a href={`https://instagram.com/${lead.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
            <AtSign className="w-3.5 h-3.5 text-pink-400 hover:text-pink-300" />
          </a>
        )}
        {lead.whatsapp && (
          <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
            <Phone className="w-3.5 h-3.5 text-green-400 hover:text-green-300" />
          </a>
        )}
        <div className="ml-auto">
          <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${tier.barColor}`} style={{ width: `${score}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

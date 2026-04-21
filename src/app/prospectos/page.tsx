'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { LeadStatusBadge } from '@/components/leads/lead-status-badge'
import { InterestStars } from '@/components/leads/interest-stars'
import { ScoreBadge } from '@/components/leads/score-badge'
import { mockLeads } from '@/lib/mock-data'
import type { Lead, LeadStatus } from '@/lib/types'
import { computeScore, getScoreTier } from '@/lib/score'
import { Plus, Search, AtSign, Phone, MapPin, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { ProspectoFormDialog } from '@/components/leads/lead-form-dialog'

const STATUS_OPTIONS: { value: LeadStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'new', label: 'Nuevo' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'replied', label: 'Respondió' },
  { value: 'interested', label: 'Interesado' },
  { value: 'meeting', label: 'Reunión' },
  { value: 'proposal', label: 'Propuesta' },
  { value: 'won', label: 'Ganado' },
  { value: 'lost', label: 'Perdido' },
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
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [tierFilter, setTierFilter] = useState<TierFilter>('all')
  const [showForm, setShowForm] = useState(false)
  const [editLead, setEditLead] = useState<Lead | undefined>()

  const filtered = leads
    .filter((l) => {
      const matchSearch =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.business_name.toLowerCase().includes(search.toLowerCase()) ||
        l.niche.toLowerCase().includes(search.toLowerCase()) ||
        l.city.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || l.status === statusFilter
      const matchTier = tierFilter === 'all' || getScoreTier(computeScore(l)).tier === tierFilter
      return matchSearch && matchStatus && matchTier
    })
    .sort((a, b) => computeScore(b) - computeScore(a))

  function handleSave(data: Partial<Lead>) {
    if (editLead) {
      setLeads((prev) => prev.map((l) => l.id === editLead.id ? { ...l, ...data } : l))
    } else {
      const newLead: Lead = {
        id: String(Date.now()),
        name: data.name || '',
        business_name: data.business_name || '',
        niche: data.niche || '',
        city: data.city || '',
        instagram: data.instagram || '',
        whatsapp: data.whatsapp || '',
        website: data.website || '',
        status: data.status || 'new',
        interest_level: data.interest_level || 1,
        score: data.score || 0,
        last_contacted_at: data.last_contacted_at || null,
        next_followup_at: data.next_followup_at || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setLeads((prev) => [newLead, ...prev])
    }
    setShowForm(false)
    setEditLead(undefined)
  }

  function handleDelete(id: string) {
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }

  const stats = {
    total: leads.length,
    activos: leads.filter((l) => !['won', 'lost', 'new'].includes(l.status)).length,
    ganados: leads.filter((l) => l.status === 'won').length,
    perdidos: leads.filter((l) => l.status === 'lost').length,
  }

  return (
    <div>
      <PageHeader
        title="Prospectos"
        description={`${filtered.length} prospectos encontrados`}
        action={
          <Button onClick={() => { setEditLead(undefined); setShowForm(true) }} className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 mr-2" /> Nuevo prospecto
          </Button>
        }
      />

      {/* Stats rápidas */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Activos', value: stats.activos, color: 'text-blue-400' },
          { label: 'Ganados', value: stats.ganados, color: 'text-green-400' },
          { label: 'Perdidos', value: stats.perdidos, color: 'text-red-400' },
        ].map((s) => (
          <Card key={s.label} className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-3 pb-3">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <div className="space-y-3 mb-5">
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, negocio, rubro o ciudad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
          {/* Score tier filters */}
          <div className="flex gap-1.5 flex-wrap items-center">
            <span className="text-xs text-gray-500 shrink-0">Score:</span>
            {TIER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTierFilter(opt.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === opt.value
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Prospecto</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Rubro</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Contacto</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Estado</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Interés</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Score comercial</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-medium text-white">{lead.name}</p>
                      <p className="text-xs text-gray-400">{lead.business_name}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-gray-300">{lead.niche}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">{lead.city}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-0.5">
                      {lead.instagram && (
                        <div className="flex items-center gap-1">
                          <AtSign className="w-3 h-3 text-pink-400" />
                          <span className="text-xs text-gray-400">{lead.instagram}</span>
                        </div>
                      )}
                      {lead.whatsapp && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-gray-400">{lead.whatsapp}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="py-3 px-4">
                    <InterestStars level={lead.interest_level} />
                  </td>
                  <td className="py-3 px-4">
                    <ScoreBadge lead={lead} showBar />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditLead(lead); setShowForm(true) }} className="text-xs text-gray-400 hover:text-white transition-colors">Editar</button>
                      <button onClick={() => handleDelete(lead.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Eliminar</button>
                      <Link href={`/prospectos/${lead.id}`} className="text-violet-400 hover:text-violet-300 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">No se encontraron prospectos</div>
          )}
        </CardContent>
      </Card>

      <ProspectoFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        lead={editLead}
        onSave={handleSave}
      />
    </div>
  )
}

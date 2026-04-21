'use client'

import { useState, useMemo, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LeadStatusBadge } from '@/components/leads/lead-status-badge'
import { mockLeads, mockNiches } from '@/lib/mock-data'
import type { Lead, LeadStatus } from '@/lib/types'
import { STATUS_LABELS } from '@/lib/types'
import { computeScore, getScoreTier } from '@/lib/score'
import { differenceInDays, addDays, parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  Search, Phone, AtSign, Copy, Check, CalendarPlus,
  Zap, MessageSquare, Target, Clock, ChevronDown, X,
  ArrowUpDown, Flame
} from 'lucide-react'

// ——— Helpers ———

const nicheMessageMap = Object.fromEntries(
  mockNiches.map((n) => [n.name, n.mensaje_sugerido])
)

function buildWhatsAppUrl(lead: Lead, mensaje: string): string {
  const phone = lead.whatsapp.replace(/\D/g, '')
  return `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`
}

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null
  return differenceInDays(new Date(), parseISO(dateStr))
}

function addDaysToToday(n: number): string {
  return addDays(new Date(), n).toISOString().split('T')[0]
}

type SortKey = 'prioridad' | 'score' | 'rubro'

const SORT_LABELS: Record<SortKey, string> = {
  prioridad: 'Sin contacto primero',
  score: 'Mayor score',
  rubro: 'Por rubro',
}

// ——— Main page ———

export default function ProspeccionPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const [search, setSearch] = useState('')
  const [filterRubro, setFilterRubro] = useState<string>('all')
  const [filterCiudad, setFilterCiudad] = useState<string>('all')
  const [filterEstado, setFilterEstado] = useState<LeadStatus | 'all'>('all')
  const [incluirCerrados, setIncluirCerrados] = useState(false)
  const [sortBy, setSortBy] = useState<SortKey>('prioridad')
  const [sentIds, setSentIds] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set())

  const rubros = useMemo(() => Array.from(new Set(leads.map((l) => l.niche))).sort(), [leads])
  const ciudades = useMemo(() => Array.from(new Set(leads.map((l) => l.city))).sort(), [leads])
  const estados = Object.entries(STATUS_LABELS) as [LeadStatus, string][]

  const filtered = useMemo(() => {
    let list = leads.filter((l) => {
      if (!incluirCerrados && ['won', 'lost'].includes(l.status)) return false
      if (filterRubro !== 'all' && l.niche !== filterRubro) return false
      if (filterCiudad !== 'all' && l.city !== filterCiudad) return false
      if (filterEstado !== 'all' && l.status !== filterEstado) return false
      if (search) {
        const q = search.toLowerCase()
        if (!l.name.toLowerCase().includes(q) && !l.business_name.toLowerCase().includes(q)) return false
      }
      return true
    })

    list.sort((a, b) => {
      // Unsent before sent
      const aSent = sentIds.has(a.id) ? 1 : 0
      const bSent = sentIds.has(b.id) ? 1 : 0
      if (aSent !== bSent) return aSent - bSent

      if (sortBy === 'score') return computeScore(b) - computeScore(a)
      if (sortBy === 'rubro') return a.niche.localeCompare(b.niche)

      // prioridad: no contact ever first, then longest no-contact
      const dA = daysSince(a.last_contacted_at) ?? 999
      const dB = daysSince(b.last_contacted_at) ?? 999
      return dB - dA
    })

    return list
  }, [leads, search, filterRubro, filterCiudad, filterEstado, incluirCerrados, sortBy, sentIds])

  const sessionGoal = 30
  const sentHoy = sentIds.size
  const pct = Math.min(Math.round((sentHoy / sessionGoal) * 100), 100)

  function copyMessage(lead: Lead) {
    const msg = nicheMessageMap[lead.niche] ?? `Hola ${lead.name.split(' ')[0]}! Te contacto para contarte sobre nuestro servicio.`
    navigator.clipboard.writeText(msg).then(() => {
      setCopiedId(lead.id)
      setTimeout(() => setCopiedId(null), 2000)
      toast.success('Mensaje copiado al portapapeles')
    })
  }

  function markSent(lead: Lead) {
    setSentIds((prev) => new Set([...prev, lead.id]))
    if (lead.status === 'new') {
      setLeads((prev) => prev.map((l) =>
        l.id === lead.id
          ? { ...l, status: 'contacted', last_contacted_at: new Date().toISOString().split('T')[0] }
          : l
      ))
    } else {
      setLeads((prev) => prev.map((l) =>
        l.id === lead.id
          ? { ...l, last_contacted_at: new Date().toISOString().split('T')[0] }
          : l
      ))
    }
    toast.success(`${lead.name} marcado como contactado`)
  }

  function quickFollowup(lead: Lead) {
    const fecha = addDaysToToday(3)
    setLeads((prev) => prev.map((l) =>
      l.id === lead.id ? { ...l, next_followup_at: fecha } : l
    ))
    setFollowedIds((prev) => new Set([...prev, lead.id]))
    toast.success(`Seguimiento programado en 3 días`)
  }

  function clearFilters() {
    setSearch('')
    setFilterRubro('all')
    setFilterCiudad('all')
    setFilterEstado('all')
  }

  const hasFilters = search || filterRubro !== 'all' || filterCiudad !== 'all' || filterEstado !== 'all'

  return (
    <div className="space-y-4">
      {/* Header + contador de sesión */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-400" />
            <h1 className="text-2xl font-bold text-white">Modo Prospección</h1>
          </div>
          <p className="text-gray-400 text-sm mt-0.5">Enviá mensajes rápido — todos los atajos en un solo lugar</p>
        </div>

        {/* Session counter */}
        <div className="shrink-0 flex items-center gap-4 bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-white tabular-nums">{sentHoy}</p>
            <p className="text-xs text-gray-500">enviados</p>
          </div>
          <div className="w-px h-8 bg-gray-700" />
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-400 tabular-nums">{sessionGoal}</p>
            <p className="text-xs text-gray-500">meta</p>
          </div>
          <div className="w-20">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : pct >= 60 ? 'bg-violet-500' : pct >= 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className={`text-xs text-center mt-1 font-medium tabular-nums ${pct >= 100 ? 'text-green-400' : 'text-gray-400'}`}>
              {pct}%
            </p>
          </div>
          {pct >= 100 && (
            <div className="flex items-center gap-1 text-green-400">
              <Check className="w-4 h-4" />
              <span className="text-xs font-medium">¡Meta!</span>
            </div>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-3 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Búsqueda */}
          <div className="relative min-w-48 flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              placeholder="Buscar nombre o negocio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Rubro */}
          <FilterSelect
            value={filterRubro}
            onChange={setFilterRubro}
            options={[{ value: 'all', label: 'Todos los rubros' }, ...rubros.map((r) => ({ value: r, label: r }))]}
          />

          {/* Ciudad */}
          <FilterSelect
            value={filterCiudad}
            onChange={setFilterCiudad}
            options={[{ value: 'all', label: 'Todas las ciudades' }, ...ciudades.map((c) => ({ value: c, label: c }))]}
          />

          {/* Estado */}
          <FilterSelect
            value={filterEstado}
            onChange={(v) => setFilterEstado(v as LeadStatus | 'all')}
            options={[{ value: 'all', label: 'Todos los estados' }, ...estados.map(([v, l]) => ({ value: v, label: l }))]}
          />

          {/* Cerrados toggle */}
          <button
            onClick={() => setIncluirCerrados((v) => !v)}
            className={`h-8 px-3 rounded-lg text-xs font-medium border transition-colors ${incluirCerrados ? 'bg-gray-700 border-gray-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white'}`}
          >
            {incluirCerrados ? 'Incluir cerrados ✓' : '+ Incluir cerrados'}
          </button>

          {/* Sort */}
          <div className="flex items-center gap-1 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`h-7 px-2.5 rounded-md text-xs font-medium transition-colors ${sortBy === key ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
              >
                {SORT_LABELS[key]}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 h-8 px-2">
              <X className="w-3 h-3" /> Limpiar
            </button>
          )}
        </div>

        {/* Resultado count */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span><span className="text-white font-medium">{filtered.length}</span> prospectos</span>
          <span>·</span>
          <span><span className="text-green-400 font-medium">{filtered.filter((l) => sentIds.has(l.id)).length}</span> enviados esta sesión</span>
          <span>·</span>
          <span><span className="text-orange-400 font-medium">{filtered.filter((l) => !l.last_contacted_at && !sentIds.has(l.id)).length}</span> sin contacto previo</span>
        </div>
      </div>

      {/* Leyenda de acciones */}
      <div className="flex items-center gap-4 text-xs text-gray-600 px-1">
        <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copiar mensaje del rubro</span>
        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-green-500" /> WA con mensaje</span>
        <span className="flex items-center gap-1"><AtSign className="w-3 h-3 text-pink-500" /> Abrir Instagram</span>
        <span className="flex items-center gap-1"><Check className="w-3 h-3 text-violet-400" /> Marcar enviado</span>
        <span className="flex items-center gap-1"><CalendarPlus className="w-3 h-3 text-yellow-400" /> Seguimiento +3 días</span>
      </div>

      {/* Tabla */}
      <div className="border border-gray-700 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2rem_1fr_10rem_10rem_6rem_1fr_10rem] gap-2 px-3 py-2 bg-gray-800/80 border-b border-gray-700 text-xs font-medium text-gray-400">
          <div>#</div>
          <div>Prospecto</div>
          <div>Rubro</div>
          <div>Ciudad · Estado</div>
          <div>Score</div>
          <div>Mensaje sugerido</div>
          <div className="text-right">Acciones</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-800">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-500 text-sm">
              No hay prospectos con estos filtros
            </div>
          ) : (
            filtered.map((lead, idx) => (
              <ProspeccionRow
                key={lead.id}
                lead={lead}
                idx={idx + 1}
                isSent={sentIds.has(lead.id)}
                isCopied={copiedId === lead.id}
                hasFollowup={followedIds.has(lead.id) || !!lead.next_followup_at}
                nicheMessage={nicheMessageMap[lead.niche] ?? ''}
                onCopy={() => copyMessage(lead)}
                onMarkSent={() => markSent(lead)}
                onFollowup={() => quickFollowup(lead)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ——— Row component ———

function ProspeccionRow({
  lead, idx, isSent, isCopied, hasFollowup, nicheMessage,
  onCopy, onMarkSent, onFollowup,
}: {
  lead: Lead
  idx: number
  isSent: boolean
  isCopied: boolean
  hasFollowup: boolean
  nicheMessage: string
  onCopy: () => void
  onMarkSent: () => void
  onFollowup: () => void
}) {
  const score = computeScore(lead)
  const tier = getScoreTier(score)
  const days = daysSince(lead.last_contacted_at)
  const isUrgent = !isSent && (days === null || days >= 2)
  const whatsappUrl = lead.whatsapp ? buildWhatsAppUrl(lead, nicheMessage) : null
  const instagramUrl = lead.instagram ? `https://instagram.com/${lead.instagram.replace('@', '')}` : null

  return (
    <div className={`grid grid-cols-[2rem_1fr_10rem_10rem_6rem_1fr_10rem] gap-2 px-3 py-2.5 items-center transition-colors text-sm ${
      isSent
        ? 'bg-gray-900/30 opacity-50'
        : isUrgent
        ? 'bg-orange-950/10 hover:bg-orange-950/20'
        : 'hover:bg-gray-800/40'
    }`}>
      {/* Número */}
      <div className="text-xs text-gray-600 tabular-nums font-mono">
        {isSent ? <Check className="w-3.5 h-3.5 text-green-500" /> : idx}
      </div>

      {/* Nombre + negocio */}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          {isUrgent && !isSent && <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />}
          <a href={`/prospectos/${lead.id}`} className="text-sm font-medium text-white hover:text-violet-400 truncate">
            {lead.name}
          </a>
        </div>
        <p className="text-xs text-gray-500 truncate">{lead.business_name}</p>
        {/* Último contacto */}
        <p className={`text-xs mt-0.5 ${
          days === null ? 'text-orange-400' :
          days === 0 ? 'text-green-400' :
          days >= 5 ? 'text-blue-400' :
          days >= 2 ? 'text-red-400' : 'text-gray-500'
        }`}>
          {days === null ? 'Sin contacto previo' :
           days === 0 ? 'Contactado hoy' :
           days === 1 ? 'Hace 1 día' :
           `Hace ${days} días`}
        </p>
      </div>

      {/* Rubro */}
      <div className="text-xs text-gray-400 truncate">{lead.niche}</div>

      {/* Ciudad · Estado */}
      <div className="space-y-1">
        <p className="text-xs text-gray-400 truncate">{lead.city}</p>
        <LeadStatusBadge status={lead.status} />
      </div>

      {/* Score */}
      <div>
        <span className={`text-xs font-bold tabular-nums px-1.5 py-0.5 rounded border ${tier.bg} ${tier.text} ${tier.border}`}>
          {score}
        </span>
      </div>

      {/* Mensaje sugerido (preview) */}
      <div className="min-w-0">
        {nicheMessage ? (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{nicheMessage}</p>
        ) : (
          <p className="text-xs text-gray-700 italic">Sin mensaje para este rubro</p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 justify-end flex-wrap">
        {/* Copiar mensaje */}
        <ActionBtn
          onClick={onCopy}
          title="Copiar mensaje"
          active={isCopied}
          color="gray"
          icon={isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        />

        {/* WhatsApp con mensaje pre-cargado */}
        {whatsappUrl ? (
          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <ActionBtn title="Abrir WA con mensaje" color="green" icon={<Phone className="w-3.5 h-3.5" />} />
          </a>
        ) : (
          <ActionBtn disabled title="Sin WhatsApp" color="gray" icon={<Phone className="w-3.5 h-3.5 opacity-30" />} />
        )}

        {/* Instagram */}
        {instagramUrl ? (
          <a href={instagramUrl} target="_blank" rel="noreferrer">
            <ActionBtn title="Abrir Instagram" color="pink" icon={<AtSign className="w-3.5 h-3.5" />} />
          </a>
        ) : (
          <ActionBtn disabled title="Sin Instagram" color="gray" icon={<AtSign className="w-3.5 h-3.5 opacity-30" />} />
        )}

        {/* Marcar enviado */}
        <ActionBtn
          onClick={isSent ? undefined : onMarkSent}
          title={isSent ? 'Ya enviado' : 'Marcar como enviado'}
          active={isSent}
          color="violet"
          icon={<Check className="w-3.5 h-3.5" />}
        />

        {/* Seguimiento +3d */}
        <ActionBtn
          onClick={hasFollowup ? undefined : onFollowup}
          title={hasFollowup ? 'Seguimiento ya programado' : 'Seguimiento en 3 días'}
          active={hasFollowup}
          color="yellow"
          icon={<CalendarPlus className="w-3.5 h-3.5" />}
        />
      </div>
    </div>
  )
}

// ——— Micro components ———

function ActionBtn({
  onClick, title, icon, color, active, disabled
}: {
  onClick?: () => void
  title: string
  icon: React.ReactNode
  color: 'gray' | 'green' | 'pink' | 'violet' | 'yellow'
  active?: boolean
  disabled?: boolean
}) {
  const colors = {
    gray: 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white',
    green: 'border-green-800/60 text-green-400 hover:border-green-600 hover:bg-green-900/20',
    pink: 'border-pink-800/60 text-pink-400 hover:border-pink-600 hover:bg-pink-900/20',
    violet: 'border-violet-800/60 text-violet-400 hover:border-violet-600 hover:bg-violet-900/20',
    yellow: 'border-yellow-800/60 text-yellow-400 hover:border-yellow-600 hover:bg-yellow-900/20',
  }

  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`w-7 h-7 flex items-center justify-center rounded-md border transition-colors
        ${active ? 'bg-green-900/20 border-green-700/50 text-green-400' : colors[color]}
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
        ${!onClick && !disabled ? 'cursor-default' : ''}`}
    >
      {icon}
    </button>
  )
}

function FilterSelect({
  value, onChange, options
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 pl-2.5 pr-7 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-300 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-violet-500 hover:border-gray-500 transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
    </div>
  )
}

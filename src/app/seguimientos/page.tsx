'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LeadStatusBadge } from '@/components/leads/lead-status-badge'
import { InterestStars } from '@/components/leads/interest-stars'
import { mockLeads } from '@/lib/mock-data'
import type { Lead } from '@/lib/types'
import {
  AtSign, Phone, CheckCircle2, Clock, Bell, CalendarDays,
  ChevronRight, Flame, Snowflake, Zap, AlertTriangle, Plus
} from 'lucide-react'
import Link from 'next/link'
import { format, isToday, isPast, isFuture, parseISO, differenceInDays, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

// ——— Urgency logic ———

type UrgencyLevel = 'urgente' | 'seguimiento' | 'activo' | 'enfriado'

interface UrgencyTag {
  level: UrgencyLevel
  label: string
  bg: string
  text: string
  border: string
  icon: React.ReactNode
  sortPriority: number
}

const URGENCY_MAP: Record<UrgencyLevel, Omit<UrgencyTag, 'level' | 'sortPriority'>> = {
  urgente: {
    label: 'Urgente',
    bg: 'bg-red-900/30',
    text: 'text-red-300',
    border: 'border-red-700/60',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  seguimiento: {
    label: 'Seguimiento',
    bg: 'bg-yellow-900/30',
    text: 'text-yellow-300',
    border: 'border-yellow-700/60',
    icon: <Bell className="w-3 h-3" />,
  },
  activo: {
    label: 'Activo',
    bg: 'bg-green-900/30',
    text: 'text-green-300',
    border: 'border-green-700/60',
    icon: <Zap className="w-3 h-3" />,
  },
  enfriado: {
    label: 'Enfriado',
    bg: 'bg-blue-900/20',
    text: 'text-blue-300',
    border: 'border-blue-700/40',
    icon: <Snowflake className="w-3 h-3" />,
  },
}

function getUrgency(lead: Lead): UrgencyTag {
  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)

  const lastContacted = lead.last_contacted_at ? parseISO(lead.last_contacted_at) : null
  const daysSinceContact = lastContacted ? differenceInDays(todayDate, lastContacted) : 999

  let level: UrgencyLevel
  let sortPriority: number

  if (['replied', 'interested'].includes(lead.status) && daysSinceContact <= 2) {
    level = 'activo'
    sortPriority = 1
  } else if (daysSinceContact >= 5) {
    level = 'enfriado'
    sortPriority = 3
  } else if (daysSinceContact >= 2 || !lead.last_contacted_at) {
    level = 'urgente'
    sortPriority = 0
  } else {
    level = 'seguimiento'
    sortPriority = 2
  }

  return { level, sortPriority, ...URGENCY_MAP[level] }
}

function sortByUrgency(list: Lead[]): Lead[] {
  return [...list].sort((a, b) => {
    const ua = getUrgency(a)
    const ub = getUrgency(b)
    if (ua.sortPriority !== ub.sortPriority) return ua.sortPriority - ub.sortPriority
    if (b.interest_level !== a.interest_level) return b.interest_level - a.interest_level
    return b.score - a.score
  })
}

function addDaysToToday(n: number): string {
  return addDays(new Date(), n).toISOString().split('T')[0]
}

// ——— Main component ———

export default function SeguimientosPage() {
  const [leads, setLeads] = useState<Lead[]>(
    mockLeads.filter((l) => !['won', 'lost'].includes(l.status))
  )
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  function reprogramar(id: string, days: number) {
    const nuevaFecha = addDaysToToday(days)
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, next_followup_at: nuevaFecha } : l))
    toast.success(`Reprogramado para ${format(parseISO(nuevaFecha), "d 'de' MMMM", { locale: es })}`)
  }

  function marcarHecho(id: string) {
    setCompleted((prev) => new Set([...prev, id]))
    toast.success('Seguimiento marcado como hecho')
  }

  const activeLeds = useMemo(() => leads.filter((l) => !completed.has(l.id)), [leads, completed])

  const vencidos = useMemo(() =>
    sortByUrgency(activeLeds.filter((l) => l.next_followup_at && isPast(parseISO(l.next_followup_at)) && !isToday(parseISO(l.next_followup_at)))),
    [activeLeds]
  )

  const hoy = useMemo(() =>
    sortByUrgency(activeLeds.filter((l) => l.next_followup_at && isToday(parseISO(l.next_followup_at)))),
    [activeLeds]
  )

  const proximos = useMemo(() =>
    sortByUrgency(activeLeds.filter((l) => l.next_followup_at && isFuture(parseISO(l.next_followup_at)))),
    [activeLeds]
  )

  const sinProgramar = useMemo(() =>
    sortByUrgency(activeLeds.filter((l) => !l.next_followup_at)),
    [activeLeds]
  )

  // Prospectos sin seguimiento que llevan 2+ días sin contacto (auto-detected)
  const requierenSeguimiento = useMemo(() =>
    sinProgramar.filter((l) => {
      if (!l.last_contacted_at) return true
      const days = differenceInDays(new Date(), parseISO(l.last_contacted_at))
      return days >= 2
    }),
    [sinProgramar]
  )

  const totalUrgentes = vencidos.filter((l) => getUrgency(l).level === 'urgente').length +
    hoy.filter((l) => getUrgency(l).level === 'urgente').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Seguimientos</h1>
        <p className="text-gray-400 text-sm mt-0.5">Ordenados por urgencia — priorizá lo que más importa hoy</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
          label="Vencidos"
          value={vencidos.length}
          bg="bg-red-900/20 border-red-700/40"
          valueColor="text-red-400"
          sub="Acción inmediata"
        />
        <StatCard
          icon={<Bell className="w-4 h-4 text-yellow-400" />}
          label="Para hoy"
          value={hoy.length}
          bg="bg-yellow-900/20 border-yellow-700/40"
          valueColor="text-yellow-400"
          sub="Contactar antes de las 19hs"
        />
        <StatCard
          icon={<CalendarDays className="w-4 h-4 text-blue-400" />}
          label="Próximos"
          value={proximos.length}
          bg="bg-gray-800/50 border-gray-700"
          valueColor="text-blue-400"
          sub="En los próximos días"
        />
        <StatCard
          icon={<Flame className="w-4 h-4 text-orange-400" />}
          label="Sin programar"
          value={requierenSeguimiento.length}
          bg={requierenSeguimiento.length > 0 ? 'bg-orange-900/20 border-orange-700/40' : 'bg-gray-800/50 border-gray-700'}
          valueColor={requierenSeguimiento.length > 0 ? 'text-orange-400' : 'text-gray-400'}
          sub="Detectados automáticamente"
        />
      </div>

      {/* Secciones */}
      <Seccion
        titulo="Vencidos"
        icono={<AlertTriangle className="w-4 h-4 text-red-400" />}
        headerColor="text-red-400"
        lista={vencidos}
        msgVacio="Sin seguimientos vencidos — ¡vas bien!"
        onReprogramar={reprogramar}
        onMarcarHecho={marcarHecho}
      />
      <Seccion
        titulo="Para hoy"
        icono={<Bell className="w-4 h-4 text-yellow-400" />}
        headerColor="text-yellow-400"
        lista={hoy}
        msgVacio="No tenés seguimientos para hoy"
        onReprogramar={reprogramar}
        onMarcarHecho={marcarHecho}
      />
      <Seccion
        titulo="Próximos"
        icono={<CalendarDays className="w-4 h-4 text-blue-400" />}
        headerColor="text-blue-400"
        lista={proximos}
        msgVacio="No hay seguimientos próximos programados"
        onReprogramar={reprogramar}
        onMarcarHecho={marcarHecho}
      />

      {requierenSeguimiento.length > 0 && (
        <Seccion
          titulo="Sin seguimiento — detectados automáticamente"
          icono={<Flame className="w-4 h-4 text-orange-400" />}
          headerColor="text-orange-400"
          lista={requierenSeguimiento}
          msgVacio=""
          onReprogramar={reprogramar}
          onMarcarHecho={marcarHecho}
          subtitulo="Estos prospectos llevan 2+ días sin contacto y no tienen seguimiento programado"
        />
      )}
    </div>
  )
}

// ——— Stat card ———

function StatCard({ icon, label, value, bg, valueColor, sub }: {
  icon: React.ReactNode; label: string; value: number
  bg: string; valueColor: string; sub: string
}) {
  return (
    <Card className={`border ${bg}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-gray-400">{label}</span></div>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  )
}

// ——— Sección agrupada ———

function Seccion({ titulo, icono, headerColor, lista, msgVacio, subtitulo, onReprogramar, onMarcarHecho }: {
  titulo: string; icono: React.ReactNode; headerColor: string; lista: Lead[]
  msgVacio: string; subtitulo?: string
  onReprogramar: (id: string, days: number) => void
  onMarcarHecho: (id: string) => void
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icono}
        <h2 className={`text-sm font-semibold ${headerColor}`}>{titulo}</h2>
        <span className="text-xs bg-gray-700 text-gray-300 rounded-full px-2 py-0.5 font-medium">{lista.length}</span>
      </div>
      {subtitulo && <p className="text-xs text-gray-500 mb-3 pl-6">{subtitulo}</p>}
      {lista.length === 0 ? (
        <p className="text-sm text-gray-500 pl-6">{msgVacio}</p>
      ) : (
        <div className="space-y-2">
          {lista.map((l) => (
            <TarjetaSeguimiento
              key={l.id}
              lead={l}
              onReprogramar={onReprogramar}
              onMarcarHecho={onMarcarHecho}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ——— Tarjeta individual ———

function TarjetaSeguimiento({ lead, onReprogramar, onMarcarHecho }: {
  lead: Lead
  onReprogramar: (id: string, days: number) => void
  onMarcarHecho: (id: string) => void
}) {
  const urgency = getUrgency(lead)
  const todayStr = new Date().toISOString().split('T')[0]
  const lastContactDays = lead.last_contacted_at
    ? differenceInDays(new Date(), parseISO(lead.last_contacted_at))
    : null

  return (
    <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50 hover:border-gray-600 transition-colors">
      <div className="flex items-start gap-4">
        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Link href={`/prospectos/${lead.id}`} className="text-sm font-semibold text-white hover:text-violet-400 transition-colors">
              {lead.name}
            </Link>
            {/* Urgency tag */}
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${urgency.bg} ${urgency.text} ${urgency.border}`}>
              {urgency.icon} {urgency.label}
            </span>
            <LeadStatusBadge status={lead.status} />
          </div>

          <p className="text-xs text-gray-400">{lead.business_name} · {lead.niche} · {lead.city}</p>

          {/* Métricas clave */}
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <InterestStars level={lead.interest_level} />
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {lastContactDays === null
                ? <span className="text-orange-400">Sin contacto previo</span>
                : lastContactDays === 0
                ? <span className="text-green-400">Contactado hoy</span>
                : lastContactDays === 1
                ? <span className="text-yellow-400">Hace 1 día</span>
                : <span className={lastContactDays >= 5 ? 'text-blue-400' : lastContactDays >= 2 ? 'text-red-400' : 'text-gray-400'}>
                    Hace {lastContactDays} días
                  </span>
              }
            </div>
            {lead.next_followup_at && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <CalendarDays className="w-3 h-3" />
                <span>
                  {isToday(parseISO(lead.next_followup_at))
                    ? <span className="text-yellow-400">Hoy</span>
                    : isPast(parseISO(lead.next_followup_at))
                    ? <span className="text-red-400">Vencido el {format(parseISO(lead.next_followup_at), 'd MMM', { locale: es })}</span>
                    : <span className="text-gray-400">{format(parseISO(lead.next_followup_at), "d 'de' MMM", { locale: es })}</span>
                  }
                </span>
              </div>
            )}
            {lead.score > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>Score: <span className="text-white font-medium">{lead.score}</span></span>
              </div>
            )}
          </div>

          {/* Contacto rápido */}
          <div className="flex items-center gap-3 mt-2">
            {lead.whatsapp && (
              <a
                href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
              >
                <Phone className="w-3 h-3" /> WhatsApp
              </a>
            )}
            {lead.instagram && (
              <a
                href={`https://instagram.com/${lead.instagram.replace('@', '')}`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 transition-colors"
              >
                <AtSign className="w-3 h-3" /> {lead.instagram}
              </a>
            )}
          </div>

          {lead.notes && (
            <p className="text-xs text-gray-500 mt-1.5 italic truncate max-w-lg">&ldquo;{lead.notes}&rdquo;</p>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="shrink-0 flex flex-col gap-1.5 items-end">
          {/* Fila 1: abrir ficha + marcar hecho */}
          <div className="flex items-center gap-1.5">
            <Link href={`/prospectos/${lead.id}`}>
              <Button size="sm" variant="outline" className="h-7 text-xs border-gray-600 text-gray-300 hover:border-violet-500 hover:text-violet-300 gap-1">
                Ver ficha <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => onMarcarHecho(lead.id)}
              className="h-7 text-xs bg-violet-600 hover:bg-violet-700 gap-1"
            >
              <CheckCircle2 className="w-3 h-3" /> Hecho
            </Button>
          </div>

          {/* Fila 2: reprogramar */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-600 mr-0.5">Reprog.:</span>
            <Button
              size="sm" variant="outline"
              onClick={() => onReprogramar(lead.id, 1)}
              className="h-6 text-xs px-2 border-gray-700 text-gray-400 hover:border-yellow-600 hover:text-yellow-300"
            >
              +1 día
            </Button>
            <Button
              size="sm" variant="outline"
              onClick={() => onReprogramar(lead.id, 3)}
              className="h-6 text-xs px-2 border-gray-700 text-gray-400 hover:border-yellow-600 hover:text-yellow-300"
            >
              +3 días
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

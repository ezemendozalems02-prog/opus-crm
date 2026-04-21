'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LeadStatusBadge } from '@/components/leads/lead-status-badge'
import type { Prospecto, LeadStatus, Rubro } from '@/lib/types'
import { computeScore, getScoreTier } from '@/lib/score'
import { differenceInDays, addDays, parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  Search, Phone, AtSign, Copy, Check, CalendarPlus,
  Zap, MessageSquare, Target, Clock, ChevronDown, X,
  ArrowUpDown, Flame, Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ——— Helpers ———

function buildWhatsAppUrl(lead: Prospecto, mensaje: string): string {
  const phone = (lead.whatsapp || '').replace(/\D/g, '')
  return `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`
}

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null
  return differenceInDays(new Date(), parseISO(dateStr))
}

function addDaysToToday(n: number): string {
  return addDays(new Date(), n).toISOString()
}

type SortKey = 'prioridad' | 'score' | 'rubro'

const SORT_LABELS: Record<SortKey, string> = {
  prioridad: 'Sin contacto primero',
  score: 'Mayor score',
  rubro: 'Por rubro',
}

// ——— Main page ———

export default function ProspeccionPage() {
  const [prospectos, setProspectos] = useState<Prospecto[]>([])
  const [rubros, setRubros] = useState<Rubro[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRubro, setFilterRubro] = useState<string>('all')
  const [filterCiudad, setFilterCiudad] = useState<string>('all')
  const [filterEstado, setFilterEstado] = useState<LeadStatus | 'all'>('all')
  const [incluirCerrados, setIncluirCerrados] = useState(false)
  const [sortBy, setSortBy] = useState<SortKey>('prioridad')
  const [sentIds, setSentIds] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set())
  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    const { data: pData } = await supabase.from('prospectos').select('*, rubros(*)')
    const { data: rData } = await supabase.from('rubros').select('*')
    if (pData) setProspectos(pData)
    if (rData) setRubros(rData)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [supabase])

  const rubroNames = useMemo(() => Array.from(new Set(rubros.map(r => r.nombre))).sort(), [rubros])
  const ciudades = useMemo(() => Array.from(new Set(prospectos.map((l) => l.ciudad).filter(Boolean))).sort() as string[], [prospectos])

  const filtered = useMemo(() => {
    let list = prospectos.filter((l) => {
      if (!incluirCerrados && ['Ganado', 'Perdido'].includes(l.estado)) return false
      if (filterRubro !== 'all' && (l as any).rubros?.nombre !== filterRubro) return false
      if (filterCiudad !== 'all' && l.ciudad !== filterCiudad) return false
      if (filterEstado !== 'all' && l.estado !== filterEstado) return false
      if (search) {
        const q = search.toLowerCase()
        if (!l.nombre.toLowerCase().includes(q) && !l.negocio.toLowerCase().includes(q)) return false
      }
      return true
    })

    list.sort((a, b) => {
      const aSent = sentIds.has(a.id) ? 1 : 0
      const bSent = sentIds.has(b.id) ? 1 : 0
      if (aSent !== bSent) return aSent - bSent

      if (sortBy === 'score') return computeScore(b as any) - computeScore(a as any)
      if (sortBy === 'rubro') return ((a as any).rubros?.nombre || '').localeCompare((b as any).rubros?.nombre || '')

      const dA = daysSince(a.ultimo_contacto) ?? 999
      const dB = daysSince(b.ultimo_contacto) ?? 999
      return dB - dA
    })

    return list
  }, [prospectos, search, filterRubro, filterCiudad, filterEstado, incluirCerrados, sortBy, sentIds])

  const sessionGoal = 30
  const sentHoy = sentIds.size
  const pct = Math.min(Math.round((sentHoy / sessionGoal) * 100), 100)

  async function copyMessage(lead: Prospecto) {
    const rubro = rubros.find(r => r.id === lead.rubro_id)
    const msg = rubro?.mensaje_sugerido ?? `Hola ${lead.nombre.split(' ')[0]}! Te contacto desde Opus Prospect.`
    await navigator.clipboard.writeText(msg)
    setCopiedId(lead.id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('Mensaje copiado')
  }

  async function markSent(lead: Prospecto) {
    const originalProspectos = [...prospectos]
    const now = new Date().toISOString()
    const today = now.split('T')[0]
    
    setSentIds((prev) => new Set([...prev, lead.id]))
    
    // Optimistic UI
    setProspectos(prev => prev.map(l => l.id === lead.id ? { ...l, ultimo_contacto: now, estado: l.estado === 'Nuevo' ? 'Contactado' : l.estado } : l))

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // 1. Update Lead
      await supabase.from('prospectos').update({
        ultimo_contacto: now,
        estado: lead.estado === 'Nuevo' ? 'Contactado' : lead.estado
      }).eq('id', lead.id)

      // 2. Track activity
      await supabase.from('actividades_prospecto').insert({
        prospecto_id: lead.id,
        user_id: user?.id,
        tipo: 'mensaje_sent',
        contenido: 'Mensaje enviado en Modo Prospección'
      })

      // 3. Update Metrics (Atomic-ish)
      const { data: metrics } = await supabase.from('metricas_diarias').select('*').eq('fecha', today).single()
      if (metrics) {
        await supabase.from('metricas_diarias').update({ mensajes_enviados: metrics.mensajes_enviados + 1 }).eq('id', metrics.id)
      } else {
        await supabase.from('metricas_diarias').insert({ user_id: user?.id, fecha: today, mensajes_enviados: 1 })
      }

      toast.success(`${lead.nombre} marcado como contactado`)
    } catch (err) {
      toast.error('Error al guardar el contacto')
      setProspectos(originalProspectos)
    }
  }

  async function quickFollowup(lead: Prospecto) {
    const fecha = addDaysToToday(3)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('seguimientos').insert({
      prospecto_id: lead.id,
      user_id: user?.id,
      titulo: 'Seguimiento automático',
      descripcion: 'Seguimiento programado desde Modo Prospección',
      fecha: fecha,
      estado: 'pendiente'
    })

    if (error) {
      toast.error('Error al programar seguimiento')
    } else {
      setFollowedIds((prev) => new Set([...prev, lead.id]))
      toast.success(`Seguimiento para el ${format(parseISO(fecha), 'dd/MM')}`)
    }
  }

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
         <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
         <p className="text-gray-400 text-sm">Iniciando motor de prospección...</p>
       </div>
     )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-900/30">
               <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Modo Prospección</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1 font-medium">Fuerza de ventas en tiempo real — Conectado a Supabase</p>
        </div>

        <div className="shrink-0 flex items-center gap-4 bg-gray-900/80 border border-gray-800 rounded-2xl px-5 py-3 shadow-2xl">
          <div className="text-center">
            <p className="text-3xl font-black text-white tabular-nums">{sentHoy}</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Enviados</p>
          </div>
          <div className="w-px h-10 bg-gray-800" />
          <div className="text-center">
            <p className="text-3xl font-black text-gray-700 tabular-nums">{sessionGoal}</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Meta</p>
          </div>
          <div className="w-24">
            <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : pct >= 60 ? 'bg-violet-500' : 'bg-orange-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className={`text-[11px] text-center mt-1.5 font-black tabular-nums ${pct >= 100 ? 'text-green-400' : 'text-gray-500'}`}>
              {pct}% COMPLETADO
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/40 border border-gray-700/60 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative min-w-48 flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-violet-500"
            />
          </div>

          <FilterSelect
            value={filterRubro}
            onChange={setFilterRubro}
            options={[{ value: 'all', label: 'Todos los rubros' }, ...rubroNames.map((r) => ({ value: r, label: r }))]}
          />

          <FilterSelect
            value={filterCiudad}
            onChange={setFilterCiudad}
            options={[{ value: 'all', label: 'Todas las ciudades' }, ...ciudades.map((c) => ({ value: c, label: c }))]}
          />

          <div className="flex items-center gap-2 ml-auto bg-gray-900/50 p-1 rounded-xl border border-gray-800">
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${sortBy === key ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                {SORT_LABELS[key]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-gray-800 rounded-2xl overflow-hidden shadow-2xl bg-gray-900/40">
        <div className="grid grid-cols-[3rem_1fr_10rem_10rem_6rem_1fr_10rem] gap-2 px-4 py-3 bg-gray-800/80 border-b border-gray-700 text-[10px] font-black text-gray-500 uppercase tracking-widest">
          <div>#</div>
          <div>Prospecto</div>
          <div>Rubro</div>
          <div>Ubicación · Estado</div>
          <div>Score</div>
          <div>Estrategia Sugerida</div>
          <div className="text-right">Acciones Rápidas</div>
        </div>

        <div className="divide-y divide-gray-800">
          {filtered.length === 0 ? (
            <div className="py-24 text-center bg-gray-900/20">
               <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                  <X className="w-8 h-8 text-gray-600" />
               </div>
               <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No hay prospectos disponibles</p>
               <Button variant="link" onClick={() => {setSearch(''); setFilterRubro('all');}} className="text-violet-400 mt-2">Limpiar filtros</Button>
            </div>
          ) : (
            filtered.map((lead, idx) => {
              const rubroObj = rubros.find(r => r.id === lead.rubro_id)
              return (
                <ProspeccionRow
                  key={lead.id}
                  lead={lead}
                  idx={idx + 1}
                  isSent={sentIds.has(lead.id)}
                  isCopied={copiedId === lead.id}
                  hasFollowup={followedIds.has(lead.id) || !!lead.proximo_seguimiento}
                  nicheMessage={rubroObj?.mensaje_sugerido ?? ''}
                  onCopy={() => copyMessage(lead)}
                  onMarkSent={() => markSent(lead)}
                  onFollowup={() => quickFollowup(lead)}
                />
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

function ProspeccionRow({
  lead, idx, isSent, isCopied, hasFollowup, nicheMessage,
  onCopy, onMarkSent, onFollowup,
}: {
  lead: Prospecto
  idx: number
  isSent: boolean
  isCopied: boolean
  hasFollowup: boolean
  nicheMessage: string
  onCopy: () => void
  onMarkSent: () => void
  onFollowup: () => void
}) {
  const score = computeScore(lead as any)
  const tier = getScoreTier(score)
  const days = daysSince(lead.ultimo_contacto)
  const isUrgent = !isSent && (days === null || days >= 2)
  const whatsappUrl = lead.whatsapp ? buildWhatsAppUrl(lead, nicheMessage) : null
  const instagramUrl = lead.instagram ? `https://instagram.com/${lead.instagram.replace('@', '')}` : null

  return (
    <div className={`grid grid-cols-[3rem_1fr_10rem_10rem_6rem_1fr_10rem] gap-2 px-4 py-4 items-center transition-all ${
      isSent
        ? 'bg-gray-900/40 opacity-40 grayscale'
        : isUrgent
        ? 'bg-orange-500/5 hover:bg-orange-500/10'
        : 'hover:bg-gray-800/60'
    }`}>
      <div className="text-[10px] text-gray-600 font-black tabular-nums">
        {isSent ? <Check className="w-4 h-4 text-green-500" /> : idx}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {isUrgent && !isSent && <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />}
          <Link href={`/prospectos/${lead.id}`} className="text-sm font-bold text-white hover:text-violet-400 truncate transition-colors">
            {lead.nombre}
          </Link>
        </div>
        <p className="text-[11px] text-gray-500 truncate font-medium">{lead.negocio}</p>
        <p className={`text-[10px] mt-1 font-bold uppercase tracking-tighter ${
          days === null ? 'text-orange-500' :
          days === 0 ? 'text-green-500' :
          days >= 5 ? 'text-blue-500' :
          days >= 2 ? 'text-red-500' : 'text-gray-500'
        }`}>
          {days === null ? 'Sin contacto' :
           days === 0 ? 'Hoy' :
           `Hace ${days} día${days > 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="text-xs font-bold text-gray-400 uppercase tracking-tight">
         {(lead as any).rubros?.nombre || 'General'}
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] text-gray-500 font-bold uppercase truncate">{lead.ciudad || '---'}</p>
        <LeadStatusBadge status={lead.estado} />
      </div>

      <div>
        <span className={`text-[10px] font-black tabular-nums px-2 py-1 rounded-lg border ${tier.bg} ${tier.text} ${tier.border}`}>
          {score}
        </span>
      </div>

      <div className="min-w-0 pr-4">
        {nicheMessage ? (
          <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed italic">"{nicheMessage}"</p>
        ) : (
          <p className="text-[10px] text-gray-800 font-bold uppercase">Sin estrategia</p>
        )}
      </div>

      <div className="flex items-center gap-2 justify-end">
        <ActionBtn
          onClick={onCopy}
          title="Copiar mensaje"
          active={isCopied}
          color="gray"
          icon={isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        />

        {whatsappUrl ? (
          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <ActionBtn title="Abrir WA" color="green" icon={<Phone className="w-4 h-4" />} />
          </a>
        ) : (
          <ActionBtn disabled title="Sin WA" color="gray" icon={<Phone className="w-4 h-4 opacity-20" />} />
        )}

        {instagramUrl ? (
          <a href={instagramUrl} target="_blank" rel="noreferrer">
            <ActionBtn title="Instagram" color="pink" icon={<AtSign className="w-4 h-4" />} />
          </a>
        ) : (
          <ActionBtn disabled title="Sin IG" color="gray" icon={<AtSign className="w-4 h-4 opacity-20" />} />
        )}

        <ActionBtn
          onClick={isSent ? undefined : onMarkSent}
          title="Marcar enviado"
          active={isSent}
          color="violet"
          icon={<Zap className="w-4 h-4" />}
        />

        <ActionBtn
          onClick={hasFollowup ? undefined : onFollowup}
          title="Seguimiento +3d"
          active={hasFollowup}
          color="yellow"
          icon={<CalendarPlus className="w-4 h-4" />}
        />
      </div>
    </div>
  )
}

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
    gray: 'border-gray-700 text-gray-400 hover:border-violet-500 hover:text-white bg-gray-900/50',
    green: 'border-green-800/60 text-green-400 hover:bg-green-600 hover:text-white',
    pink: 'border-pink-800/60 text-pink-400 hover:bg-pink-600 hover:text-white',
    violet: 'border-violet-800/60 text-violet-400 hover:bg-violet-600 hover:text-white',
    yellow: 'border-yellow-800/60 text-yellow-400 hover:bg-yellow-600 hover:text-white',
  }

  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all shadow-lg
        ${active ? 'bg-green-600 border-green-500 text-white' : colors[color]}
        ${disabled ? 'opacity-10 cursor-not-allowed' : ''}
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
        className="h-10 pl-3 pr-9 bg-gray-900 border border-gray-700 rounded-xl text-xs font-bold text-gray-400 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-600/50 hover:border-gray-500 transition-all uppercase tracking-widest"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
    </div>
  )
}

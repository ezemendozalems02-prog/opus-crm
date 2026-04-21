'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { LeadStatusBadge } from '@/components/leads/lead-status-badge'
import { InterestStars } from '@/components/leads/interest-stars'
import { mockLeads, mockActivities } from '@/lib/mock-data'
import type { Activity, LeadStatus } from '@/lib/types'
import { STATUS_LABELS } from '@/lib/types'
import { computeScoreBreakdown, getScoreTier } from '@/lib/score'
import {
  AtSign, Phone, Globe, MapPin, Calendar, ArrowLeft,
  MessageSquare, Reply, Clock, FileText, CheckCircle2, Plus,
  AlertTriangle, Star, ChevronRight, StickyNote
} from 'lucide-react'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, formatDistanceToNow, isPast, isToday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const TIPO_LABELS: Record<Activity['type'], string> = {
  message_sent: 'Mensaje enviado',
  reply_received: 'Respondió',
  call: 'Llamada',
  meeting: 'Reunión',
  note: 'Nota',
  status_change: 'Cambio de estado',
}

const activityIcons: Record<Activity['type'], React.ReactNode> = {
  message_sent: <MessageSquare className="w-4 h-4 text-blue-400" />,
  reply_received: <Reply className="w-4 h-4 text-green-400" />,
  call: <Phone className="w-4 h-4 text-purple-400" />,
  meeting: <Calendar className="w-4 h-4 text-yellow-400" />,
  note: <FileText className="w-4 h-4 text-gray-400" />,
  status_change: <CheckCircle2 className="w-4 h-4 text-violet-400" />,
}

const STATUS_PROGRESSION: Partial<Record<LeadStatus, LeadStatus>> = {
  new: 'contacted',
  contacted: 'replied',
  replied: 'interested',
  interested: 'meeting',
  meeting: 'proposal',
  proposal: 'won',
}

const STATUS_ACTION_LABEL: Partial<Record<LeadStatus, string>> = {
  new: 'Marcar como contactado',
  contacted: 'Marcar que respondió',
  replied: 'Marcar como interesado',
  interested: 'Registrar reunión',
  meeting: 'Enviar propuesta',
  proposal: 'Marcar como ganado',
}

function formatFecha(dateStr: string | null): string | null {
  if (!dateStr) return null
  try {
    return format(parseISO(dateStr), "d 'de' MMMM, yyyy", { locale: es })
  } catch {
    return dateStr
  }
}

function getFollowupStatus(dateStr: string | null): { label: string; color: string; icon: React.ReactNode } | null {
  if (!dateStr) return null
  try {
    const date = parseISO(dateStr)
    if (isToday(date)) return {
      label: 'Hoy',
      color: 'text-yellow-400',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />,
    }
    if (isPast(date)) return {
      label: `Vencido (${formatDistanceToNow(date, { locale: es, addSuffix: true })})`,
      color: 'text-red-400',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
    }
    return {
      label: format(date, "d 'de' MMM", { locale: es }),
      color: 'text-green-400',
      icon: <Calendar className="w-3.5 h-3.5 text-green-400" />,
    }
  } catch {
    return null
  }
}

export default function ProspectoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const originalLead = mockLeads.find((l) => l.id === params.id)

  const [lead, setLead] = useState(originalLead)
  const [activities, setActivities] = useState<Activity[]>(
    mockActivities.filter((a) => a.lead_id === params.id)
  )
  const [noteText, setNoteText] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)
  const [followupOpen, setFollowupOpen] = useState(false)
  const [followupDate, setFollowupDate] = useState(lead?.next_followup_at ?? '')
  const [activityType, setActivityType] = useState<Activity['type']>('message_sent')
  const [activityDesc, setActivityDesc] = useState('')

  if (!lead) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Prospecto no encontrado</p>
        <Link href="/prospectos" className="text-violet-400 hover:text-violet-300 mt-2 inline-block">← Volver a prospectos</Link>
      </div>
    )
  }

  function pushActivity(type: Activity['type'], description: string) {
    const act: Activity = {
      id: String(Date.now()),
      lead_id: lead!.id,
      type,
      description,
      created_at: new Date().toISOString(),
    }
    setActivities((prev) => [act, ...prev])
  }

  function avanzarEstado() {
    const next = STATUS_PROGRESSION[lead!.status]
    if (!next) return
    setLead((prev) => prev ? { ...prev, status: next, last_contacted_at: new Date().toISOString().split('T')[0] } : prev)
    pushActivity('status_change', `Estado actualizado a "${STATUS_LABELS[next]}"`)
  }

  function guardarSeguimiento() {
    if (!followupDate) return
    setLead((prev) => prev ? { ...prev, next_followup_at: followupDate } : prev)
    pushActivity('note', `Seguimiento programado para ${formatFecha(followupDate)}`)
    setFollowupOpen(false)
  }

  function guardarNota() {
    if (!noteText.trim()) return
    pushActivity('note', noteText.trim())
    setNoteText('')
    setNoteOpen(false)
  }

  function registrarActividad() {
    if (!activityDesc.trim()) return
    pushActivity(activityType, activityDesc.trim())
    setActivityDesc('')
  }

  const nextStatusLabel = STATUS_ACTION_LABEL[lead.status]
  const followupStatus = getFollowupStatus(lead.next_followup_at)
  const scoreBreakdown = computeScoreBreakdown(lead)
  const tier = getScoreTier(scoreBreakdown.total)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors mt-1 shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{lead.name}</h1>
            <LeadStatusBadge status={lead.status} />
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-400 flex-wrap">
            <span>{lead.business_name}</span>
            <span className="text-gray-600">·</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{lead.city}</span>
            <span className="text-gray-600">·</span>
            <span>{lead.niche}</span>
          </div>
        </div>
        {/* Score visible */}
        <div className="shrink-0 text-right space-y-1.5">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${tier.bg} ${tier.text} ${tier.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${tier.dot}`} />
            {tier.label}
            <span className="font-bold">{scoreBreakdown.total}</span>
          </span>
          <div className="flex items-center justify-end gap-2">
            <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${tier.barColor}`} style={{ width: `${scoreBreakdown.total}%` }} />
            </div>
          </div>
          <div className="flex justify-end"><InterestStars level={lead.interest_level} /></div>
        </div>
      </div>

      {/* Barra de estado de contacto */}
      <div className="flex items-center gap-6 px-4 py-2.5 bg-gray-800/40 border border-gray-700/50 rounded-lg flex-wrap">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs text-gray-400">Último contacto:</span>
          <span className="text-xs text-white font-medium">
            {lead.last_contacted_at ? formatFecha(lead.last_contacted_at) : <span className="text-gray-500 italic">Sin contacto aún</span>}
          </span>
        </div>
        <div className="w-px h-4 bg-gray-700" />
        <div className="flex items-center gap-2">
          {followupStatus ? followupStatus.icon : <Calendar className="w-3.5 h-3.5 text-gray-500" />}
          <span className="text-xs text-gray-400">Próximo seguimiento:</span>
          {followupStatus ? (
            <span className={`text-xs font-medium ${followupStatus.color}`}>{followupStatus.label}</span>
          ) : (
            <span className="text-xs text-gray-500 italic">No programado</span>
          )}
        </div>
        {lead.notes && (
          <>
            <div className="w-px h-4 bg-gray-700" />
            <p className="text-xs text-gray-400 truncate max-w-xs">{lead.notes}</p>
          </>
        )}
      </div>

      {/* ACCIONES PRINCIPALES */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {lead.whatsapp ? (
            <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
              <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 font-medium">
                <Phone className="w-4 h-4" /> Abrir WhatsApp
              </Button>
            </a>
          ) : (
            <Button disabled className="gap-2 opacity-40">
              <Phone className="w-4 h-4" /> WhatsApp no disponible
            </Button>
          )}

          {lead.instagram ? (
            <a href={`https://instagram.com/${lead.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white gap-2 font-medium">
                <AtSign className="w-4 h-4" /> Abrir Instagram
              </Button>
            </a>
          ) : (
            <Button disabled className="gap-2 opacity-40">
              <AtSign className="w-4 h-4" /> Instagram no disponible
            </Button>
          )}

          {nextStatusLabel && (
            <Button onClick={avanzarEstado} variant="outline" className="border-violet-600 text-violet-300 hover:bg-violet-900/30 gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4" /> {nextStatusLabel}
            </Button>
          )}

          <Button
            onClick={() => { setFollowupOpen((v) => !v); setNoteOpen(false) }}
            variant="outline"
            className={`gap-2 font-medium ${followupOpen ? 'border-yellow-500 text-yellow-300' : 'border-gray-600 text-gray-300 hover:border-yellow-500 hover:text-yellow-300'}`}
          >
            <Calendar className="w-4 h-4" /> Programar seguimiento
          </Button>

          <Button
            onClick={() => { setNoteOpen((v) => !v); setFollowupOpen(false) }}
            variant="outline"
            className={`gap-2 font-medium ${noteOpen ? 'border-blue-500 text-blue-300' : 'border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-300'}`}
          >
            <StickyNote className="w-4 h-4" /> Agregar nota rápida
          </Button>
        </div>

        {/* Inline: Programar seguimiento */}
        {followupOpen && (
          <div className="flex items-center gap-3 p-3 bg-yellow-900/15 border border-yellow-700/40 rounded-lg">
            <Calendar className="w-4 h-4 text-yellow-400 shrink-0" />
            <span className="text-sm text-yellow-300 font-medium shrink-0">Próximo seguimiento:</span>
            <input
              type="date"
              value={followupDate}
              onChange={(e) => setFollowupDate(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
            <Button onClick={guardarSeguimiento} size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-black font-medium">
              Guardar
            </Button>
            <button onClick={() => setFollowupOpen(false)} className="text-xs text-gray-500 hover:text-gray-300 ml-auto">
              Cancelar
            </button>
          </div>
        )}

        {/* Inline: Nota rápida */}
        {noteOpen && (
          <div className="p-3 bg-blue-900/15 border border-blue-700/40 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300 font-medium">Nota rápida</span>
            </div>
            <Textarea
              autoFocus
              placeholder="Escribí lo que necesitás recordar sobre este prospecto..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white resize-none text-sm"
              rows={3}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) guardarNota() }}
            />
            <div className="flex items-center gap-2">
              <Button onClick={guardarNota} size="sm" className="bg-blue-600 hover:bg-blue-700">
                Guardar nota
              </Button>
              <button onClick={() => { setNoteOpen(false); setNoteText('') }} className="text-xs text-gray-500 hover:text-gray-300">
                Cancelar
              </button>
              <span className="text-xs text-gray-600 ml-auto">Ctrl+Enter para guardar</span>
            </div>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-3 gap-5">
        {/* Columna izquierda — datos */}
        <div className="col-span-1 space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Datos de contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lead.whatsapp ? (
                <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 group">
                  <Phone className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-sm text-green-400 group-hover:text-green-300">{lead.whatsapp}</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 opacity-40">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Sin WhatsApp</span>
                </div>
              )}

              {lead.instagram ? (
                <a href={`https://instagram.com/${lead.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 group">
                  <AtSign className="w-4 h-4 text-pink-400 shrink-0" />
                  <span className="text-sm text-pink-400 group-hover:text-pink-300">{lead.instagram}</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 opacity-40">
                  <AtSign className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Sin Instagram</span>
                </div>
              )}

              {lead.website && (
                <a href={`https://${lead.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 group">
                  <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-sm text-blue-400 group-hover:text-blue-300 truncate">{lead.website}</span>
                </a>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Estado del prospecto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Estado actual</span>
                <LeadStatusBadge status={lead.status} />
              </div>
              {/* Score comercial con desglose */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Score comercial</span>
                  <span className={`text-sm font-bold ${tier.text}`}>{scoreBreakdown.total} / 100</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${tier.barColor}`} style={{ width: `${scoreBreakdown.total}%` }} />
                </div>
                {/* Badge tier */}
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${tier.bg} ${tier.text} ${tier.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${tier.dot}`} />
                  {tier.label}
                </span>
                {/* Desglose de reglas */}
                <div className="space-y-1 pt-1 border-t border-gray-700">
                  <p className="text-xs text-gray-600">Desglose:</p>
                  {scoreBreakdown.reasons.map((r, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{r.label}</span>
                      <span className={`text-xs font-medium tabular-nums ${r.value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {r.value > 0 ? '+' : ''}{r.value}
                      </span>
                    </div>
                  ))}
                  {scoreBreakdown.reasons.length === 0 && (
                    <p className="text-xs text-gray-600 italic">Sin actividad aún</p>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">Interés</span>
                <InterestStars level={lead.interest_level} />
              </div>
              <div className="pt-2 border-t border-gray-700 space-y-2">
                <div>
                  <span className="text-xs text-gray-500 block">Último contacto</span>
                  <span className="text-sm text-white">
                    {lead.last_contacted_at ? formatFecha(lead.last_contacted_at) : <span className="text-gray-500 italic text-xs">Sin contacto</span>}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Próximo seguimiento</span>
                  {followupStatus ? (
                    <span className={`text-sm font-medium ${followupStatus.color}`}>{followupStatus.label}</span>
                  ) : (
                    <button
                      onClick={() => setFollowupOpen(true)}
                      className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 mt-0.5"
                    >
                      <Plus className="w-3 h-3" /> Programar
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {lead.notes && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Notas de la ficha</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300">{lead.notes}</p>
              </CardContent>
            </Card>
          )}

          <Link href="/plantillas">
            <Button variant="outline" size="sm" className="w-full border-violet-700 text-violet-400 hover:bg-violet-900/20 justify-start gap-2">
              <MessageSquare className="w-3.5 h-3.5" /> Ver plantillas de mensaje
            </Button>
          </Link>
        </div>

        {/* Columna derecha: actividad */}
        <div className="col-span-2 space-y-4">
          {/* Registrar actividad */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Registrar actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Select value={activityType} onValueChange={(v) => setActivityType((v ?? 'message_sent') as Activity['type'])}>
                  <SelectTrigger className="w-48 bg-gray-900 border-gray-700 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="message_sent">Mensaje enviado</SelectItem>
                    <SelectItem value="reply_received">Respondió</SelectItem>
                    <SelectItem value="call">Llamada</SelectItem>
                    <SelectItem value="meeting">Reunión</SelectItem>
                    <SelectItem value="note">Nota</SelectItem>
                    <SelectItem value="status_change">Cambio de estado</SelectItem>
                  </SelectContent>
                </Select>
                <input
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="¿Qué pasó? Describí brevemente..."
                  value={activityDesc}
                  onChange={(e) => setActivityDesc(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') registrarActividad() }}
                />
                <Button onClick={registrarActividad} size="sm" className="bg-violet-600 hover:bg-violet-700 shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center justify-between">
                Historial de actividad
                <span className="text-xs text-gray-600 font-normal">{activities.length} registros</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-10">
                  <MessageSquare className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Sin actividad registrada</p>
                  <p className="text-xs text-gray-600 mt-1">¡Enviá el primer mensaje y registralo!</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-700" />
                  <div className="space-y-3">
                    {activities.map((act) => (
                      <div key={act.id} className="flex gap-4 pl-10 relative">
                        <div className="absolute left-[7px] w-4 h-4 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center top-3">
                          <div className="w-2 h-2 rounded-full bg-violet-500" />
                        </div>
                        <div className="flex-1 bg-gray-900 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            {activityIcons[act.type]}
                            <span className="text-xs font-medium text-gray-300">{TIPO_LABELS[act.type]}</span>
                            <span className="ml-auto text-xs text-gray-600 shrink-0">
                              {format(new Date(act.created_at), "d 'de' MMM, HH:mm", { locale: es })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{act.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { LeadStatusBadge } from '@/components/leads/lead-status-badge'
import { InterestStars } from '@/components/leads/interest-stars'
import type { Prospecto, ActividadProspecto, LeadStatus, Rubro, Seguimiento } from '@/lib/types'
import { computeScoreBreakdown, getScoreTier } from '@/lib/score'
import {
  AtSign, Phone, Globe, MapPin, Calendar, ArrowLeft,
  MessageSquare, Reply, Clock, FileText, CheckCircle2, Plus,
  AlertTriangle, Star, ChevronRight, StickyNote, Loader2, Zap, Trash2, XCircle
} from 'lucide-react'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, formatDistanceToNow, isPast, isToday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const TIPO_LABELS: Record<string, string> = {
  message_sent: 'Mensaje enviado',
  reply_received: 'Respondió',
  call: 'Llamada',
  meeting: 'Reunión',
  note: 'Nota',
  status_change: 'Cambio de estado',
}

const activityIcons: Record<string, React.ReactNode> = {
  message_sent: <MessageSquare className="w-4 h-4 text-blue-400" />,
  reply_received: <Reply className="w-4 h-4 text-green-400" />,
  call: <Phone className="w-4 h-4 text-purple-400" />,
  meeting: <Calendar className="w-4 h-4 text-yellow-400" />,
  note: <FileText className="w-4 h-4 text-gray-400" />,
  status_change: <CheckCircle2 className="w-4 h-4 text-violet-400" />,
}

const STATUS_PROGRESSION: Partial<Record<LeadStatus, LeadStatus>> = {
  'Nuevo': 'Contactado',
  'Contactado': 'Respondió',
  'Respondió': 'Interesado',
  'Interesado': 'Reunión',
  'Reunión': 'Propuesta',
  'Propuesta': 'Ganado',
}

const STATUS_ACTION_LABEL: Partial<Record<LeadStatus, string>> = {
  'Nuevo': 'Marcar como contactado',
  'Contactado': 'Marcar que respondió',
  'Respondió': 'Marcar como interesado',
  'Interesado': 'Registrar reunión',
  'Reunión': 'Enviar propuesta',
  'Propuesta': 'Marcar como ganado',
}

function formatFecha(dateStr: string | null): string | null {
  if (!dateStr) return null
  try {
    return format(parseISO(dateStr), "d 'de' MMMM, yyyy", { locale: es })
  } catch {
    return dateStr
  }
}

export default function ProspectoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [lead, setLead] = useState<Prospecto | null>(null)
  const [activities, setActivities] = useState<ActividadProspecto[]>([])
  const [loading, setLoading] = useState(true)
  const [noteText, setNoteText] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)
  const [followupOpen, setFollowupOpen] = useState(false)
  const [followupDate, setFollowupDate] = useState('')
  const [activityType, setActivityType] = useState('message_sent')
  const [activityDesc, setActivityDesc] = useState('')

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: pData } = await supabase
      .from('prospectos')
      .select('*, rubros(*)')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()
    const { data: aData } = await supabase
      .from('actividades_prospecto')
      .select('*')
      .eq('prospecto_id', params.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (pData) {
      setLead(pData)
      setFollowupDate(pData.proximo_seguimiento?.split('T')[0] || '')
    }
    if (aData) setActivities(aData)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [params.id, supabase])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <p className="text-gray-500 text-sm">Cargando ficha del prospecto...</p>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800 m-6">
        <XCircle className="w-12 h-12 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest">Prospecto no encontrado</p>
        <Link href="/prospectos" className="text-violet-400 hover:text-violet-300 mt-4 inline-block font-medium">← Volver a prospectos</Link>
      </div>
    )
  }

  async function pushActivity(type: string, description: string) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('actividades_prospecto').insert({
      prospecto_id: lead!.id,
      user_id: user?.id,
      tipo: type,
      contenido: description
    }).select().single()

    if (data) setActivities([data, ...activities])
    return { data, error }
  }

  async function avanzarEstado() {
    const next = STATUS_PROGRESSION[lead!.estado]
    if (!next) return
    
    const now = new Date().toISOString()
    const { error } = await supabase.from('prospectos').update({
      estado: next,
      ultimo_contacto: now
    }).eq('id', lead!.id)

    if (!error) {
      setLead({ ...lead!, estado: next, ultimo_contacto: now })
      await pushActivity('status_change', `Estado actualizado a "${next}"`)
      toast.success(`Estado: ${next}`)
    }
  }

  async function guardarSeguimiento() {
    if (!followupDate) return
    const { data: { user } } = await supabase.auth.getUser()
    const fechaISO = new Date(followupDate + 'T10:00:00').toISOString()

    const { error } = await supabase.from('seguimientos').insert({
      prospecto_id: lead!.id,
      user_id: user?.id,
      titulo: 'Seguimiento programado',
      descripcion: 'Agendado desde la ficha del prospecto',
      fecha: fechaISO,
      estado: 'pendiente'
    })

    if (!error) {
      await supabase.from('prospectos').update({ proximo_seguimiento: fechaISO }).eq('id', lead!.id)
      setLead({ ...lead!, proximo_seguimiento: fechaISO })
      await pushActivity('note', `Seguimiento programado para ${format(parseISO(fechaISO), "d 'de' MMM", { locale: es })}`)
      setFollowupOpen(false)
      toast.success('Seguimiento agendado')
    }
  }

  async function guardarNota() {
    if (!noteText.trim()) return
    await pushActivity('note', noteText.trim())
    setNoteText('')
    setNoteOpen(false)
    toast.success('Nota guardada')
  }

  async function registrarActividad() {
    if (!activityDesc.trim()) return
    await pushActivity(activityType, activityDesc.trim())
    setActivityDesc('')
    toast.success('Actividad registrada')
  }

  const nextStatusLabel = STATUS_ACTION_LABEL[lead.estado]
  const scoreBreakdown = computeScoreBreakdown(lead as any)
  const tier = getScoreTier(scoreBreakdown.total)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => router.back()} className="p-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-500 transition-all shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-black text-white tracking-tight">{lead.nombre}</h1>
            <LeadStatusBadge status={lead.estado} />
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm font-medium text-gray-500 flex-wrap">
            <span className="text-white bg-gray-800 px-2 py-0.5 rounded border border-gray-700">{lead.negocio}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-violet-500" />{lead.ciudad || 'Sin ciudad'}</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-yellow-500" />{(lead as any).rubros?.nombre || 'General'}</span>
          </div>
        </div>
        <div className="shrink-0 text-right space-y-2">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-lg ${tier.bg} ${tier.text} ${tier.border}`}>
            <span className={`w-2 h-2 rounded-full ${tier.dot} shadow-[0_0_8px_currentColor]`} />
            <span className="font-black uppercase text-[10px] tracking-widest">{tier.label}</span>
            <span className="font-black text-lg ml-1 tabular-nums">{scoreBreakdown.total}</span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <div className="w-32 h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800 shadow-inner">
              <div className={`h-full rounded-full transition-all duration-1000 ${tier.barColor}`} style={{ width: `${scoreBreakdown.total}%` }} />
            </div>
          </div>
          <div className="flex justify-end"><InterestStars level={lead.nivel_interes} /></div>
        </div>
      </div>

      {/* Info rápida */}
      <div className="grid grid-cols-3 gap-4">
         <Card className="bg-gray-800/40 border-gray-700 shadow-xl overflow-hidden group">
            <div className="h-1 w-full bg-violet-600/50" />
            <CardContent className="pt-4 flex items-center gap-4">
               <div className="p-3 bg-violet-900/20 rounded-2xl text-violet-400 group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Último contacto</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {lead.ultimo_contacto ? formatFecha(lead.ultimo_contacto) : <span className="text-gray-600 italic">Nunca</span>}
                  </p>
               </div>
            </CardContent>
         </Card>

         <Card className="bg-gray-800/40 border-gray-700 shadow-xl overflow-hidden group">
            <div className={`h-1 w-full ${lead.proximo_seguimiento ? 'bg-yellow-600/50' : 'bg-gray-700/50'}`} />
            <CardContent className="pt-4 flex items-center gap-4">
               <div className={`p-3 rounded-2xl group-hover:scale-110 transition-transform ${lead.proximo_seguimiento ? 'bg-yellow-900/20 text-yellow-400' : 'bg-gray-900/50 text-gray-600'}`}>
                  <Calendar className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Seguimiento</p>
                  <p className={`text-sm font-bold mt-0.5 ${lead.proximo_seguimiento ? 'text-white' : 'text-gray-600'}`}>
                    {lead.proximo_seguimiento ? format(parseISO(lead.proximo_seguimiento), "d 'de' MMM", { locale: es }) : 'No agendado'}
                  </p>
               </div>
            </CardContent>
         </Card>

         <Card className="bg-gray-800/40 border-gray-700 shadow-xl overflow-hidden group">
            <div className="h-1 w-full bg-blue-600/50" />
            <CardContent className="pt-4 flex items-center gap-4">
               <div className="p-3 bg-blue-900/20 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5" />
               </div>
               <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Estado</p>
                  <p className="text-sm font-bold text-white mt-0.5 truncate uppercase tracking-tight">{lead.estado}</p>
               </div>
            </CardContent>
         </Card>
      </div>

      {/* Acciones principales */}
      <div className="flex items-center gap-3 flex-wrap">
          {lead.whatsapp && (
            <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
              <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 font-black uppercase text-[11px] tracking-widest h-11 shadow-lg shadow-green-900/20 px-6 rounded-xl transition-all hover:scale-105 active:scale-95">
                <Phone className="w-4 h-4" /> WhatsApp
              </Button>
            </a>
          )}
          {lead.instagram && (
            <a href={`https://instagram.com/${lead.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white gap-2 font-black uppercase text-[11px] tracking-widest h-11 shadow-lg shadow-pink-900/20 px-6 rounded-xl transition-all hover:scale-105 active:scale-95">
                <AtSign className="w-4 h-4" /> Instagram
              </Button>
            </a>
          )}
          {nextStatusLabel && (
            <Button onClick={avanzarEstado} variant="outline" className="border-violet-600/50 text-violet-400 hover:bg-violet-600 hover:text-white gap-2 font-black uppercase text-[11px] tracking-widest h-11 px-6 rounded-xl shadow-lg transition-all">
              <Zap className="w-4 h-4" /> {nextStatusLabel}
            </Button>
          )}
          <Button
            onClick={() => { setFollowupOpen(!followupOpen); setNoteOpen(false) }}
            variant="outline"
            className={`gap-2 font-black uppercase text-[11px] tracking-widest h-11 px-6 rounded-xl shadow-lg transition-all ${followupOpen ? 'bg-yellow-600 text-white border-yellow-500' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}
          >
            <Calendar className="w-4 h-4" /> Seguimiento
          </Button>
          <Button
            onClick={() => { setNoteOpen(!noteOpen); setFollowupOpen(false) }}
            variant="outline"
            className={`gap-2 font-black uppercase text-[11px] tracking-widest h-11 px-6 rounded-xl shadow-lg transition-all ${noteOpen ? 'bg-blue-600 text-white border-blue-500' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}
          >
            <StickyNote className="w-4 h-4" /> Nota
          </Button>
      </div>

      {/* Formas expansibles */}
      {followupOpen && (
        <Card className="bg-yellow-900/10 border-yellow-700/30 p-4 rounded-2xl shadow-xl animate-in slide-in-from-top-2">
           <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-yellow-500" />
              <p className="text-sm font-bold text-yellow-200">Programar próximo seguimiento</p>
              <Input type="date" value={followupDate} onChange={e => setFollowupDate(e.target.value)} className="bg-gray-900 border-gray-700 text-white w-48" />
              <Button onClick={guardarSeguimiento} className="bg-yellow-600 hover:bg-yellow-700 text-black font-black uppercase text-[10px] tracking-widest">Agendar</Button>
              <Button variant="ghost" size="sm" onClick={() => setFollowupOpen(false)} className="text-gray-500 ml-auto">Cancelar</Button>
           </div>
        </Card>
      )}

      {noteOpen && (
        <Card className="bg-blue-900/10 border-blue-700/30 p-4 rounded-2xl shadow-xl animate-in slide-in-from-top-2">
           <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <StickyNote className="w-5 h-5 text-blue-400" />
                 <p className="text-sm font-bold text-blue-200 uppercase tracking-widest">Nueva nota rápida</p>
              </div>
              <Textarea 
                value={noteText} 
                onChange={e => setNoteText(e.target.value)} 
                placeholder="Escribí detalles importantes aquí..." 
                className="bg-gray-900 border-gray-700 text-white" 
              />
              <div className="flex gap-2">
                 <Button onClick={guardarNota} className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest">Guardar Nota</Button>
                 <Button variant="ghost" size="sm" onClick={() => setNoteOpen(false)} className="text-gray-500">Cancelar</Button>
              </div>
           </div>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Columna izquierda: Datos y Score */}
        <div className="space-y-6">
           <Card className="bg-gray-800/40 border-gray-700 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gray-900/30 border-b border-gray-700 pb-3">
                 <CardTitle className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                 {lead.sitio_web && (
                    <a href={`https://${lead.sitio_web}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-blue-500/30 transition-all group">
                       <Globe className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                       <span className="text-xs font-bold text-gray-300 truncate">{lead.sitio_web}</span>
                    </a>
                 )}
                 <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Notas de ficha</p>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 text-xs text-gray-400 leading-relaxed italic">
                       {lead.notas || 'Sin notas descriptivas'}
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="bg-gray-800/40 border-gray-700 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gray-900/30 border-b border-gray-700 pb-3">
                 <CardTitle className="text-[11px] font-black text-gray-500 uppercase tracking-widest text-center">Score Comercial Detallado</CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">
                 <div className="space-y-2">
                    {scoreBreakdown.reasons.map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/20 transition-colors">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{r.label}</span>
                        <span className={`text-xs font-black tabular-nums ${r.value > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {r.value > 0 ? '+' : ''}{r.value}
                        </span>
                      </div>
                    ))}
                 </div>
                 <div className="pt-4 border-t border-gray-700">
                    <Link href="/plantillas">
                      <Button variant="ghost" className="w-full text-violet-400 hover:text-white hover:bg-violet-600/20 gap-2 font-black uppercase text-[10px] tracking-widest">
                         <MessageSquare className="w-4 h-4" /> Ver plantillas de apoyo
                      </Button>
                    </Link>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Columna derecha: Actividad */}
        <div className="col-span-2 space-y-6">
           <Card className="bg-gray-800/40 border-gray-700 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gray-900/30 border-b border-gray-700 pb-4">
                 <CardTitle className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Registrar nueva actividad</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                 <div className="flex gap-3">
                    <Select value={activityType} onValueChange={(val) => setActivityType(val || 'message_sent')}>
                       <SelectTrigger className="w-52 bg-gray-900 border-gray-700 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          <SelectItem value="message_sent">Mensaje enviado</SelectItem>
                          <SelectItem value="reply_received">Respondió</SelectItem>
                          <SelectItem value="call">Llamada</SelectItem>
                          <SelectItem value="meeting">Reunión</SelectItem>
                          <SelectItem value="note">Nota</SelectItem>
                          <SelectItem value="status_change">Cambio de estado</SelectItem>
                       </SelectContent>
                    </Select>
                    <Input 
                      value={activityDesc} 
                      onChange={e => setActivityDesc(e.target.value)} 
                      placeholder="¿Qué ocurrió en este paso?" 
                      className="bg-gray-900 border-gray-700 text-white rounded-xl"
                      onKeyDown={e => e.key === 'Enter' && registrarActividad()}
                    />
                    <Button onClick={registrarActividad} className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg rounded-xl h-10 w-10 p-0">
                       <Plus className="w-5 h-5" />
                    </Button>
                 </div>
              </CardContent>
           </Card>

           <Card className="bg-gray-800/40 border-gray-700 shadow-xl rounded-2xl overflow-hidden min-h-[400px]">
              <CardHeader className="bg-gray-900/30 border-b border-gray-700 pb-4">
                 <CardTitle className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center justify-between">
                    Historial de interacción
                    <span className="text-[10px] text-violet-400">{activities.length} REGISTROS</span>
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                 {activities.length === 0 ? (
                    <div className="text-center py-20 opacity-30">
                       <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                       <p className="text-sm font-black uppercase tracking-widest">Sin actividad registrada aún</p>
                    </div>
                 ) : (
                    <div className="relative pl-8">
                       <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-gray-800" />
                       <div className="space-y-8">
                          {activities.map((act) => (
                             <div key={act.id} className="relative">
                                <div className="absolute -left-[33px] top-1 w-6 h-6 rounded-full bg-gray-900 border-2 border-gray-800 flex items-center justify-center z-10 shadow-lg">
                                   <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                                </div>
                                <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 shadow-inner hover:border-gray-700 transition-all">
                                   <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                         {activityIcons[act.tipo] || <FileText className="w-4 h-4 text-gray-400" />}
                                         <span className="text-[10px] font-black text-white uppercase tracking-widest">{TIPO_LABELS[act.tipo] || 'Actividad'}</span>
                                      </div>
                                      <span className="text-[10px] font-bold text-gray-600 uppercase">
                                         {format(parseISO(act.created_at), "d 'de' MMM, HH:mm", { locale: es })}
                                      </span>
                                   </div>
                                   <p className="text-sm text-gray-400 leading-relaxed font-medium">{act.contenido}</p>
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

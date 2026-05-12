'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { LeadStatusBadge } from '@/components/leads/lead-status-badge'
import { InterestStars } from '@/components/leads/interest-stars'
import {
  MessageSquare, Reply, Calendar, Trophy, Flame, Bell,
  TrendingUp, Target, FileText, Clock, Zap, Play,
  ArrowRight, AlertTriangle, CheckCircle2, Star, ChevronRight, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { format, isToday, isBefore, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import type { Prospecto, MetricasDiarias, Campaña, ActividadProspecto } from '@/lib/types'

export default function PanelPage() {
  const [loading, setLoading] = useState(true)
  const [metricas, setMetricas] = useState<MetricasDiarias | null>(null)
  const [prospectos, setProspectos] = useState<Prospecto[]>([])
  const [campañas, setCampañas] = useState<Campaña[]>([])
  const [actividades, setActividades] = useState<ActividadProspecto[]>([])
  const [goals, setGoals] = useState({ mensajes_diarios: 30, reuniones_diarias: 3 })
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const today = new Date().toISOString().split('T')[0]

      // Fetch Metricas de hoy
      const { data: metricsData } = await supabase
        .from('metricas_diarias')
        .select('*')
        .eq('fecha', today)
        .eq('user_id', user.id)
        .single()
      
      // Fetch Prospectos calientes y seguimientos
      const { data: leadsData } = await supabase
        .from('prospectos')
        .select('*, rubros(nombre)')
        .eq('user_id', user.id)
        .order('score', { ascending: false })

      // Fetch Campañas activas
      const { data: campaignsData } = await supabase
        .from('campañas')
        .select('*, rubros(nombre)')
        .eq('estado', 'activa')
        .eq('user_id', user.id)

      // Fetch Actividad reciente
      const { data: activitiesData } = await supabase
        .from('actividades_prospecto')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch Perfil actual para verificar trial y obtener metas
      const { data: profile } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        // Actualizar metas desde el perfil si existen
        setGoals({
          mensajes_diarios: profile.mensajes_diarios || 30,
          reuniones_diarias: profile.reuniones_diarias || 3
        })

        if (profile.rol === 'cliente' && profile.estado_cuenta === 'trial' && profile.trial_fin) {
          if (new Date(profile.trial_fin) < new Date()) {
            // Trial vencido, actualizar DB
            await supabase.from('perfiles').update({ estado_cuenta: 'vencida' }).eq('id', user.id)
            window.location.href = '/suscripcion/vencida'
            return
          }
        }
      }

      setMetricas(metricsData || {
        id: '',
        user_id: '',
        fecha: today,
        mensajes_enviados: 0,
        respuestas: 0,
        reuniones: 0,
        propuestas: 0,
        cierres: 0,
        created_at: ''
      })
      setProspectos(leadsData || [])
      setCampañas(campaignsData || [])
      setActividades(activitiesData || [])
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <p className="text-gray-400 text-sm animate-pulse">Cargando tu panel...</p>
      </div>
    )
  }

  const todayStr = new Date().toISOString().split('T')[0]

  const prospectoCalientes = prospectos
    .filter((l) => l.nivel_interes >= 4 && !['Ganado', 'Perdido'].includes(l.estado))
    .slice(0, 5)

  const seguimientosVencidos = prospectos.filter(
    (l) => l.proximo_seguimiento && isBefore(parseISO(l.proximo_seguimiento), new Date()) && !isToday(parseISO(l.proximo_seguimiento)) && !['Ganado', 'Perdido'].includes(l.estado)
  )

  const seguimientosHoy = prospectos.filter(
    (l) => l.proximo_seguimiento && isToday(parseISO(l.proximo_seguimiento)) && !['Ganado', 'Perdido'].includes(l.estado)
  )

  const listosParaSeguir = prospectos.filter(
    (l) => ['Respondió', 'Interesado'].includes(l.estado)
  ).length

  const listosParaCerrar = prospectos.filter(
    (l) => ['Reunión', 'Propuesta'].includes(l.estado)
  ).length

  const goal_messages = goals.mensajes_diarios
  const goal_meetings = goals.reuniones_diarias
  
  const m = metricas!
  const tasaRespuesta = m.mensajes_enviados > 0 ? Math.round((m.respuestas / m.mensajes_enviados) * 100) : 0
  const progresoMensajes = Math.min(Math.round((m.mensajes_enviados / goal_messages) * 100), 100)
  const faltanMensajes = Math.max(goal_messages - m.mensajes_enviados, 0)
  
  function getMensajeDinamico(pct: number, faltan: number) {
    if (pct === 0) return { text: '¡Arrancá el día! Enviá el primer mensaje y poné el motor en marcha.', tone: 'danger' as const }
    if (pct < 30) return { text: `Hoy estás al ${pct}% de tu meta. Te faltan ${faltan} mensajes. ¡Dale que se puede!`, tone: 'danger' as const }
    if (pct < 60) return { text: `Hoy estás al ${pct}% de tu meta. Seguí así, vas por buen camino.`, tone: 'warning' as const }
    if (pct < 100) return { text: `¡Muy bien! Estás al ${pct}%. Solo te faltan ${faltan} mensajes para cumplir el objetivo.`, tone: 'ok' as const }
    return { text: '¡Meta cumplida! Excelente trabajo el de hoy.', tone: 'great' as const }
  }

  const mensaje = getMensajeDinamico(progresoMensajes, faltanMensajes)
  const seguimientosPendientes = seguimientosVencidos.length + seguimientosHoy.length

  const toneStyles = {
    danger: { bar: 'bg-red-500', text: 'text-red-300', bg: 'bg-red-900/20 border-red-700/40' },
    warning: { bar: 'bg-orange-500', text: 'text-orange-300', bg: 'bg-orange-900/20 border-orange-700/40' },
    ok: { bar: 'bg-violet-500', text: 'text-violet-300', bg: 'bg-violet-900/20 border-violet-700/40' },
    great: { bar: 'bg-green-500', text: 'text-green-300', bg: 'bg-green-900/20 border-green-700/40' },
  }
  const tone = toneStyles[mensaje.tone]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Panel</h1>
          <p className="text-gray-400 text-sm mt-0.5 capitalize">
            {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-violet-900/30 border border-violet-700/50 rounded-lg px-3 py-2">
          <Zap className="w-4 h-4 text-violet-400" />
          <span className="text-xs text-violet-300 font-medium">Conectado a la nube</span>
        </div>
      </div>

      {/* === TU FOCO DE HOY === */}
      <Card className="bg-gray-800/60 border-gray-700 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/10 to-transparent pointer-events-none rounded-xl" />
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-400" />
            Tu foco de hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`flex items-start gap-3 p-3 rounded-lg border mb-4 ${tone.bg}`}>
            {mensaje.tone === 'great'
              ? <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              : mensaje.tone === 'danger'
              ? <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              : <Zap className={`w-4 h-4 mt-0.5 shrink-0 ${tone.text}`} />
            }
            <p className={`text-sm font-medium ${tone.text}`}>{mensaje.text}</p>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">Meta diaria de mensajes</span>
              <span className="text-xs font-bold text-white">{m.mensajes_enviados} / {goal_messages}</span>
            </div>
            <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${tone.bar}`}
                style={{ width: `${progresoMensajes}%` }}
              />
              {[25, 50, 75].map((mark) => (
                <div key={mark} className="absolute top-0 bottom-0 w-px bg-gray-600/60" style={{ left: `${mark}%` }} />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">{progresoMensajes}% completado</span>
              {faltanMensajes > 0 && (
                <span className={`text-xs font-medium ${tone.text}`}>Faltan {faltanMensajes}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <MiniKpi
              icon={<Reply className="w-4 h-4 text-cyan-400" />}
              label="Respuestas hoy"
              value={m.respuestas}
              sub={`${tasaRespuesta}% tasa`}
              highlight={m.respuestas > 5}
            />
            <MiniKpi
              icon={<Clock className="w-4 h-4 text-yellow-400" />}
              label="Seguimientos pend."
              value={seguimientosPendientes}
              sub={seguimientosVencidos.length > 0 ? `${seguimientosVencidos.length} vencidos` : 'Al día'}
              danger={seguimientosVencidos.length > 0}
              href="/seguimientos"
            />
            <MiniKpi
              icon={<Flame className="w-4 h-4 text-orange-400" />}
              label="Prospectos calientes"
              value={prospectoCalientes.length}
              sub="Interés ≥ 4"
              href="/prospectos"
            />
            <MiniKpi
              icon={<Calendar className="w-4 h-4 text-purple-400" />}
              label="Reuniones agendadas"
              value={m.reuniones}
              sub={`Meta: ${goal_meetings}`}
              highlight={m.reuniones >= goal_meetings}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3">
            <MiniKpi
              icon={<FileText className="w-4 h-4 text-orange-400" />}
              label="Propuestas enviadas"
              value={m.propuestas}
              sub="Este mes"
            />
            <MiniKpi
              icon={<Trophy className="w-4 h-4 text-yellow-400" />}
              label="Cierres del mes"
              value={m.cierres}
              sub="¡Bien!"
              highlight={m.cierres > 0}
            />
            <div className="bg-gray-900/60 rounded-lg p-3 space-y-1.5">
              <p className="text-xs text-gray-400 leading-tight">Oportunidades activas</p>
              {listosParaSeguir > 0 && (
                <Link href="/prospectos" className="flex items-center gap-1.5 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span className="text-xs text-cyan-300 group-hover:text-cyan-200">
                    {listosParaSeguir} listos para seguir
                  </span>
                </Link>
              )}
              {listosParaCerrar > 0 && (
                <Link href="/prospectos" className="flex items-center gap-1.5 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                  <span className="text-xs text-green-300 group-hover:text-green-200">
                    {listosParaCerrar} listos para cerrar
                  </span>
                </Link>
              )}
              {listosParaSeguir === 0 && listosParaCerrar === 0 && (
                <p className="text-xs text-gray-600">Sin oportunidades urgentes</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {seguimientosVencidos.length > 0 && (
        <div className="p-3 bg-red-900/20 border border-red-700/40 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-sm text-red-300 font-medium">
              Tenés {seguimientosVencidos.length} seguimiento{seguimientosVencidos.length > 1 ? 's' : ''} vencido{seguimientosVencidos.length > 1 ? 's' : ''} — priorizalos ahora
            </span>
          </div>
          <Link href="/seguimientos" className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium shrink-0">
            Ir a seguimientos <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* 3 columnas */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Prospectos calientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {prospectoCalientes.map((p) => (
              <Link key={p.id} href={`/prospectos/${p.id}`} className="flex items-center justify-between p-2.5 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors group">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-white truncate">{p.nombre}</p>
                  <p className="text-xs text-gray-500 truncate">{p.negocio}</p>
                </div>
                <div className="flex items-center gap-1.5 ml-2 shrink-0">
                  <InterestStars level={p.nivel_interes} />
                  <LeadStatusBadge status={p.estado} />
                </div>
              </Link>
            ))}
            {prospectoCalientes.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-3">Sin prospectos calientes</p>
            )}
            <Link href="/prospectos" className="flex items-center justify-center gap-1 text-xs text-violet-400 hover:text-violet-300 pt-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <Bell className="w-4 h-4 text-yellow-400" />
              Seguimientos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {seguimientosVencidos.slice(0, 2).map((p) => (
              <Link key={p.id} href={`/prospectos/${p.id}`} className="flex items-center justify-between p-2.5 bg-red-900/20 border border-red-800/40 rounded-lg hover:bg-red-900/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    <p className="text-xs font-medium text-white truncate">{p.nombre}</p>
                  </div>
                  <p className="text-xs text-red-400 mt-0.5">Vencido</p>
                </div>
                <LeadStatusBadge status={p.estado} />
              </Link>
            ))}
            {seguimientosHoy.slice(0, 3).map((p) => (
              <Link key={p.id} href={`/prospectos/${p.id}`} className="flex items-center justify-between p-2.5 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                    <p className="text-xs font-medium text-white truncate">{p.nombre}</p>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{p.negocio}</p>
                </div>
                <LeadStatusBadge status={p.estado} />
              </Link>
            ))}
            {seguimientosPendientes === 0 && (
              <p className="text-xs text-gray-500 text-center py-3">Sin seguimientos pendientes</p>
            )}
            <Link href="/seguimientos" className="flex items-center justify-center gap-1 text-xs text-violet-400 hover:text-violet-300 pt-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <Play className="w-4 h-4 text-green-400" /> Campañas activas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {campañas.map((c) => (
              <div key={c.id} className="p-2.5 bg-gray-900 rounded-lg">
                <p className="text-xs font-medium text-white">{c.nombre}</p>
                <p className="text-[10px] text-gray-500 uppercase">{(c as any).rubros?.nombre || 'General'}</p>
              </div>
            ))}
            {campañas.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-3">Sin campañas activas</p>
            )}
            <Link href="/campanas" className="flex items-center justify-center gap-1 text-xs text-violet-400 hover:text-violet-300 pt-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" /> Actividad reciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {actividades.map((act) => {
                const prospecto = prospectos.find((l) => l.id === act.prospecto_id)
                return (
                  <div key={act.id} className="flex items-start gap-3 p-2.5 bg-gray-900 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-300">{act.tipo}</span>
                        {prospecto && (
                          <Link href={`/prospectos/${prospecto.id}`} className="text-xs text-violet-400 hover:text-violet-300 truncate">
                            {prospecto.nombre}
                          </Link>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{act.contenido}</p>
                    </div>
                    <span className="text-[10px] text-gray-600 shrink-0">
                      {format(parseISO(act.created_at), 'dd/MM')}
                    </span>
                  </div>
                )
              })}
              {actividades.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-6">Sin actividad reciente</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/plantillas">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs border-gray-600 hover:border-violet-500 hover:text-violet-300 gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Usar plantilla
                </Button>
              </Link>
              <Link href="/prospectos">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs border-gray-600 hover:border-orange-500 hover:text-orange-300 gap-2">
                  <Flame className="w-3.5 h-3.5" /> Ver calientes
                </Button>
              </Link>
              <Link href="/seguimientos">
                <Button variant="outline" size="sm" className={`w-full justify-start text-xs gap-2 ${seguimientosVencidos.length > 0 ? 'border-red-700 text-red-300 hover:border-red-500' : 'border-gray-600 hover:border-yellow-500 hover:text-yellow-300'}`}>
                  <Bell className="w-3.5 h-3.5" />
                  {seguimientosVencidos.length > 0 ? `${seguimientosVencidos.length} vencidos` : 'Ver seguimientos'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MiniKpi({
  icon, label, value, sub, highlight, danger, href
}: {
  icon: React.ReactNode
  label: string
  value: number
  sub: string
  highlight?: boolean
  danger?: boolean
  href?: string
}) {
  const content = (
    <div className={`bg-gray-900/60 rounded-lg p-3 h-full border ${danger ? 'border-red-700/50' : highlight ? 'border-violet-700/50' : 'border-gray-800'}`}>
      <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{label}</span></div>
      <p className={`text-2xl font-bold ${danger ? 'text-red-400' : highlight ? 'text-violet-300' : 'text-white'}`}>{value}</p>
      <p className={`text-[10px] mt-0.5 ${danger ? 'text-red-400' : 'text-gray-500'}`}>{sub}</p>
    </div>
  )
  if (href) {
    return <Link href={href} className="hover:opacity-80 transition-opacity block h-full">{content}</Link>
  }
  return content
}

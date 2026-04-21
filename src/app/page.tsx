'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { LeadStatusBadge } from '@/components/leads/lead-status-badge'
import { InterestStars } from '@/components/leads/interest-stars'
import { mockDailyMetrics, mockLeads, mockCampaigns, mockActivities } from '@/lib/mock-data'
import {
  MessageSquare, Reply, Calendar, Trophy, Flame, Bell,
  TrendingUp, Target, FileText, Clock, Zap, Play,
  ArrowRight, AlertTriangle, CheckCircle2, Star, ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const today = new Date().toISOString().split('T')[0]

const prospectoCalientes = mockLeads
  .filter((l) => l.interest_level >= 4 && !['won', 'lost'].includes(l.status))
  .sort((a, b) => b.score - a.score)
  .slice(0, 5)

const listosParaSeguir = mockLeads.filter(
  (l) => ['replied', 'interested'].includes(l.status)
).length

const listosParaCerrar = mockLeads.filter(
  (l) => ['meeting', 'proposal'].includes(l.status)
).length

const seguimientosVencidos = mockLeads.filter(
  (l) => l.next_followup_at && l.next_followup_at < today && !['won', 'lost'].includes(l.status)
)

const seguimientosHoy = mockLeads.filter(
  (l) => l.next_followup_at && l.next_followup_at === today && !['won', 'lost'].includes(l.status)
)

const campanasActivas = mockCampaigns.filter((c) => c.status === 'active')

const actividadReciente = [...mockActivities]
  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  .slice(0, 5)

const mejorRubro = (() => {
  const rubros = mockLeads.reduce((acc, l) => {
    if (!acc[l.niche]) acc[l.niche] = { total: 0, won: 0 }
    acc[l.niche].total++
    if (l.status === 'won') acc[l.niche].won++
    return acc
  }, {} as Record<string, { total: number; won: number }>)
  return Object.entries(rubros)
    .filter(([, v]) => v.total > 1)
    .sort((a, b) => (b[1].won / b[1].total) - (a[1].won / a[1].total))[0]
})()

function getMensajeDinamico(pct: number, faltanMensajes: number): { text: string; tone: 'danger' | 'warning' | 'ok' | 'great' } {
  if (pct === 0) return { text: '¡Arrancá el día! Enviá el primer mensaje y poné el motor en marcha.', tone: 'danger' }
  if (pct < 30) return { text: `Hoy estás al ${pct}% de tu meta. Te faltan ${faltanMensajes} mensajes para llegar. ¡Dale, todavía hay tiempo!`, tone: 'danger' }
  if (pct < 60) return { text: `Hoy estás al ${pct}% de tu meta. Te faltan ${faltanMensajes} mensajes. Seguí, vas bien.`, tone: 'warning' }
  if (pct < 100) return { text: `¡Muy bien! Estás al ${pct}%. Solo te faltan ${faltanMensajes} mensajes para cumplir el objetivo.`, tone: 'ok' }
  return { text: '¡Meta cumplida! Superaste el objetivo de mensajes del día. Excelente trabajo.', tone: 'great' }
}

export default function PanelPage() {
  const m = mockDailyMetrics
  const tasaRespuesta = m.messages_sent > 0 ? Math.round((m.responses / m.messages_sent) * 100) : 0
  const progresoMensajes = Math.min(Math.round((m.messages_sent / m.goal_messages) * 100), 100)
  const faltanMensajes = Math.max(m.goal_messages - m.messages_sent, 0)
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
          <span className="text-xs text-violet-300 font-medium">Modo prospección activo</span>
        </div>
      </div>

      {/* === TU FOCO DE HOY === */}
      <Card className="bg-gray-800/60 border-gray-700 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/10 to-transparent pointer-events-none rounded-xl" />
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-400" />
            Tu foco de hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mensaje dinámico */}
          <div className={`flex items-start gap-3 p-3 rounded-lg border mb-4 ${tone.bg}`}>
            {mensaje.tone === 'great'
              ? <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              : mensaje.tone === 'danger'
              ? <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              : <Zap className={`w-4 h-4 mt-0.5 shrink-0 ${tone.text}`} />
            }
            <p className={`text-sm font-medium ${tone.text}`}>{mensaje.text}</p>
          </div>

          {/* Barra de progreso de mensajes */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">Meta diaria de mensajes</span>
              <span className="text-xs font-bold text-white">{m.messages_sent} / {m.goal_messages}</span>
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

          {/* KPIs del día — 4 columnas */}
          <div className="grid grid-cols-4 gap-3">
            <MiniKpi
              icon={<Reply className="w-4 h-4 text-cyan-400" />}
              label="Respuestas hoy"
              value={m.responses}
              sub={`${tasaRespuesta}% tasa`}
              highlight={m.responses > 5}
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
              sub="Interest ≥ 4"
              href="/prospectos"
            />
            <MiniKpi
              icon={<Calendar className="w-4 h-4 text-purple-400" />}
              label="Reuniones agendadas"
              value={m.meetings}
              sub={`Meta: ${m.goal_meetings}`}
              highlight={m.meetings >= m.goal_meetings}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3">
            <MiniKpi
              icon={<FileText className="w-4 h-4 text-orange-400" />}
              label="Propuestas enviadas"
              value={m.proposals}
              sub="Este mes"
            />
            <MiniKpi
              icon={<Trophy className="w-4 h-4 text-yellow-400" />}
              label="Cierres del mes"
              value={m.closes}
              sub="¡Bien!"
              highlight={m.closes > 0}
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

      {listosParaCerrar > 0 && (
        <div className="p-3 bg-green-900/20 border border-green-700/40 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-green-400 shrink-0" />
            <span className="text-sm text-green-300 font-medium">
              Tenés {listosParaCerrar} prospecto{listosParaCerrar > 1 ? 's' : ''} listo{listosParaCerrar > 1 ? 's' : ''} para cerrar — no los dejes enfriar
            </span>
          </div>
          <Link href="/prospectos" className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 font-medium shrink-0">
            Ver prospectos <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* 3 columnas */}
      <div className="grid grid-cols-3 gap-4">
        {/* Prospectos calientes */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Prospectos calientes
              {prospectoCalientes.length > 0 && (
                <span className="ml-auto text-xs bg-orange-500 text-white rounded-full px-1.5 py-0.5 font-bold">{prospectoCalientes.length}</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {prospectoCalientes.map((p) => (
              <Link key={p.id} href={`/prospectos/${p.id}`} className="flex items-center justify-between p-2.5 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors group">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-white truncate">{p.name}</p>
                  <p className="text-xs text-gray-500 truncate">{p.business_name}</p>
                </div>
                <div className="flex items-center gap-1.5 ml-2 shrink-0">
                  <InterestStars level={p.interest_level} />
                  <LeadStatusBadge status={p.status} />
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

        {/* Seguimientos */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <Bell className="w-4 h-4 text-yellow-400" />
              Seguimientos
              {seguimientosPendientes > 0 && (
                <span className="ml-auto text-xs bg-yellow-500 text-black rounded-full px-1.5 py-0.5 font-bold">{seguimientosPendientes}</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {seguimientosVencidos.slice(0, 2).map((p) => (
              <Link key={p.id} href={`/prospectos/${p.id}`} className="flex items-center justify-between p-2.5 bg-red-900/20 border border-red-800/40 rounded-lg hover:bg-red-900/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    <p className="text-xs font-medium text-white truncate">{p.name}</p>
                  </div>
                  <p className="text-xs text-red-400 mt-0.5">Vencido</p>
                </div>
                <LeadStatusBadge status={p.status} />
              </Link>
            ))}
            {seguimientosHoy.slice(0, 3).map((p) => (
              <Link key={p.id} href={`/prospectos/${p.id}`} className="flex items-center justify-between p-2.5 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                    <p className="text-xs font-medium text-white truncate">{p.name}</p>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{p.business_name}</p>
                </div>
                <LeadStatusBadge status={p.status} />
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

        {/* Campañas activas */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
              <Play className="w-4 h-4 text-green-400" /> Campañas activas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {campanasActivas.map((c) => {
              const tasa = c.messages_sent ? Math.round(((c.replies || 0) / c.messages_sent) * 100) : 0
              return (
                <div key={c.id} className="p-2.5 bg-gray-900 rounded-lg">
                  <p className="text-xs font-medium text-white">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.niche}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-400">{c.messages_sent} enviados</span>
                    <span className="text-xs text-green-400">{tasa}% respuesta</span>
                  </div>
                </div>
              )
            })}
            {campanasActivas.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-3">Sin campañas activas</p>
            )}
            <Link href="/campanas" className="flex items-center justify-center gap-1 text-xs text-violet-400 hover:text-violet-300 pt-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Actividad reciente + mejor rubro */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" /> Actividad reciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {actividadReciente.map((act) => {
                const prospecto = mockLeads.find((l) => l.id === act.lead_id)
                const tipoLabel: Record<typeof act.type, string> = {
                  message_sent: 'Mensaje enviado',
                  reply_received: 'Respondió',
                  call: 'Llamada',
                  meeting: 'Reunión',
                  note: 'Nota',
                  status_change: 'Cambio de estado',
                }
                return (
                  <div key={act.id} className="flex items-start gap-3 p-2.5 bg-gray-900 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-300">{tipoLabel[act.type]}</span>
                        {prospecto && (
                          <Link href={`/prospectos/${prospecto.id}`} className="text-xs text-violet-400 hover:text-violet-300 truncate">
                            {prospecto.name}
                          </Link>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{act.description}</p>
                    </div>
                    <span className="text-xs text-gray-600 shrink-0">
                      {format(new Date(act.created_at), 'dd/MM')}
                    </span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {mejorRubro && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Mejor rubro</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-white">{mejorRubro[0]}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {Math.round((mejorRubro[1].won / mejorRubro[1].total) * 100)}% tasa de cierre
                </p>
                <p className="text-xs text-gray-500">{mejorRubro[1].total} prospectos · {mejorRubro[1].won} ganados</p>
                <Link href="/rubros" className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 mt-2">
                  Ver rubros <ArrowRight className="w-3 h-3" />
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/plantillas">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs border-gray-600 hover:border-violet-500 hover:text-violet-300 gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Usar plantilla de mensaje
                </Button>
              </Link>
              <Link href="/prospectos">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs border-gray-600 hover:border-orange-500 hover:text-orange-300 gap-2">
                  <Flame className="w-3.5 h-3.5" /> Ver prospectos calientes
                </Button>
              </Link>
              <Link href="/seguimientos">
                <Button variant="outline" size="sm" className={`w-full justify-start text-xs gap-2 ${seguimientosVencidos.length > 0 ? 'border-red-700 text-red-300 hover:border-red-500' : 'border-gray-600 hover:border-yellow-500 hover:text-yellow-300'}`}>
                  <Bell className="w-3.5 h-3.5" />
                  {seguimientosVencidos.length > 0 ? `${seguimientosVencidos.length} seguimiento${seguimientosVencidos.length > 1 ? 's' : ''} vencido${seguimientosVencidos.length > 1 ? 's' : ''}` : 'Ver seguimientos'}
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
    <div className={`bg-gray-900/60 rounded-lg p-3 h-full ${danger ? 'ring-1 ring-red-700/60' : ''} ${highlight ? 'ring-1 ring-violet-700/60' : ''}`}>
      <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-xs text-gray-400 leading-tight">{label}</span></div>
      <p className={`text-2xl font-bold ${danger ? 'text-red-400' : highlight ? 'text-violet-300' : 'text-white'}`}>{value}</p>
      <p className={`text-xs mt-0.5 ${danger ? 'text-red-400' : 'text-gray-500'}`}>{sub}</p>
    </div>
  )
  if (href) {
    return <Link href={href} className="hover:opacity-80 transition-opacity">{content}</Link>
  }
  return content
}

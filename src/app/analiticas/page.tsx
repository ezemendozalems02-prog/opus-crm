'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell
} from 'recharts'
import { TrendingUp, Users, Trophy, MessageSquare, Percent, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Prospecto, MetricasDiarias, Rubro } from '@/lib/types'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { es } from 'date-fns/locale'

const COLORES = ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#ef4444']

const tooltipStyle = {
  backgroundColor: '#111827',
  border: '1px solid #374151',
  borderRadius: '12px',
  color: '#f9fafb',
  fontSize: '12px',
}

export default function AnaliticasPage() {
  const [prospectos, setProspectos] = useState<Prospecto[]>([])
  const [metricas, setMetricas] = useState<MetricasDiarias[]>([])
  const [rubros, setRubros] = useState<Rubro[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: pData } = await supabase
        .from('prospectos')
        .select('*, rubros(*)')
        .eq('user_id', user.id)
      const { data: mData } = await supabase
        .from('metricas_diarias')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha', { ascending: true })
      const { data: rData } = await supabase
        .from('rubros')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)

      if (pData) setProspectos(pData)
      if (mData) setMetricas(mData)
      if (rData) setRubros(rData)
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <p className="text-gray-400 text-sm">Analizando datos...</p>
      </div>
    )
  }

  const totalProspectos = prospectos.length
  const ganados = prospectos.filter((l) => l.estado === 'Ganado').length
  const activos = prospectos.filter((l) => !['Ganado', 'Perdido', 'Nuevo'].includes(l.estado)).length
  const totalMensajes = metricas.reduce((acc, m) => acc + m.mensajes_enviados, 0)
  const totalRespuestas = metricas.reduce((acc, m) => acc + m.respuestas, 0)
  const tasaRespuesta = totalMensajes > 0 ? Math.round((totalRespuestas / totalMensajes) * 100) : 0
  const tasaCierre = totalProspectos > 0 ? Math.round((ganados / totalProspectos) * 100) : 0

  const porEstado = [
    { nombre: 'Nuevo', valor: prospectos.filter((l) => l.estado === 'Nuevo').length },
    { nombre: 'Contactado', valor: prospectos.filter((l) => l.estado === 'Contactado').length },
    { nombre: 'Respondió', valor: prospectos.filter((l) => l.estado === 'Respondió').length },
    { nombre: 'Interesado', valor: prospectos.filter((l) => l.estado === 'Interesado').length },
    { nombre: 'Reunión', valor: prospectos.filter((l) => l.estado === 'Reunión').length },
    { nombre: 'Propuesta', valor: prospectos.filter((l) => l.estado === 'Propuesta').length },
    { nombre: 'Ganado', valor: prospectos.filter((l) => l.estado === 'Ganado').length },
    { nombre: 'Perdido', valor: prospectos.filter((l) => l.estado === 'Perdido').length },
  ]

  // Data semanal para el chart de barras
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  })

  const weeklyData = last7Days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const m = metricas.find(item => item.fecha === dayStr)
    return {
      day: format(day, 'EEE', { locale: es }),
      mensajes: m?.mensajes_enviados || 0,
      respuestas: m?.respuestas || 0
    }
  })

  // Rendimiento por rubro
  const rubroRendimiento = rubros.map(r => {
    const leadsInRubro = prospectos.filter(p => p.rubro_id === r.id)
    const wonInRubro = leadsInRubro.filter(p => p.estado === 'Ganado').length
    return {
      rubro: r.nombre,
      leads: leadsInRubro.length,
      cierres: wonInRubro,
      tasa: leadsInRubro.length > 0 ? Math.round((wonInRubro / leadsInRubro.length) * 100) : 0
    }
  }).filter(r => r.leads > 0).sort((a, b) => b.tasa - a.tasa)

  return (
    <div className="space-y-6">
      <PageHeader title="Analíticas" description="Seguimiento real de tu rendimiento en la nube" />

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Prospectos', value: totalProspectos, icon: <Users className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-900/10 border-blue-800/30' },
          { label: 'Activos', value: activos, icon: <TrendingUp className="w-4 h-4" />, color: 'text-yellow-400', bg: 'bg-yellow-900/10 border-yellow-800/30' },
          { label: 'Ganados', value: ganados, icon: <Trophy className="w-4 h-4" />, color: 'text-green-400', bg: 'bg-green-900/10 border-green-800/30' },
          { label: 'Tasa Respuesta', value: `${tasaRespuesta}%`, icon: <MessageSquare className="w-4 h-4" />, color: 'text-cyan-400', bg: 'bg-cyan-900/10 border-cyan-800/30' },
          { label: 'Tasa Cierre', value: `${tasaCierre}%`, icon: <Percent className="w-4 h-4" />, color: 'text-violet-400', bg: 'bg-violet-900/10 border-violet-800/30' },
        ].map((kpi) => (
          <Card key={kpi.label} className={`border-0 shadow-xl ${kpi.bg}`}>
            <CardContent className="pt-4 pb-4">
              <div className={`flex items-center gap-1.5 mb-1 ${kpi.color}`}>
                {kpi.icon}
                <span className="text-[10px] uppercase font-bold tracking-widest">{kpi.label}</span>
              </div>
              <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Mensajes y respuestas por día */}
        <Card className="bg-gray-800/40 border-gray-700 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
               <MessageSquare className="w-4 h-4 text-violet-500" />
               Mensajes y respuestas (Últimos 7 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={weeklyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#ffffff08' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '20px' }} />
                <Bar dataKey="mensajes" name="Enviados" fill="#8b5cf6" radius={[4,4,0,0]} />
                <Bar dataKey="respuestas" name="Respuestas" fill="#06b6d4" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución por estado */}
        <Card className="bg-gray-800/40 border-gray-700 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              Embudo de Ventas (Pipeline)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={porEstado} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="nombre" type="category" tick={{ fill: '#f3f4f6', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#ffffff08' }} />
                <Bar dataKey="valor" name="Prospectos" radius={[0,4,4,0]}>
                  {porEstado.map((_, idx) => <Cell key={idx} fill={COLORES[idx % COLORES.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Rendimiento por rubro */}
        <Card className="bg-gray-800/40 border-gray-700 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Tasa de cierre por rubro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-2">
              {rubroRendimiento.length === 0 ? (
                 <p className="text-center py-10 text-gray-500 text-sm italic">Sin datos de cierre por rubro aún</p>
              ) : rubroRendimiento.map((r, idx) => (
                <div key={r.rubro}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORES[idx % COLORES.length] }} />
                      <span className="text-xs font-bold text-gray-200">{r.rubro}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <span>{r.leads} leads</span>
                      <span>{r.cierres} cierres</span>
                      <span className="text-xs font-black" style={{ color: COLORES[idx % COLORES.length] }}>{r.tasa}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-900 border border-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ width: `${r.tasa}%`, backgroundColor: COLORES[idx % COLORES.length] }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Metas vs Realidad (Ejemplo de métricas agregadas) */}
        <Card className="bg-gray-800/40 border-gray-700 shadow-xl overflow-hidden relative">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="w-32 h-32 text-violet-500" />
           </div>
           <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400 font-bold uppercase tracking-widest">Resumen de Actividad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
             <div className="flex items-center justify-between p-4 bg-gray-900/60 rounded-2xl border border-gray-800 shadow-inner">
                <div>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Mensajes Enviados</p>
                   <p className="text-2xl font-black text-white">{totalMensajes}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Respuestas</p>
                   <p className="text-2xl font-black text-cyan-400">{totalRespuestas}</p>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-900/40 rounded-2xl border border-gray-800">
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Reuniones</p>
                   <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-black text-purple-400">{metricas.reduce((acc, m) => acc + m.reuniones, 0)}</p>
                      <span className="text-[10px] text-gray-600 font-bold">AGENDADAS</span>
                   </div>
                </div>
                <div className="p-4 bg-gray-900/40 rounded-2xl border border-gray-800">
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Propuestas</p>
                   <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-black text-orange-400">{metricas.reduce((acc, m) => acc + m.propuestas, 0)}</p>
                      <span className="text-[10px] text-gray-600 font-bold">ENVIADAS</span>
                   </div>
                </div>
             </div>

             <div className="p-4 bg-violet-900/20 border border-violet-800/30 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                   <p className="text-[10px] text-violet-300 font-bold uppercase tracking-widest">Conversión General</p>
                   <span className="text-xs font-black text-violet-300">{tasaCierre}%</span>
                </div>
                <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
                   <div className="h-full bg-violet-500" style={{ width: `${tasaCierre}%` }} />
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

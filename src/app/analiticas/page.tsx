'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockLeads, mockAnalyticsData } from '@/lib/mock-data'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell
} from 'recharts'
import { TrendingUp, Users, Trophy, MessageSquare, Percent } from 'lucide-react'

const COLORES = ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#ef4444']

const tooltipStyle = {
  backgroundColor: '#1f2937',
  border: '1px solid #374151',
  borderRadius: '8px',
  color: '#f9fafb',
  fontSize: '12px',
}

export default function AnaliticasPage() {
  const totalProspectos = mockLeads.length
  const ganados = mockLeads.filter((l) => l.status === 'won').length
  const activos = mockLeads.filter((l) => !['won', 'lost', 'new'].includes(l.status)).length
  const tasaRespuesta = 34
  const tasaCierre = Math.round((ganados / totalProspectos) * 100)

  const porEstado = [
    { nombre: 'Nuevo', valor: mockLeads.filter((l) => l.status === 'new').length },
    { nombre: 'Contactado', valor: mockLeads.filter((l) => l.status === 'contacted').length },
    { nombre: 'Respondió', valor: mockLeads.filter((l) => l.status === 'replied').length },
    { nombre: 'Interesado', valor: mockLeads.filter((l) => l.status === 'interested').length },
    { nombre: 'Reunión', valor: mockLeads.filter((l) => l.status === 'meeting').length },
    { nombre: 'Propuesta', valor: mockLeads.filter((l) => l.status === 'proposal').length },
    { nombre: 'Ganado', valor: mockLeads.filter((l) => l.status === 'won').length },
    { nombre: 'Perdido', valor: mockLeads.filter((l) => l.status === 'lost').length },
  ]

  return (
    <div>
      <PageHeader title="Analíticas" description="Métricas y rendimiento de tu sistema de prospección" />

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Prospectos', value: totalProspectos, icon: <Users className="w-4 h-4" />, color: 'text-blue-400' },
          { label: 'Activos', value: activos, icon: <TrendingUp className="w-4 h-4" />, color: 'text-yellow-400' },
          { label: 'Ganados', value: ganados, icon: <Trophy className="w-4 h-4" />, color: 'text-green-400' },
          { label: 'Tasa de respuesta', value: `${tasaRespuesta}%`, icon: <MessageSquare className="w-4 h-4" />, color: 'text-cyan-400' },
          { label: 'Tasa de cierre', value: `${tasaCierre}%`, icon: <Percent className="w-4 h-4" />, color: 'text-violet-400' },
        ].map((kpi) => (
          <Card key={kpi.label} className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-4 pb-4">
              <div className={`flex items-center gap-1.5 mb-1 ${kpi.color}`}>{kpi.icon}<span className="text-xs text-gray-400">{kpi.label}</span></div>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Mensajes y respuestas por día */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Mensajes y respuestas esta semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={mockAnalyticsData.weekly} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#ffffff08' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                <Bar dataKey="mensajes" name="Mensajes" fill="#8b5cf6" radius={[4,4,0,0]} />
                <Bar dataKey="respuestas" name="Respuestas" fill="#06b6d4" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tendencia mensual */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Tendencia mensual: mensajes y cierres</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={mockAnalyticsData.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="l" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="r" orientation="right" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                <Line yAxisId="l" type="monotone" dataKey="mensajes" name="Mensajes" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
                <Line yAxisId="r" type="monotone" dataKey="cierres" name="Cierres" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Distribución por estado */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Prospectos por estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={porEstado} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="nombre" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={75} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#ffffff08' }} />
                <Bar dataKey="valor" name="Prospectos" radius={[0,4,4,0]}>
                  {porEstado.map((_, idx) => <Cell key={idx} fill={COLORES[idx % COLORES.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rendimiento por rubro */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Tasa de cierre por rubro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-2">
              {mockAnalyticsData.rubroRendimiento.map((r, idx) => (
                <div key={r.rubro}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-300">{r.rubro}</span>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{r.leads} prospectos</span>
                      <span>{r.cierres} cierres</span>
                      <span className="font-bold" style={{ color: COLORES[idx % COLORES.length] }}>{r.tasa}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${r.tasa}%`, backgroundColor: COLORES[idx % COLORES.length] }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                🏆 Mejor rubro: <span className="text-white font-medium">{mockAnalyticsData.rubroRendimiento[0]?.rubro}</span> con {mockAnalyticsData.rubroRendimiento[0]?.tasa}% de tasa de cierre
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

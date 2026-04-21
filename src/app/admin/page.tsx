'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, CreditCard, Clock, Star, AlertTriangle, 
  TrendingUp, ArrowUpRight, ShieldCheck, Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Perfil, Suscripcion, Pago } from '@/lib/types'
import { format, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeAccounts: 0,
    trialAccounts: 0,
    demoAccounts: 0,
    vencidas: 0,
    suspendidas: 0,
    totalRevenue: 0,
    newUsers30d: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchAdminStats() {
      setLoading(true)
      
      // Fetch all profiles
      const { data: profiles } = await supabase.from('perfiles').select('*')
      const { data: pagos } = await supabase.from('pagos').select('monto').eq('estado', 'approved')
      
      if (profiles) {
        const thirtyDaysAgo = subDays(new Date(), 30)
        
        setStats({
          totalUsers: profiles.length,
          activeAccounts: profiles.filter(p => p.estado_cuenta === 'activa').length,
          trialAccounts: profiles.filter(p => p.estado_cuenta === 'trial').length,
          demoAccounts: profiles.filter(p => p.estado_cuenta === 'demo').length,
          vencidas: profiles.filter(p => p.estado_cuenta === 'vencida').length,
          suspendidas: profiles.filter(p => p.estado_cuenta === 'suspendida').length,
          totalRevenue: pagos?.reduce((acc, p) => acc + (p.monto || 0), 0) || 0,
          newUsers30d: profiles.filter(p => new Date(p.created_at) > thirtyDaysAgo).length,
        })
      }
      
      setLoading(false)
    }
    fetchAdminStats()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        <p className="text-gray-400 text-sm">Cargando métricas globales...</p>
      </div>
    )
  }

  const kpis = [
    { label: 'Total Clientes', value: stats.totalUsers, icon: <Users className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-900/10' },
    { label: 'Cuentas Activas', value: stats.activeAccounts, icon: <ShieldCheck className="w-4 h-4" />, color: 'text-green-400', bg: 'bg-green-900/10' },
    { label: 'En Trial', value: stats.trialAccounts, icon: <Clock className="w-4 h-4" />, color: 'text-yellow-400', bg: 'bg-yellow-900/10' },
    { label: 'Demos', value: stats.demoAccounts, icon: <Star className="w-4 h-4" />, color: 'text-purple-400', bg: 'bg-purple-900/10' },
    { label: 'Vencidas/Susp.', value: stats.vencidas + stats.suspendidas, icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-400', bg: 'bg-red-900/10' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
           <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <PageHeader 
          title="Super Admin Dashboard" 
          description="Control global de la plataforma SaaS Opus Prospect" 
        />
      </div>

      <div className="grid grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className={`border-0 shadow-xl ${kpi.bg}`}>
            <CardContent className="pt-4 pb-4">
              <div className={`flex items-center gap-1.5 mb-1 ${kpi.color}`}>
                {kpi.icon}
                <span className="text-[10px] uppercase font-black tracking-widest">{kpi.label}</span>
              </div>
              <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-gray-800/40 border-gray-700 shadow-xl">
           <CardHeader>
              <CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <CreditCard className="w-4 h-4 text-green-500" />
                 Ingresos Totales (ARS)
              </CardTitle>
           </CardHeader>
           <CardContent>
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-black text-white">
                   ${stats.totalRevenue.toLocaleString('es-AR')}
                 </span>
                 <span className="text-green-500 text-xs font-bold flex items-center gap-1">
                   <ArrowUpRight className="w-3 h-3" /> +100%
                 </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">Acumulado histórico de pagos aprobados vía Mercado Pago.</p>
           </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700 shadow-xl">
           <CardHeader>
              <CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <Users className="w-4 h-4 text-blue-500" />
                 Crecimiento (30d)
              </CardTitle>
           </CardHeader>
           <CardContent>
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-black text-white">
                   {stats.newUsers30d}
                 </span>
                 <span className="text-blue-500 text-xs font-bold uppercase tracking-wider">Nuevos Clientes</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">Usuarios registrados en el último mes.</p>
           </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-6">
         <Card className="w-full max-w-lg bg-gray-900 border-red-900/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <ShieldCheck className="w-32 h-32 text-red-500" />
            </div>
            <CardContent className="p-8 text-center space-y-4">
               <h3 className="text-xl font-black text-white uppercase tracking-tight">Gestión de Cuentas</h3>
               <p className="text-gray-400 text-sm">Accedé a la lista completa de clientes para habilitar cuentas, gestionar suscripciones y marcar demostraciones.</p>
               <Button 
                 onClick={() => window.location.href = '/admin/clientes'}
                 className="bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest h-12 px-8 rounded-xl shadow-lg shadow-red-900/30"
               >
                 Gestionar Clientes
               </Button>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}

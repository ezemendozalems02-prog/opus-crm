'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, ShieldAlert, Star, Clock, CheckCircle2, 
  XCircle, MoreVertical, Edit2, ShieldCheck, Zap, 
  Loader2, Trash2, Calendar
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Perfil, AccountStatus } from '@/lib/types'
import { toast } from 'sonner'
import { format, addDays, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<Perfil[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const fetchClientes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setClientes(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchClientes()
  }, [supabase])

  const filtered = clientes.filter(c => 
    c.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  async function updateCliente(id: string, updates: Partial<Perfil>) {
    const { error } = await supabase.from('perfiles').update(updates).eq('id', id)
    if (error) {
      toast.error('Error al actualizar cliente')
    } else {
      toast.success('Cliente actualizado')
      setClientes(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    }
  }

  async function toggleHabilitado(cliente: Perfil) {
    await updateCliente(cliente.id, { habilitado: !cliente.habilitado })
  }

  async function toggleDemo(cliente: Perfil) {
    const newDemo = !cliente.es_demo
    await updateCliente(cliente.id, { 
      es_demo: newDemo, 
      estado_cuenta: newDemo ? 'demo' : 'trial' 
    })
  }

  async function extenderTrial(cliente: Perfil) {
    const currentEnd = cliente.trial_fin ? parseISO(cliente.trial_fin) : new Date()
    const newEnd = addDays(currentEnd, 7).toISOString()
    await updateCliente(cliente.id, { trial_fin: newEnd, estado_cuenta: 'trial' })
  }

  async function activarManualmente(cliente: Perfil) {
    await updateCliente(cliente.id, { estado_cuenta: 'activa' })
  }

  async function marcarVencida(cliente: Perfil) {
    await updateCliente(cliente.id, { estado_cuenta: 'vencida' })
  }

  const getStatusBadge = (status: AccountStatus) => {
    const map: Record<AccountStatus, { label: string, color: string, bg: string }> = {
      activa: { label: 'Activa', color: 'text-green-400', bg: 'bg-green-900/20' },
      trial: { label: 'Trial', color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
      demo: { label: 'Demo', color: 'text-purple-400', bg: 'bg-purple-900/20' },
      vencida: { label: 'Vencida', color: 'text-red-400', bg: 'bg-red-900/20' },
      suspendida: { label: 'Suspendida', color: 'text-gray-400', bg: 'bg-gray-900/20' },
    }
    const s = map[status] || map.trial
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-current ${s.bg} ${s.color}`}>
        {s.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
         <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20 shrink-0">
            <ShieldAlert className="w-6 h-6 text-white" />
         </div>
         <div>
           <h1 className="text-xl sm:text-2xl font-bold text-white">Gestión de Clientes</h1>
           <p className="text-gray-400 text-sm mt-0.5">Control total sobre usuarios y suscripciones</p>
         </div>
      </div>

      <Card className="bg-gray-900 border-gray-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex flex-col sm:flex-row gap-3">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
             <Input
               placeholder="Buscar por nombre o email..."
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="pl-10 bg-gray-800 border-gray-700 text-white"
             />
           </div>
           <Button onClick={fetchClientes} variant="ghost" className="text-gray-500 shrink-0">
             <Zap className="w-4 h-4 mr-2" /> Refrescar
           </Button>
        </div>
        <CardContent className="p-0">
          <p className="text-[10px] text-gray-700 px-4 pt-2 flex items-center gap-1 sm:hidden">
            <span>←</span> Deslizá para ver todas las columnas <span>→</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/50">
                  <th className="text-left py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Cliente</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Estado</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Habilitado</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Registro</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Vence en</th>
                  <th className="text-right py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                   <tr>
                     <td colSpan={6} className="py-20 text-center">
                        <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-2" />
                        <span className="text-gray-500">Cargando clientes...</span>
                     </td>
                   </tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-white group-hover:text-red-400 transition-colors">{c.nombre || 'Sin nombre'}</p>
                        <p className="text-xs text-gray-500">{c.email}</p>
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter mt-0.5">{c.rol}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(c.estado_cuenta)}</td>
                    <td className="py-4 px-6">
                       <button 
                         onClick={() => toggleHabilitado(c)}
                         className={`p-1.5 rounded-lg transition-all ${c.habilitado ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}
                       >
                         {c.habilitado ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                       </button>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-400 text-xs font-medium">{format(parseISO(c.created_at), 'dd/MM/yyyy')}</p>
                    </td>
                    <td className="py-4 px-6">
                      {c.estado_cuenta === 'trial' && c.trial_fin ? (
                        <p className={`text-xs font-bold ${new Date(c.trial_fin) < new Date() ? 'text-red-500' : 'text-yellow-500'}`}>
                           {format(parseISO(c.trial_fin), 'dd/MM/yyyy')}
                        </p>
                      ) : <span className="text-gray-700">---</span>}
                    </td>
                    <td className="py-4 px-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button onClick={() => toggleDemo(c)} className={`p-2 rounded-lg ${c.es_demo ? 'bg-purple-900/40 text-purple-400' : 'bg-gray-800 text-gray-500 hover:text-white'}`} title="Toggle Demo">
                             <Star className="w-4 h-4" />
                          </button>
                          <button onClick={() => extenderTrial(c)} className="p-2 bg-gray-800 text-gray-500 hover:text-yellow-400 rounded-lg" title="Extender Trial +7d">
                             <Clock className="w-4 h-4" />
                          </button>
                          <button onClick={() => activarManualmente(c)} className="p-2 bg-gray-800 text-gray-500 hover:text-green-400 rounded-lg" title="Activar Manual">
                             <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => marcarVencida(c)} className="p-2 bg-gray-800 text-gray-500 hover:text-red-400 rounded-lg" title="Marcar Vencida">
                             <XCircle className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { mockNiches, mockLeads } from '@/lib/mock-data'
import type { Niche } from '@/lib/types'
import { Plus, Users, Trophy, TrendingUp, Lightbulb, Target, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

const COLORES = [
  '#f97316', '#06b6d4', '#ec4899', '#10b981', '#6366f1',
  '#f59e0b', '#8b5cf6', '#14b8a6', '#ef4444', '#84cc16',
]

export default function RubrosPage() {
  const [rubros, setRubros] = useState<Niche[]>(mockNiches)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Niche | null>(rubros[0])
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', color: COLORES[0],
    problema: '', oportunidad: '', tipo_cliente: '', mensaje_sugerido: ''
  })

  function getStats(rubroName: string) {
    const leads = mockLeads.filter((l) => l.niche === rubroName)
    const won = leads.filter((l) => l.status === 'won').length
    const activos = leads.filter((l) => ['interested', 'meeting', 'proposal'].includes(l.status)).length
    const tasa = leads.length > 0 ? Math.round((won / leads.length) * 100) : 0
    return { total: leads.length, won, activos, tasa }
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const nuevo: Niche = { id: String(Date.now()), ...form, created_at: new Date().toISOString() }
    setRubros((prev) => [...prev, nuevo])
    setShowForm(false)
    setForm({ name: '', description: '', color: COLORES[0], problema: '', oportunidad: '', tipo_cliente: '', mensaje_sugerido: '' })
  }

  function copiarMensaje() {
    if (!selected?.mensaje_sugerido) return
    navigator.clipboard.writeText(selected.mensaje_sugerido)
    setCopied(true)
    toast.success('Mensaje copiado al portapapeles')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <PageHeader
        title="Rubros"
        description="Gestioná y analizá el rendimiento por tipo de negocio"
        action={
          <Button onClick={() => setShowForm(true)} className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 mr-2" /> Nuevo rubro
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Lista de rubros */}
        <div className="col-span-1 space-y-2">
          {rubros.map((rubro) => {
            const stats = getStats(rubro.name)
            const isSelected = selected?.id === rubro.id
            return (
              <button
                key={rubro.id}
                onClick={() => setSelected(rubro)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-violet-500 bg-violet-900/20'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ backgroundColor: rubro.color + '25', color: rubro.color }}
                  >
                    {rubro.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{rubro.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-500">{stats.total} prospectos</span>
                      <span className="text-xs font-medium" style={{ color: rubro.color }}>{stats.tasa}% cierre</span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Detalle del rubro */}
        <div className="col-span-2">
          {selected ? (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                {(() => {
                  const stats = getStats(selected.name)
                  return [
                    { label: 'Prospectos', value: stats.total, icon: <Users className="w-4 h-4" />, color: 'text-blue-400' },
                    { label: 'Activos', value: stats.activos, icon: <TrendingUp className="w-4 h-4" />, color: 'text-yellow-400' },
                    { label: 'Ganados', value: stats.won, icon: <Trophy className="w-4 h-4" />, color: 'text-green-400' },
                    { label: 'Tasa cierre', value: `${stats.tasa}%`, icon: <Target className="w-4 h-4" />, color: 'text-violet-400' },
                  ].map((s) => (
                    <Card key={s.label} className="bg-gray-800/50 border-gray-700">
                      <CardContent className="pt-3 pb-3">
                        <div className={`flex items-center gap-1.5 mb-1 ${s.color}`}>{s.icon}<span className="text-xs text-gray-400">{s.label}</span></div>
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      </CardContent>
                    </Card>
                  ))
                })()}
              </div>

              {/* Info del rubro */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
                      style={{ backgroundColor: selected.color + '25', color: selected.color }}>
                      {selected.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-white">{selected.name}</CardTitle>
                      <p className="text-xs text-gray-400">{selected.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900/60 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded bg-red-900/50 flex items-center justify-center">
                          <span className="text-red-400 text-xs">!</span>
                        </div>
                        <p className="text-xs font-medium text-gray-300">Problema común</p>
                      </div>
                      <p className="text-xs text-gray-400">{selected.problema}</p>
                    </div>
                    <div className="bg-gray-900/60 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        <p className="text-xs font-medium text-gray-300">Oportunidad</p>
                      </div>
                      <p className="text-xs text-gray-400">{selected.oportunidad}</p>
                    </div>
                  </div>
                  <div className="bg-gray-900/60 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <p className="text-xs font-medium text-gray-300">Tipo de cliente</p>
                    </div>
                    <p className="text-xs text-gray-400">{selected.tipo_cliente}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Mensaje sugerido */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-gray-400">Mensaje sugerido para primer contacto</CardTitle>
                    <Button variant="ghost" size="sm" onClick={copiarMensaje} className="text-gray-400 hover:text-white">
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans bg-gray-900 rounded-lg p-4 leading-relaxed">
                    {selected.mensaje_sugerido}
                  </pre>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Seleccioná un rubro para ver el detalle
            </div>
          )}
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nuevo rubro</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-gray-300">Nombre *</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-gray-800 border-gray-700" placeholder="ej: Panaderías" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300">Color</Label>
                <div className="flex gap-2 flex-wrap pt-1">
                  {COLORES.map((c) => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                      className={`w-6 h-6 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-white' : ''}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Descripción</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-gray-800 border-gray-700" placeholder="Descripción breve" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Problema común del cliente</Label>
              <Textarea value={form.problema} onChange={(e) => setForm({ ...form, problema: e.target.value })}
                className="bg-gray-800 border-gray-700 resize-none" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Oportunidad</Label>
              <Textarea value={form.oportunidad} onChange={(e) => setForm({ ...form, oportunidad: e.target.value })}
                className="bg-gray-800 border-gray-700 resize-none" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Tipo de cliente</Label>
              <Input value={form.tipo_cliente} onChange={(e) => setForm({ ...form, tipo_cliente: e.target.value })}
                className="bg-gray-800 border-gray-700" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Mensaje sugerido</Label>
              <Textarea value={form.mensaje_sugerido} onChange={(e) => setForm({ ...form, mensaje_sugerido: e.target.value })}
                className="bg-gray-800 border-gray-700 resize-none" rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-gray-700 text-gray-300">Cancelar</Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700">Crear rubro</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

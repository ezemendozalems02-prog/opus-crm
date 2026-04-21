'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { mockCampaigns, mockNiches } from '@/lib/mock-data'
import type { Campaign } from '@/lib/types'
import { Plus, MessageSquare, Reply, Calendar, Trophy, Play, Pause, CheckCircle2 } from 'lucide-react'

const estadoColors: Record<Campaign['status'], string> = {
  active: 'bg-green-900/50 text-green-300 border border-green-700/30',
  paused: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/30',
  completed: 'bg-gray-700 text-gray-300',
}

const estadoLabels: Record<Campaign['status'], string> = {
  active: 'Activa',
  paused: 'Pausada',
  completed: 'Completada',
}

const estadoIcons: Record<Campaign['status'], React.ReactNode> = {
  active: <Play className="w-3 h-3" />,
  paused: <Pause className="w-3 h-3" />,
  completed: <CheckCircle2 className="w-3 h-3" />,
}

export default function CampanasPage() {
  const [campanas, setCampanas] = useState<Campaign[]>(mockCampaigns)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', niche: '', description: '', start_date: '' })

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const nueva: Campaign = {
      id: String(Date.now()),
      ...form,
      status: 'active',
      end_date: null,
      leads_count: 0, messages_sent: 0, replies: 0, meetings: 0, closes: 0,
      created_at: new Date().toISOString(),
    }
    setCampanas((prev) => [nueva, ...prev])
    setShowForm(false)
    setForm({ name: '', niche: '', description: '', start_date: '' })
  }

  const totales = campanas.reduce(
    (acc, c) => ({
      prospectos: acc.prospectos + (c.leads_count || 0),
      mensajes: acc.mensajes + (c.messages_sent || 0),
      respuestas: acc.respuestas + (c.replies || 0),
      cierres: acc.cierres + (c.closes || 0),
    }),
    { prospectos: 0, mensajes: 0, respuestas: 0, cierres: 0 }
  )

  return (
    <div>
      <PageHeader
        title="Campañas"
        description="Seguí el rendimiento de tus campañas por rubro"
        action={
          <Button onClick={() => setShowForm(true)} className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 mr-2" /> Nueva campaña
          </Button>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Prospectos', value: totales.prospectos, icon: <MessageSquare className="w-4 h-4 text-blue-400" /> },
          { label: 'Mensajes', value: totales.mensajes, icon: <MessageSquare className="w-4 h-4 text-cyan-400" /> },
          { label: 'Respuestas', value: totales.respuestas, icon: <Reply className="w-4 h-4 text-green-400" /> },
          { label: 'Cierres', value: totales.cierres, icon: <Trophy className="w-4 h-4 text-yellow-400" /> },
        ].map((m) => (
          <Card key={m.label} className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">{m.icon}<span className="text-xs text-gray-400">{m.label}</span></div>
              <p className="text-2xl font-bold text-white">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {campanas.map((c) => {
          const tasaRespuesta = c.messages_sent ? Math.round(((c.replies || 0) / c.messages_sent) * 100) : 0
          const tasaCierre = c.messages_sent ? Math.round(((c.closes || 0) / c.messages_sent) * 100) : 0

          return (
            <Card key={c.id} className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-base">{c.name}</CardTitle>
                    <p className="text-xs text-gray-400 mt-0.5">{c.niche}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${estadoColors[c.status]}`}>
                    {estadoIcons[c.status]}
                    {estadoLabels[c.status]}
                  </span>
                </div>
                {c.description && <p className="text-xs text-gray-500 mt-1">{c.description}</p>}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 text-center mb-3">
                  {[
                    { label: 'Prospectos', value: c.leads_count },
                    { label: 'Mensajes', value: c.messages_sent },
                    { label: 'Respuestas', value: c.replies },
                    { label: 'Reuniones', value: c.meetings },
                    { label: 'Cierres', value: c.closes },
                  ].map((m) => (
                    <div key={m.label} className="bg-gray-900 rounded-lg p-2">
                      <p className="text-lg font-bold text-white">{m.value || 0}</p>
                      <p className="text-xs text-gray-500">{m.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 pt-3 border-t border-gray-700">
                  <div>
                    <p className="text-sm font-bold text-green-400">{tasaRespuesta}%</p>
                    <p className="text-xs text-gray-500">Tasa respuesta</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-yellow-400">{tasaCierre}%</p>
                    <p className="text-xs text-gray-500">Tasa cierre</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-gray-500">Inicio</p>
                    <p className="text-xs text-gray-400">{c.start_date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader><DialogTitle>Nueva campaña</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-gray-300">Nombre de la campaña *</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-gray-800 border-gray-700" placeholder="ej: Mármoles GBA Norte" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Rubro</Label>
              <Select value={form.niche} onValueChange={(v) => setForm({ ...form, niche: v ?? '' })}>
                <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue placeholder="Seleccioná un rubro" /></SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {mockNiches.map((n) => <SelectItem key={n.id} value={n.name}>{n.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Descripción</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-gray-800 border-gray-700 resize-none" rows={2} placeholder="Objetivo de la campaña..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Fecha de inicio</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="bg-gray-800 border-gray-700" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-gray-700 text-gray-300">Cancelar</Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700">Crear campaña</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { mockTemplates, mockNiches } from '@/lib/mock-data'
import type { MessageTemplate } from '@/lib/types'
import { Plus, Copy, Check, MessageSquare, Search } from 'lucide-react'
import { toast } from 'sonner'

// ——— Config ———

type TipoFilter = MessageTemplate['type'] | 'all'

const TIPO_META: Record<MessageTemplate['type'], { label: string; desc: string; bg: string; text: string; border: string; dot: string }> = {
  initial: {
    label: 'Primer contacto',
    desc: 'Primera impresión — abrí la conversación con curiosidad',
    bg: 'bg-blue-900/30', text: 'text-blue-300', border: 'border-blue-700/50', dot: 'bg-blue-400',
  },
  followup: {
    label: 'Seguimiento',
    desc: 'Recordatorio amable — no respondieron todavía',
    bg: 'bg-yellow-900/30', text: 'text-yellow-300', border: 'border-yellow-700/50', dot: 'bg-yellow-400',
  },
  reenganche: {
    label: 'Reenganche',
    desc: 'Volvé a conectar — pasó un tiempo sin contacto',
    bg: 'bg-orange-900/30', text: 'text-orange-300', border: 'border-orange-700/50', dot: 'bg-orange-400',
  },
  closing: {
    label: 'Cierre',
    desc: 'Pedí el sí — cuando ya mostraron interés',
    bg: 'bg-green-900/30', text: 'text-green-300', border: 'border-green-700/50', dot: 'bg-green-400',
  },
}

const TIPOS: TipoFilter[] = ['all', 'initial', 'followup', 'reenganche', 'closing']

// ——— Page ———

export default function PlantillasPage() {
  const [plantillas, setPlantillas] = useState<MessageTemplate[]>(mockTemplates)
  const [showForm, setShowForm] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [filterTipo, setFilterTipo] = useState<TipoFilter>('all')
  const [filterRubro, setFilterRubro] = useState('all')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', niche: '', type: 'initial' as MessageTemplate['type'], content: '' })

  const rubros = useMemo(() => Array.from(new Set(mockTemplates.map((t) => t.niche).filter(Boolean))).sort(), [])

  const filtered = useMemo(() => plantillas.filter((t) => {
    if (filterTipo !== 'all' && t.type !== filterTipo) return false
    if (filterRubro !== 'all' && t.niche !== filterRubro) return false
    if (search) {
      const q = search.toLowerCase()
      if (!t.name.toLowerCase().includes(q) && !t.content.toLowerCase().includes(q) && !t.niche.toLowerCase().includes(q)) return false
    }
    return true
  }), [plantillas, filterTipo, filterRubro, search])

  // Group filtered by rubro
  const grouped = useMemo(() => {
    const map = new Map<string, MessageTemplate[]>()
    filtered.forEach((t) => {
      const key = t.niche || 'General'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    })
    return map
  }, [filtered])

  function handleCopy(id: string, content: string) {
    navigator.clipboard.writeText(content)
    setCopied(id)
    toast.success('Mensaje copiado — pegalo en WhatsApp o Instagram')
    setTimeout(() => setCopied(null), 2500)
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const nueva: MessageTemplate = { id: String(Date.now()), ...form, created_at: new Date().toISOString() }
    setPlantillas((prev) => [...prev, nueva])
    setShowForm(false)
    setForm({ name: '', niche: '', type: 'initial', content: '' })
    toast.success('Plantilla creada')
  }

  const tipoCount = (tipo: TipoFilter) =>
    tipo === 'all' ? plantillas.length : plantillas.filter((t) => t.type === tipo).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Plantillas de mensajes</h1>
          <p className="text-gray-400 text-sm mt-0.5">40 mensajes listos para copiar — organizados por rubro y etapa</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-violet-600 hover:bg-violet-700 shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Nueva plantilla
        </Button>
      </div>

      {/* Tipo legend cards */}
      <div className="grid grid-cols-4 gap-3">
        {(Object.entries(TIPO_META) as [MessageTemplate['type'], typeof TIPO_META[keyof typeof TIPO_META]][]).map(([tipo, meta]) => (
          <button
            key={tipo}
            onClick={() => setFilterTipo(filterTipo === tipo ? 'all' : tipo)}
            className={`text-left p-3 rounded-xl border transition-all ${
              filterTipo === tipo
                ? `${meta.bg} ${meta.border} ring-1 ring-offset-0 ring-current`
                : 'bg-gray-800/40 border-gray-700 hover:border-gray-500'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${meta.dot}`} />
              <span className={`text-xs font-semibold ${filterTipo === tipo ? meta.text : 'text-gray-300'}`}>{meta.label}</span>
              <span className="ml-auto text-xs text-gray-500 tabular-nums">{tipoCount(tipo)}</span>
            </div>
            <p className="text-xs text-gray-500 leading-tight">{meta.desc}</p>
          </button>
        ))}
      </div>

      {/* Filtros secundarios */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            placeholder="Buscar en plantillas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Rubro:</span>
          <button
            onClick={() => setFilterRubro('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${filterRubro === 'all' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            Todos
          </button>
          {rubros.map((r) => (
            <button
              key={r}
              onClick={() => setFilterRubro(filterRubro === r ? 'all' : r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${filterRubro === r ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
            >
              {r}
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-500 ml-auto shrink-0">{filtered.length} plantillas</span>
      </div>

      {/* Plantillas agrupadas por rubro */}
      {grouped.size === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No hay plantillas para estos filtros</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([rubro, templates]) => (
            <div key={rubro}>
              {/* Rubro header */}
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-bold text-white">{rubro}</h2>
                <div className="h-px flex-1 bg-gray-800" />
                <span className="text-xs text-gray-500">{templates.length} plantilla{templates.length > 1 ? 's' : ''}</span>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-2 gap-3">
                {templates.map((t) => {
                  const meta = TIPO_META[t.type]
                  const charCount = t.content.length
                  const isCopied = copied === t.id

                  return (
                    <div key={t.id} className={`rounded-xl border bg-gray-800/50 overflow-hidden transition-colors hover:border-gray-600 ${meta.border}`}>
                      {/* Card header */}
                      <div className={`flex items-center justify-between px-4 py-2.5 border-b ${meta.bg} ${meta.border}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                          <span className={`text-xs font-semibold ${meta.text}`}>{meta.label}</span>
                          <span className="text-xs text-gray-600">·</span>
                          <span className="text-xs text-gray-400">{rubro}</span>
                        </div>
                        <span className="text-xs text-gray-600">{charCount} car.</span>
                      </div>

                      {/* Message content */}
                      <div className="px-4 py-3">
                        <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">{t.content}</pre>
                      </div>

                      {/* Footer con variables y copy */}
                      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-700/50 bg-gray-900/30">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {extractVars(t.content).map((v) => (
                            <span key={v} className="text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded font-mono">{v}</span>
                          ))}
                        </div>
                        <Button
                          onClick={() => handleCopy(t.id, t.content)}
                          size="sm"
                          className={`h-7 text-xs gap-1.5 shrink-0 transition-all ${
                            isCopied
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-violet-600 hover:bg-violet-700'
                          }`}
                        >
                          {isCopied
                            ? <><Check className="w-3.5 h-3.5" /> Copiado</>
                            : <><Copy className="w-3.5 h-3.5" /> Copiar mensaje</>
                          }
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog nueva plantilla */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva plantilla</DialogTitle>
            <p className="text-sm text-gray-400 mt-1">Usá [Nombre] y [Negocio] como variables — se reemplazan al copiar</p>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-gray-300">Nombre de la plantilla *</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-gray-800 border-gray-700" placeholder="Ej: Restaurantes — Seguimiento 2" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300">Tipo de mensaje</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: (v ?? 'initial') as MessageTemplate['type'] })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {(Object.entries(TIPO_META) as [MessageTemplate['type'], typeof TIPO_META[keyof typeof TIPO_META]][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Rubro (opcional)</Label>
              <Select value={form.niche || 'general'} onValueChange={(v) => setForm({ ...form, niche: (v ?? '') === 'general' ? '' : (v ?? '') })}>
                <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="general">General (todos los rubros)</SelectItem>
                  {mockNiches.map((n) => <SelectItem key={n.id} value={n.name}>{n.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300">Mensaje *</Label>
                <span className="text-xs text-gray-500">{form.content.length} caracteres</span>
              </div>
              <Textarea
                required
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="bg-gray-800 border-gray-700 resize-none text-sm leading-relaxed"
                rows={7}
                placeholder={`Hola [Nombre]! Vi el perfil de [Negocio] y...\n\n¿Ya están trabajando con alguien o manejan todo ustedes?`}
              />
              <p className="text-xs text-gray-500">Variables disponibles: <code className="bg-gray-800 px-1 rounded">[Nombre]</code> <code className="bg-gray-800 px-1 rounded">[Negocio]</code></p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-gray-700 text-gray-300">Cancelar</Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700">Crear plantilla</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Extract [Variable] tokens from message content
function extractVars(content: string): string[] {
  const matches = content.match(/\[[^\]]+\]/g)
  return matches ? Array.from(new Set(matches)) : []
}

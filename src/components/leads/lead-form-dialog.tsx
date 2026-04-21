'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Lead, LeadStatus } from '@/lib/types'
import { mockNiches } from '@/lib/mock-data'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  lead?: Lead
  onSave: (data: Partial<Lead>) => void
}

const defaultForm = {
  name: '', business_name: '', niche: '', city: '', instagram: '',
  whatsapp: '', website: '', status: 'new' as LeadStatus,
  interest_level: 3, score: 50, last_contacted_at: '', next_followup_at: '',
}

const ESTADOS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'Nuevo' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'replied', label: 'Respondió' },
  { value: 'interested', label: 'Interesado' },
  { value: 'meeting', label: 'Reunión' },
  { value: 'proposal', label: 'Propuesta' },
  { value: 'won', label: 'Ganado' },
  { value: 'lost', label: 'Perdido' },
]

export function ProspectoFormDialog({ open, onOpenChange, lead, onSave }: Props) {
  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name,
        business_name: lead.business_name,
        niche: lead.niche,
        city: lead.city,
        instagram: lead.instagram,
        whatsapp: lead.whatsapp,
        website: lead.website,
        status: lead.status,
        interest_level: lead.interest_level,
        score: lead.score,
        last_contacted_at: lead.last_contacted_at || '',
        next_followup_at: lead.next_followup_at || '',
      })
    } else {
      setForm(defaultForm)
    }
  }, [lead, open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      ...form,
      last_contacted_at: form.last_contacted_at || null,
      next_followup_at: form.next_followup_at || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? 'Editar prospecto' : 'Nuevo prospecto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-gray-300">Nombre *</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-gray-800 border-gray-700" placeholder="Nombre del contacto" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Negocio</Label>
              <Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                className="bg-gray-800 border-gray-700" placeholder="Nombre del negocio" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Rubro</Label>
              <Select value={form.niche} onValueChange={(v) => setForm({ ...form, niche: v ?? '' })}>
                <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue placeholder="Seleccionar rubro" /></SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {mockNiches.map((n) => <SelectItem key={n.id} value={n.name}>{n.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Ciudad</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="bg-gray-800 border-gray-700" placeholder="CABA, Pilar, Rosario..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Instagram</Label>
              <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="bg-gray-800 border-gray-700" placeholder="@usuario" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">WhatsApp</Label>
              <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="bg-gray-800 border-gray-700" placeholder="+549111234567" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Sitio web</Label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="bg-gray-800 border-gray-700" placeholder="sitio.com.ar" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: (v ?? 'new') as LeadStatus })}>
                <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {ESTADOS.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Nivel de interés (1-5)</Label>
              <Input type="number" min={1} max={5} value={form.interest_level}
                onChange={(e) => setForm({ ...form, interest_level: Number(e.target.value) })}
                className="bg-gray-800 border-gray-700" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Score (0-100)</Label>
              <Input type="number" min={0} max={100} value={form.score}
                onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
                className="bg-gray-800 border-gray-700" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Último contacto</Label>
              <Input type="date" value={form.last_contacted_at}
                onChange={(e) => setForm({ ...form, last_contacted_at: e.target.value })}
                className="bg-gray-800 border-gray-700" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">Próximo seguimiento</Label>
              <Input type="date" value={form.next_followup_at}
                onChange={(e) => setForm({ ...form, next_followup_at: e.target.value })}
                className="bg-gray-800 border-gray-700" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-gray-700 text-gray-300">Cancelar</Button>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
              {lead ? 'Guardar cambios' : 'Crear prospecto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { ProspectoFormDialog as LeadFormDialog }

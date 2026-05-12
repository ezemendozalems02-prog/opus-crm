import type { Prospecto, LeadStatus } from './types'
import { differenceInDays, parseISO } from 'date-fns'

// ——— Score rules ———

const STATUS_BASE: Partial<Record<LeadStatus, number>> = {
  'Nuevo': 0,
  'Contactado': 0,
  'Respondió': 15,
  'Interesado': 40,
  'Reunión': 70,
  'Propuesta': 100,
  'Ganado': 100,
  'Perdido': 0,
}

export interface ScoreBreakdown {
  base: number
  penalty: number
  total: number
  reasons: { label: string; value: number }[]
}

export function computeScoreBreakdown(lead: Prospecto): ScoreBreakdown {
  const base = STATUS_BASE[lead.estado] ?? 0
  const reasons: { label: string; value: number }[] = []

  if (base > 0 && lead.estado !== 'Ganado') {
    if (lead.estado === 'Respondió') reasons.push({ label: 'Respondió', value: 15 })
    if (['Interesado', 'Reunión', 'Propuesta'].includes(lead.estado)) {
      reasons.push({ label: 'Respondió', value: 15 })
      reasons.push({ label: 'Pidió precio', value: 25 })
    }
    if (['Reunión', 'Propuesta'].includes(lead.estado)) {
      reasons.push({ label: 'Aceptó reunión', value: 30 })
    }
    if (lead.estado === 'Propuesta') {
      reasons.push({ label: 'Pidió propuesta', value: 30 })
    }
  }
  if (lead.estado === 'Ganado') reasons.push({ label: 'Cliente cerrado', value: 100 })

  let penalty = 0
  if (lead.ultimo_contacto && !['Ganado', 'Perdido'].includes(lead.estado)) {
    try {
      const days = differenceInDays(new Date(), parseISO(lead.ultimo_contacto))
      if (days >= 7) {
        penalty = 20
        reasons.push({ label: 'Sin respuesta 7+ días', value: -20 })
      } else if (days >= 3) {
        penalty = 10
        reasons.push({ label: 'Sin respuesta 3+ días', value: -10 })
      }
    } catch {
      // Ignore parse errors
    }
  }

  const total = Math.max(0, Math.min(100, base - penalty))
  return { base, penalty, total, reasons }
}

export function computeScore(lead: Prospecto): number {
  return computeScoreBreakdown(lead).total
}

// ——— Score tiers ———

export type ScoreTier = 'listo' | 'interesado' | 'tibio' | 'frio'

export interface ScoreTierInfo {
  tier: ScoreTier
  label: string
  bg: string
  text: string
  border: string
  barColor: string
  dot: string
}

export function getScoreTier(score: number): ScoreTierInfo {
  if (score >= 80) return {
    tier: 'listo',
    label: 'Listo para cerrar',
    bg: 'bg-green-900/40',
    text: 'text-green-300',
    border: 'border-green-600/60',
    barColor: 'bg-green-500',
    dot: 'bg-green-400',
  }
  if (score >= 60) return {
    tier: 'interesado',
    label: 'Interesado',
    bg: 'bg-yellow-900/30',
    text: 'text-yellow-300',
    border: 'border-yellow-600/50',
    barColor: 'bg-yellow-500',
    dot: 'bg-yellow-400',
  }
  if (score >= 40) return {
    tier: 'tibio',
    label: 'Tibio',
    bg: 'bg-orange-900/30',
    text: 'text-orange-300',
    border: 'border-orange-600/50',
    barColor: 'bg-orange-500',
    dot: 'bg-orange-400',
  }
  return {
    tier: 'frio',
    label: 'Frío',
    bg: 'bg-gray-800/60',
    text: 'text-gray-400',
    border: 'border-gray-600/50',
    barColor: 'bg-gray-500',
    dot: 'bg-gray-500',
  }
}

import type { Lead, LeadStatus } from './types'
import { differenceInDays, parseISO } from 'date-fns'

// ——— Score rules ———

const STATUS_BASE: Partial<Record<LeadStatus, number>> = {
  new: 0,
  contacted: 0,
  replied: 15,        // respondió
  interested: 40,     // respondió (+15) + pidió precio (+25)
  meeting: 70,        // anterior + aceptó reunión (+30)
  proposal: 100,      // anterior + pidió propuesta (+40) → capped 100
  won: 100,
  lost: 0,
}

export interface ScoreBreakdown {
  base: number
  penalty: number
  total: number
  reasons: { label: string; value: number }[]
}

export function computeScoreBreakdown(lead: Lead): ScoreBreakdown {
  const base = STATUS_BASE[lead.status] ?? 0
  const reasons: { label: string; value: number }[] = []

  if (base > 0 && lead.status !== 'won') {
    if (lead.status === 'replied') reasons.push({ label: 'Respondió', value: 15 })
    if (['interested', 'meeting', 'proposal'].includes(lead.status)) {
      reasons.push({ label: 'Respondió', value: 15 })
      reasons.push({ label: 'Pidió precio', value: 25 })
    }
    if (['meeting', 'proposal'].includes(lead.status)) {
      reasons.push({ label: 'Aceptó reunión', value: 30 })
    }
    if (lead.status === 'proposal') {
      reasons.push({ label: 'Pidió propuesta', value: 30 })
    }
  }
  if (lead.status === 'won') reasons.push({ label: 'Cliente cerrado', value: 100 })

  let penalty = 0
  if (lead.last_contacted_at && !['won', 'lost'].includes(lead.status)) {
    const days = differenceInDays(new Date(), parseISO(lead.last_contacted_at))
    if (days >= 7) {
      penalty = 20
      reasons.push({ label: 'Sin respuesta 7+ días', value: -20 })
    } else if (days >= 3) {
      penalty = 10
      reasons.push({ label: 'Sin respuesta 3+ días', value: -10 })
    }
  }

  const total = Math.max(0, Math.min(100, base - penalty))
  return { base, penalty, total, reasons }
}

export function computeScore(lead: Lead): number {
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

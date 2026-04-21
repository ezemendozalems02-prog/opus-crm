export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'replied'
  | 'interested'
  | 'meeting'
  | 'proposal'
  | 'won'
  | 'lost'

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  replied: 'Respondió',
  interested: 'Interesado',
  meeting: 'Reunión',
  proposal: 'Propuesta',
  won: 'Ganado',
  lost: 'Perdido',
}

export interface Lead {
  id: string
  name: string
  business_name: string
  niche: string
  city: string
  instagram: string
  whatsapp: string
  website: string
  status: LeadStatus
  interest_level: number
  score: number
  last_contacted_at: string | null
  next_followup_at: string | null
  created_at: string
  updated_at: string
  notes?: string
}

export interface Activity {
  id: string
  lead_id: string
  type: 'message_sent' | 'reply_received' | 'call' | 'meeting' | 'note' | 'status_change'
  description: string
  created_at: string
}

export interface Note {
  id: string
  lead_id: string
  content: string
  created_at: string
}

export interface Niche {
  id: string
  name: string
  description: string
  color: string
  problema: string
  oportunidad: string
  tipo_cliente: string
  mensaje_sugerido: string
  created_at: string
}

export interface Campaign {
  id: string
  name: string
  niche: string
  description: string
  status: 'active' | 'paused' | 'completed'
  start_date: string
  end_date: string | null
  leads_count?: number
  messages_sent?: number
  replies?: number
  meetings?: number
  closes?: number
  created_at: string
}

export interface CampaignLead {
  id: string
  campaign_id: string
  lead_id: string
  status: string
  created_at: string
}

export interface MessageTemplate {
  id: string
  name: string
  niche: string
  type: 'initial' | 'followup' | 'reenganche' | 'closing'
  content: string
  created_at: string
}

export interface DailyMetrics {
  messages_sent: number
  responses: number
  meetings: number
  closes: number
  proposals: number
  goal_messages: number
  goal_meetings: number
}

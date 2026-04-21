export type LeadStatus =
  | 'Nuevo'
  | 'Contactado'
  | 'Respondió'
  | 'Interesado'
  | 'Reunión'
  | 'Propuesta'
  | 'Ganado'
  | 'Perdido'

export const STATUS_LABELS: Record<LeadStatus, string> = {
  Nuevo: 'Nuevo',
  Contactado: 'Contactado',
  Respondió: 'Respondió',
  Interesado: 'Interesado',
  Reunión: 'Reunión',
  Propuesta: 'Propuesta',
  Ganado: 'Ganado',
  Perdido: 'Perdido',
}

export type UserRole = 'super_admin' | 'cliente'
export type AccountStatus = 'demo' | 'trial' | 'activa' | 'vencida' | 'suspendida'

export interface Perfil {
  id: string
  email: string
  nombre: string
  rol: UserRole
  estado_cuenta: AccountStatus
  habilitado: boolean
  es_demo: boolean
  trial_inicio: string | null
  trial_fin: string | null
  ultimo_acceso: string | null
  created_at: string
}

export interface Suscripcion {
  id: string
  user_id: string
  estado: 'pendiente' | 'trial' | 'activa' | 'vencida' | 'cancelada' | 'suspendida'
  plan: string
  precio: number | null
  moneda: string
  fecha_inicio: string | null
  fecha_fin: string | null
  trial_inicio: string | null
  trial_fin: string | null
  metodo_pago: string | null
  mercado_pago_preference_id: string | null
  mercado_pago_payment_id: string | null
  mercado_pago_status: string | null
  created_at: string
  updated_at: string
}

export interface Pago {
  id: string
  user_id: string
  suscripcion_id: string | null
  proveedor: string
  estado: string
  monto: number
  moneda: string
  external_reference: string | null
  payment_id: string | null
  preference_id: string | null
  detalle: string | null
  created_at: string
}

export interface Rubro {
  id: string
  nombre: string
  descripcion: string | null
  problema_comun: string | null
  oportunidad: string | null
  tipo_cliente: string | null
  mensaje_sugerido: string | null
  created_at: string
}

export interface Prospecto {
  id: string
  user_id: string
  nombre: string
  negocio: string
  rubro_id: string | null
  rubro?: Rubro // Joined rubro
  ciudad: string | null
  instagram: string | null
  whatsapp: string | null
  sitio_web: string | null
  estado: LeadStatus
  nivel_interes: number
  score: number
  ultimo_contacto: string | null
  proximo_seguimiento: string | null
  notas: string | null
  created_at: string
  updated_at: string
}

export interface ActividadProspecto {
  id: string
  prospecto_id: string
  user_id: string
  tipo: 'mensaje_sent' | 'reply_received' | 'call' | 'meeting' | 'note' | 'status_change'
  contenido: string | null
  created_at: string
}

export interface Seguimiento {
  id: string
  prospecto_id: string
  user_id: string
  titulo: string
  descripcion: string | null
  fecha: string
  estado: 'pendiente' | 'completado' | 'cancelado'
  created_at: string
  prospecto?: Prospecto
}

export interface Plantilla {
  id: string
  user_id: string | null
  rubro_id: string | null
  tipo: 'initial' | 'followup' | 'reenganche' | 'closing'
  titulo: string
  contenido: string
  created_at: string
}

export interface Campaña {
  id: string
  user_id: string
  nombre: string
  rubro_id: string | null
  objetivo: string | null
  estado: 'activa' | 'pausada' | 'finalizada'
  created_at: string
  rubro?: Rubro
}

export interface CampañaProspecto {
  id: string
  campaña_id: string
  prospecto_id: string
  created_at: string
}

export interface MetricasDiarias {
  id: string
  user_id: string
  fecha: string
  mensajes_enviados: number
  respuestas: number
  reuniones: number
  propuestas: number
  cierres: number
  created_at: string
}

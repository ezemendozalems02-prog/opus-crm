import { cn } from '@/lib/utils'
import type { LeadStatus } from '@/lib/types'

const statusConfig: Record<LeadStatus, { label: string; classes: string }> = {
  'Nuevo': { label: 'Nuevo', classes: 'bg-gray-700 text-gray-200' },
  'Investigando': { label: 'Investigando', classes: 'bg-amber-900/50 text-amber-300' },
  'Pendiente contacto': { label: 'Pendiente', classes: 'bg-purple-900/50 text-purple-300' },
  'Contactado': { label: 'Contactado', classes: 'bg-blue-900/50 text-blue-300' },
  'Respondió': { label: 'Respondió', classes: 'bg-cyan-900/50 text-cyan-300' },
  'Interesado': { label: 'Interesado', classes: 'bg-yellow-900/50 text-yellow-300' },
  'Cliente potencial fuerte': { label: 'Potencial', classes: 'bg-emerald-900/50 text-emerald-300' },
  'No interesado': { label: 'No interesado', classes: 'bg-gray-800 text-gray-400' },
  'Descartado': { label: 'Descartado', classes: 'bg-red-900/30 text-red-400' },
  'Convertido': { label: 'Convertido', classes: 'bg-indigo-900/50 text-indigo-300' },
  'Reunión': { label: 'Reunión', classes: 'bg-purple-900/50 text-purple-300' },
  'Propuesta': { label: 'Propuesta', classes: 'bg-orange-900/50 text-orange-300' },
  'Ganado': { label: 'Ganado', classes: 'bg-green-900/50 text-green-300' },
  'Perdido': { label: 'Perdido', classes: 'bg-red-900/50 text-red-300' },
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const config = statusConfig[status] ?? { label: status, classes: 'bg-gray-700 text-gray-200' }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', config.classes)}>
      {config.label}
    </span>
  )
}

export { statusConfig }

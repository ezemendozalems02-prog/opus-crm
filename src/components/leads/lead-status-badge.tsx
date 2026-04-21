import { cn } from '@/lib/utils'
import type { LeadStatus } from '@/lib/types'

const statusConfig: Record<LeadStatus, { label: string; classes: string }> = {
  'Nuevo': { label: 'Nuevo', classes: 'bg-gray-700 text-gray-200' },
  'Contactado': { label: 'Contactado', classes: 'bg-blue-900/50 text-blue-300' },
  'Respondió': { label: 'Respondió', classes: 'bg-cyan-900/50 text-cyan-300' },
  'Interesado': { label: 'Interesado', classes: 'bg-yellow-900/50 text-yellow-300' },
  'Reunión': { label: 'Reunión', classes: 'bg-purple-900/50 text-purple-300' },
  'Propuesta': { label: 'Propuesta', classes: 'bg-orange-900/50 text-orange-300' },
  'Ganado': { label: 'Ganado', classes: 'bg-green-900/50 text-green-300' },
  'Perdido': { label: 'Perdido', classes: 'bg-red-900/50 text-red-300' },
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const config = statusConfig[status]
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', config.classes)}>
      {config.label}
    </span>
  )
}

export { statusConfig }

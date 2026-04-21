import { computeScore, getScoreTier } from '@/lib/score'
import type { Lead } from '@/lib/types'

interface Props {
  lead: Lead
  showLabel?: boolean
  showBar?: boolean
  size?: 'sm' | 'md'
}

export function ScoreBadge({ lead, showLabel = true, showBar = false, size = 'sm' }: Props) {
  const score = computeScore(lead)
  const tier = getScoreTier(score)

  return (
    <div className="flex items-center gap-2">
      {/* Badge */}
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border px-2 py-0.5 ${tier.bg} ${tier.text} ${tier.border} ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tier.dot}`} />
        {showLabel ? tier.label : score}
      </span>

      {/* Optional score number */}
      {showLabel && (
        <span className={`font-bold tabular-nums ${tier.text} ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {score}
        </span>
      )}

      {/* Optional progress bar */}
      {showBar && (
        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${tier.barColor}`} style={{ width: `${score}%` }} />
        </div>
      )}
    </div>
  )
}

// Compact version: just the number with color, for tight spaces like Kanban
export function ScoreChip({ lead }: { lead: Lead }) {
  const score = computeScore(lead)
  const tier = getScoreTier(score)
  return (
    <span className={`text-xs font-bold tabular-nums px-1.5 py-0.5 rounded ${tier.bg} ${tier.text} border ${tier.border}`}>
      {score}
    </span>
  )
}

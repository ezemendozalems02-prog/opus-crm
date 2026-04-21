import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function InterestStars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn('w-3 h-3', i <= level ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600')}
        />
      ))}
    </div>
  )
}

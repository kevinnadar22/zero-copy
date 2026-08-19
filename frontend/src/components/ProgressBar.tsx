import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import type { ProgressMessage } from '@/lib/types'
import { formatCompact } from '@/lib/format'

export function ProgressBar({ progress }: { progress: ProgressMessage | null }) {
  if (!progress) return null
  const pct = (progress.processed / progress.total) * 100

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm font-semibold text-foreground">Processing Records</span>
        </div>
        <span className="font-mono font-bold text-foreground text-sm">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-2 font-mono">
        <span>{formatCompact(progress.processed)} records</span>
        <span>{formatCompact(progress.total)} total</span>
      </div>
    </div>
  )
}

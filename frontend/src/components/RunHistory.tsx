import { History } from 'lucide-react'
import { useState } from 'react'
import type { RunRecord } from '@/lib/types'
import { formatCompact } from '@/lib/format'
import { SCHEMAS, type SchemaName } from '@/lib/types'

interface Props {
  history: RunRecord[]
  onRestore: (record: RunRecord) => void
}

export function RunHistory({ history, onRestore }: Props) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border-t border-border pt-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground w-full cursor-pointer transition-colors"
      >
        <History className="w-3.5 h-3.5" />
        Previous Runs
        <span className="ml-auto text-[10px] font-mono bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
          {history.length}
        </span>
        <span className="text-[10px]">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="mt-3 flex flex-col gap-1.5">
          {history.map((r) => (
            <button
              key={r.id}
              onClick={() => onRestore(r)}
              className="text-left rounded-lg bg-card border border-border px-3 py-2 hover:bg-accent transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-foreground">
                  {SCHEMAS[r.schema as SchemaName]?.name ?? r.schema}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {formatCompact(r.count)}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {new Date(r.timestamp).toLocaleTimeString()}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

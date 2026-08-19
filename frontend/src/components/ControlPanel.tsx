import { Play, Loader2, Check, Link } from 'lucide-react'
import { useState, useEffect } from 'react'
import { SchemaCard } from './SchemaCard'
import { ScaleSelector } from './ScaleSelector'
import { RunHistory } from './RunHistory'
import { SCHEMAS } from '@/lib/types'
import type { BenchmarkState, SchemaName, RunRecord } from '@/lib/types'

interface Props {
  state: BenchmarkState
  history: RunRecord[]
  onRun: (schema: SchemaName, count: number) => void
  onRestore: (record: RunRecord) => void
  centered?: boolean
}

export function ControlPanel({ state, history, onRun, onRestore, centered }: Props) {
  const githubUrl = 'https://github.com/kevinnadar22/zero-copy.git'
  const [schema, setSchema] = useState<SchemaName>('user')
  const [count, setCount] = useState(100_000)
  const running = state === 'running' || state === 'connecting'

  const [showDone, setShowDone] = useState(false)
  useEffect(() => {
    if (state === 'done') {
      setShowDone(true)
      const t = setTimeout(() => setShowDone(false), 1500)
      return () => clearTimeout(t)
    }
  }, [state])

  const handleRun = () => {
    if (!running) onRun(schema, count)
  }

  return (
    <div
      className={`flex flex-col gap-6 ${
        !centered
          ? 'w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-border bg-sidebar p-4 md:p-6 overflow-y-auto max-h-[42vh] md:max-h-full'
          : ''
      }`}
    >
      {!centered && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Schema</p>
          <div className="flex flex-col gap-2">
            {(Object.keys(SCHEMAS) as SchemaName[]).map((key) => (
              <SchemaCard key={key} schemaKey={key} selected={schema === key} onClick={() => setSchema(key)} />
            ))}
          </div>
        </>
      )}

      <ScaleSelector value={count} onChange={setCount} disabled={running} large={centered} />

      <button
        onClick={handleRun}
        disabled={running}
        className={`w-full rounded-lg font-bold text-primary-foreground flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer ${
          centered ? 'py-4 text-lg' : 'py-3 text-sm'
        } ${
          running
            ? 'bg-primary/50 cursor-not-allowed'
            : showDone
            ? 'bg-green-600'
            : 'bg-primary hover:bg-primary/90 active:scale-[0.98] shadow-sm'
        }`}
      >
        {running ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Simulating...
          </>
        ) : showDone ? (
          <>
            <Check className="w-5 h-5" />
            Complete
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            Run Simulation
          </>
        )}
      </button>

      {!centered && history.length > 0 && <RunHistory history={history} onRestore={onRestore} />}

      {!centered && (
        <div className="mt-auto border-t border-border pt-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground/90">Neural Society</p>
          <p className="mt-1">Zero-Copy Binary API Gateway</p>
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 underline decoration-dotted underline-offset-4 hover:text-foreground transition-colors"
          >
            <Link className="w-3.5 h-3.5" />
            GitHub
          </a>
        </div>
      )}
    </div>
  )
}

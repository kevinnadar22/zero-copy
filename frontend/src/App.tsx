import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ControlPanel } from './components/ControlPanel'
import { ChartGrid } from './components/ChartGrid'
import { SummaryTable } from './components/SummaryTable'
import { useBenchmark } from './hooks/useBenchmark'
import type { SchemaName } from './lib/types'
import { Binary, Link } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

const GITHUB_URL = 'https://github.com/kevinnadar22/zero-copy.git'

export default function App() {
  const { state, progress, result, error, history, run, restoreRun } = useBenchmark()
  const [hasRun, setHasRun] = useState(false)

  const handleRun = useCallback(
    (schema: SchemaName, count: number) => {
      setHasRun(true)
      run(schema, count)
    },
    [run],
  )

  const handleRestore = useCallback(
    (record: Parameters<typeof restoreRun>[0]) => {
      setHasRun(true)
      restoreRun(record)
    },
    [restoreRun],
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter' && state !== 'running') {
        handleRun('user', 10_000)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state, handleRun])

  const prevState = useRef(state)
  useEffect(() => {
    if (prevState.current === 'running' && state === 'done' && result) {
      const capnpFaster = result.capnp.ser_duration + result.capnp.deser_duration <
        result.json.ser_duration + result.json.deser_duration
      const winner = capnpFaster ? "Cap'n Proto" : 'JSON'
      const ratio = capnpFaster
        ? ((result.json.ser_duration + result.json.deser_duration) / (result.capnp.ser_duration + result.capnp.deser_duration)).toFixed(1)
        : ((result.capnp.ser_duration + result.capnp.deser_duration) / (result.json.ser_duration + result.json.deser_duration)).toFixed(1)
      toast.success('Simulation Complete', {
        description: `${winner} wins — ${ratio}× faster overall`,
      })
    }
    prevState.current = state
  }, [state, result])

  const liveMetrics = progress ?? result
  const capnpMetrics = liveMetrics?.capnp ?? null
  const jsonMetrics = liveMetrics?.json ?? null
  const isRunning = state === 'running' || state === 'connecting'

  return (
    <div className="h-dvh bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {!hasRun ? (
          <motion.div
            key="hero"
            className="h-full overflow-y-auto flex flex-col items-center justify-start sm:justify-center px-4 sm:px-6 py-8"
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            <div className="w-full max-w-xl">
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-6"
                >
                  <Binary className="w-8 h-8 text-primary-foreground" />
                </motion.div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="text-3xl sm:text-5xl font-black tracking-tight text-foreground mb-4"
                >
                  Binary vs JSON
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto leading-relaxed"
                >
                  See how Cap'n Proto's zero-copy serialization compares to JSON at scale
                </motion.p>
              </div>
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                <ControlPanel
                  state={state}
                  history={history}
                  onRun={handleRun}
                  onRestore={handleRestore}
                  centered
                />
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center text-xs text-muted-foreground mt-8 flex items-center justify-center gap-2"
              >
                Press{' '}
                <kbd className="px-2 py-0.5 rounded-md bg-secondary border border-border text-secondary-foreground text-[10px] font-mono">
                  Ctrl+Enter
                </kbd>{' '}
                to quick-start
              </motion.p>
              <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.75 }}
                className="mt-6 text-center text-xs text-muted-foreground"
              >
                <p className="font-medium text-foreground/90">Neural Society</p>
                <p className="mt-1">Zero-Copy Binary API Gateway</p>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 underline decoration-dotted underline-offset-4 hover:text-foreground transition-colors"
                >
                  <Link className="w-3.5 h-3.5" />
                  GitHub
                </a>
              </motion.footer>
            </div>
          </motion.div>
        ) : (
          <div key="workspace" className="h-full flex flex-col md:flex-row">
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className="shrink-0 w-full md:w-auto"
            >
              <ControlPanel
                state={state}
                history={history}
                onRun={handleRun}
                onRestore={handleRestore}
              />
            </motion.div>

            <motion.main
              className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            >
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              <ChartGrid capnp={capnpMetrics} json={jsonMetrics} loading={isRunning} progress={progress} />

              {result && <SummaryTable result={result} />}
            </motion.main>
          </div>
        )}
      </AnimatePresence>
      <Toaster theme="dark" position="bottom-right" richColors />
    </div>
  )
}

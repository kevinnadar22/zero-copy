import { useState, useCallback } from 'react'
import type {
  BenchmarkState,
  WsMessage,
  ProgressMessage,
  ResultMessage,
  RunRecord,
  SchemaName,
} from '../lib/types'
import { useWebSocket } from './useWebSocket'

export function useBenchmark() {
  const [state, setState] = useState<BenchmarkState>('idle')
  const [progress, setProgress] = useState<ProgressMessage | null>(null)
  const [result, setResult] = useState<ResultMessage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<RunRecord[]>([])

  const onMessage = useCallback((msg: WsMessage) => {
    switch (msg.type) {
      case 'started':
        setState('running')
        setProgress(null)
        setResult(null)
        setError(null)
        break
      case 'progress':
        setProgress(msg)
        break
      case 'result':
        setState('done')
        setResult(msg)
        setProgress(null)
        setHistory((prev) => [
          {
            id: crypto.randomUUID(),
            schema: msg.schema,
            count: msg.count,
            timestamp: Date.now(),
            result: msg,
          },
          ...prev.slice(0, 4),
        ])
        break
      case 'error':
        setState('error')
        setError(msg.message)
        break
    }
  }, [])

  const { connected, send } = useWebSocket(onMessage)

  const run = useCallback(
    (schema: SchemaName, count: number) => {
      setState('connecting')
      setError(null)
      send({ schema, count })
    },
    [send],
  )

  const restoreRun = useCallback((record: RunRecord) => {
    setResult(record.result)
    setProgress(null)
    setState('done')
  }, [])

  return { state, progress, result, error, connected, history, run, restoreRun }
}

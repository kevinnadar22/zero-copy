export interface FormatMetrics {
  ser_duration: number
  deser_duration: number
  ser_cpu: number
  deser_cpu: number
  total_bytes: number
  ser_throughput: number
  deser_throughput: number
  avg_msg_bytes?: number
}

export interface ProgressMessage {
  type: 'progress'
  processed: number
  total: number
  capnp: FormatMetrics
  json: FormatMetrics
}

export interface ResultMessage {
  type: 'result'
  schema: string
  count: number
  capnp: FormatMetrics
  json: FormatMetrics
}

export interface StartedMessage {
  type: 'started'
  schema: string
  count: number
}

export interface ErrorMessage {
  type: 'error'
  message: string
}

export type WsMessage = ProgressMessage | ResultMessage | StartedMessage | ErrorMessage

export type BenchmarkState = 'idle' | 'connecting' | 'running' | 'done' | 'error'

export interface RunRecord {
  id: string
  schema: string
  count: number
  timestamp: number
  result: ResultMessage
}

export const SCALE_OPTIONS = [
  { label: '10K', value: 10_000 },
  { label: '100K', value: 100_000 },
  { label: '1M', value: 1_000_000 },
  { label: '10M', value: 10_000_000 },
  { label: '100M', value: 100_000_000 },
  { label: '1B', value: 1_000_000_000 },
] as const

export const SCHEMAS = {
  user: {
    name: 'User',
    fields: ['id', 'name', 'email', 'age', 'isActive', 'balance', 'address', 'phone'],
  },
  logEntry: {
    name: 'LogEntry',
    fields: ['timestamp', 'level', 'service', 'message', 'traceId', 'metadata'],
  },
} as const

export type SchemaName = keyof typeof SCHEMAS

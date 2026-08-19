import type { ResultMessage } from '@/lib/types'
import { formatDuration, formatCompact, formatBytes } from '@/lib/format'
import { motion } from 'framer-motion'

export function SummaryTable({ result }: { result: ResultMessage }) {
  const { capnp, json: js } = result

  const rows = [
    row('Serialize Time', capnp.ser_duration, js.ser_duration, formatDuration, 'lower'),
    row('Deserialize Time', capnp.deser_duration, js.deser_duration, formatDuration, 'lower'),
    row('Serialize CPU', capnp.ser_cpu, js.ser_cpu, formatDuration, 'lower'),
    row('Deserialize CPU', capnp.deser_cpu, js.deser_cpu, formatDuration, 'lower'),
    row('Serialize Throughput', capnp.ser_throughput, js.ser_throughput, formatCompact, 'higher'),
    row('Deserialize Throughput', capnp.deser_throughput, js.deser_throughput, formatCompact, 'higher'),
    row('Avg Message Size', capnp.avg_msg_bytes ?? 0, js.avg_msg_bytes ?? 0, (v) => formatBytes(v), 'lower'),
    row('Total Bytes', capnp.total_bytes, js.total_bytes, formatBytes, 'lower'),
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-lg border border-border bg-card shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-base font-bold text-foreground">Comparison Summary</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {formatCompact(result.count)} {result.schema} records
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground text-xs border-b border-border">
              <th className="px-5 py-3 font-medium">Metric</th>
              <th className="px-5 py-3 font-medium">Cap'n Proto</th>
              <th className="px-5 py-3 font-medium">JSON</th>
              <th className="px-5 py-3 font-medium">Winner</th>
              <th className="px-5 py-3 font-medium text-right">Factor</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.label}
                className={`border-b border-border/50 hover:bg-accent/30 transition-colors ${
                  i % 2 === 0 ? 'bg-muted/20' : ''
                }`}
              >
                <td className="px-5 py-3 text-foreground font-medium">{r.label}</td>
                <td className="px-5 py-3 font-mono text-foreground">{r.capnp}</td>
                <td className="px-5 py-3 font-mono text-foreground">{r.json}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      r.winner === 'capnp'
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {r.winner === 'capnp' ? "Cap'n Proto" : 'JSON'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-mono font-bold text-primary">
                  {r.diff}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

function row(
  label: string,
  capnpVal: number,
  jsonVal: number,
  fmt: (v: number) => string,
  betterIs: 'lower' | 'higher',
) {
  const winner =
    betterIs === 'lower'
      ? capnpVal <= jsonVal ? 'capnp' as const : 'json' as const
      : capnpVal >= jsonVal ? 'capnp' as const : 'json' as const

  const hi = Math.max(capnpVal, jsonVal)
  const lo = Math.min(capnpVal, jsonVal)
  const ratio = lo > 0 ? hi / lo : 0
  const diff = isFinite(ratio) && ratio > 0 ? `${ratio.toFixed(1)}x` : '—'

  return { label, capnp: fmt(capnpVal), json: fmt(jsonVal), winner, diff }
}

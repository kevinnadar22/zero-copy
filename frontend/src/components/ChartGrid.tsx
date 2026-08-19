import { BenchmarkChart } from './BenchmarkChart'
import { ProgressBar } from './ProgressBar'
import { Card, CardContent } from '@/components/ui/card'
import { Cpu, Gauge, BarChart3 } from 'lucide-react'
import { formatDuration, formatCompact } from '@/lib/format'
import type { FormatMetrics, ProgressMessage } from '@/lib/types'

interface Props {
  capnp: FormatMetrics | null
  json: FormatMetrics | null
  loading?: boolean
  progress?: ProgressMessage | null
}

function EmptyChart({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <Card className="h-[280px]">
      <CardContent className="h-full flex flex-col items-center justify-center gap-3">
        {icon}
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">Awaiting simulation</p>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingChart({ title, icon, progress }: { title: string; icon: React.ReactNode; progress?: ProgressMessage | null }) {
  return (
    <Card className="h-[280px]">
      <CardContent className="h-full flex flex-col items-center justify-center gap-4 px-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <p className="text-sm font-medium">{title}</p>
        </div>
        <div className="w-full">
          {progress ? (
            <ProgressBar progress={progress} />
          ) : (
            <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-primary/40 rounded-full animate-pulse w-2/3" />
            </div>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground/60">Running...</p>
      </CardContent>
    </Card>
  )
}

const ICONS = {
  cpu: <Cpu className="w-5 h-5 text-amber-400" />,
  throughput: <Gauge className="w-5 h-5 text-green-400" />,
}

export function ChartGrid({ capnp, json, loading, progress }: Props) {
  const hasData = capnp && json
  const remaining = progress ? Math.max(progress.total - progress.processed, 0) : 0

  if (!hasData && loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LoadingChart title="CPU Time" icon={ICONS.cpu} progress={progress} />
        <LoadingChart title="Throughput" icon={ICONS.throughput} progress={progress} />
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EmptyChart title="CPU Time" icon={<BarChart3 className="w-10 h-10 text-muted-foreground/20" />} />
        <EmptyChart title="Throughput" icon={<BarChart3 className="w-10 h-10 text-muted-foreground/20" />} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BenchmarkChart title="CPU Time" description="Lower is better. Measures compute effort used by the process, independent of waiting." icon={ICONS.cpu} winnerIs="lower" data={[
          { name: 'Deserialize', capnp: capnp.deser_cpu, json: json.deser_cpu },
          { name: 'Serialize', capnp: capnp.ser_cpu, json: json.ser_cpu },
        ]} yLabel="sec" formatValue={formatDuration} />
        <BenchmarkChart title="Throughput" description="Higher is better. Tells how many records each format can process every second." icon={ICONS.throughput} winnerIs="higher" data={[
          { name: 'Deserialize', capnp: capnp.deser_throughput, json: json.deser_throughput },
          { name: 'Serialize', capnp: capnp.ser_throughput, json: json.ser_throughput },
        ]} yLabel="req/s" formatValue={formatCompact} yTickFormat={formatCompact} />
      </div>
      {loading && progress && (
        <div className="rounded-lg border border-border bg-card/60 px-4 py-2 text-sm text-muted-foreground">
          Remaining records: <span className="font-semibold text-foreground">{formatCompact(remaining)}</span>
          <span className="mx-2 text-muted-foreground/60">•</span>
          Processed: <span className="font-semibold text-foreground">{formatCompact(progress.processed)}</span> / {formatCompact(progress.total)}
        </div>
      )}
    </div>
  )
}

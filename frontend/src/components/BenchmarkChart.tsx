import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, LabelList } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import type { ReactNode } from 'react'

interface BarDatum {
  name: string
  capnp: number
  json: number
}

interface Props {
  title: string
  subtitle?: string
  description?: string
  icon: ReactNode
  data: BarDatum[]
  yLabel: string
  formatValue?: (v: number) => string
  yTickFormat?: (v: number) => string
  singleBar?: boolean
  winnerIs?: 'lower' | 'higher'
}

const CAPNP_COLOR = 'var(--chart-3)'
const JSON_COLOR = 'var(--chart-2)'

const pairedConfig: ChartConfig = {
  capnp: { label: "Cap'n Proto", color: 'var(--chart-3)' },
  json: { label: 'JSON', color: 'var(--chart-2)' },
}

const singleConfig: ChartConfig = {
  value: { label: 'Value' },
}

function BarNameLabel({
  x,
  y,
  width,
  height,
  value,
  name,
}: {
  x: number
  y: number
  width: number
  height: number
  value: number
  name: string
}) {
  if (!value || height < 20) return null
  return (
    <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight={700} fill="white" opacity={0.85}>
      {name}
    </text>
  )
}

function getWinner(data: BarDatum[], betterIs: 'lower' | 'higher'): string | null {
  const capnpTotal = data.reduce((s, d) => s + d.capnp, 0)
  const jsonTotal = data.reduce((s, d) => s + d.json, 0)
  if (capnpTotal === 0 && jsonTotal === 0) return null
  if (betterIs === 'lower') return capnpTotal <= jsonTotal ? "Cap'n Proto" : 'JSON'
  return capnpTotal >= jsonTotal ? "Cap'n Proto" : 'JSON'
}

export function BenchmarkChart({
  title,
  subtitle,
  description,
  icon,
  data,
  yLabel,
  formatValue,
  yTickFormat,
  singleBar,
  winnerIs,
}: Props) {
  const fmt = formatValue ?? ((v: number) => v.toLocaleString())
  const yFmt = yTickFormat ?? ((v: number) => v.toLocaleString())
  const winner = winnerIs ? getWinner(data, winnerIs) : null
  const maxPairedValue = data.reduce((m, d) => Math.max(m, d.capnp, d.json), 0)
  const pairedDomainMax = maxPairedValue > 0 ? maxPairedValue * 1.12 : 1

  if (singleBar) {
    const items = data.map((d) => ({
      name: d.name,
      value: d.name === "Cap'n Proto" ? d.capnp : d.json,
      fill: d.name === "Cap'n Proto" ? CAPNP_COLOR : JSON_COLOR,
    }))

    const sizeWinner = items[0].value <= items[1].value ? items[0].name : items[1].name
    const maxSingleValue = items.reduce((m, d) => Math.max(m, d.value), 0)
    const singleDomainMax = maxSingleValue > 0 ? maxSingleValue * 1.12 : 1

    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {icon}
              <div className="min-w-0">
                <CardTitle className="text-base">{title}</CardTitle>
                {subtitle && <CardDescription className="text-xs">{subtitle}</CardDescription>}
                {description && <p className="text-[11px] text-muted-foreground/80 mt-1">{description}</p>}
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-accent text-accent-foreground inline-flex items-center gap-1 whitespace-nowrap leading-none">
              <Trophy className="w-3 h-3" />
              {sizeWinner}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={singleConfig} className="h-[200px] sm:h-[220px] w-full">
            <BarChart data={items} barSize={64} layout="horizontal" margin={{ top: 22, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={13} fontWeight={600} tick={{ fill: 'var(--foreground)' }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tick={{ fill: 'var(--muted-foreground)' }}
                tickFormatter={(v: number) => yFmt(Number(v))}
                domain={[0, singleDomainMax]}
                allowDataOverflow
              />
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => fmt(Number(value))} />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={800}>
                <LabelList dataKey="value" position="top" offset={8} fontSize={12} fontWeight={700} fill="var(--foreground)" formatter={(v: unknown) => fmt(Number(v))} />
                {items.map((item, i) => (
                  <Cell key={i} fill={item.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon}
            <div className="min-w-0">
              <CardTitle className="text-base">{title}</CardTitle>
              {subtitle && <CardDescription className="text-xs">{subtitle}</CardDescription>}
              {description && <p className="text-[11px] text-muted-foreground/80 mt-1">{description}</p>}
            </div>
          </div>
          {winner && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-accent text-accent-foreground inline-flex items-center gap-1 whitespace-nowrap leading-none">
              <Trophy className="w-3 h-3" />
              {winner}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={pairedConfig} className="h-[200px] sm:h-[220px] w-full">
          <BarChart data={data} barGap={6} margin={{ top: 22, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={13} fontWeight={600} tick={{ fill: 'var(--foreground)' }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tick={{ fill: 'var(--muted-foreground)' }}
              tickFormatter={(v: number) => yFmt(Number(v))}
              domain={[0, pairedDomainMax]}
              allowDataOverflow
              label={{ value: yLabel, angle: -90, position: 'insideLeft', fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <ChartTooltip content={<ChartTooltipContent formatter={(value) => fmt(Number(value))} />} />
            <Bar dataKey="capnp" name="Cap'n Proto" fill={CAPNP_COLOR} radius={[8, 8, 0, 0]} animationDuration={800}>
              <LabelList dataKey="capnp" position="top" offset={8} fontSize={11} fontWeight={600} fill="var(--chart-3)" formatter={(v: unknown) => fmt(Number(v))} />
              <LabelList
                content={((props: any) => (
                  <BarNameLabel
                    x={props.x} y={props.y}
                    width={props.width} height={props.height}
                    value={props.value} name="Cap'n Proto"
                  />
                )) as any}
              />
            </Bar>
            <Bar dataKey="json" name="JSON" fill={JSON_COLOR} radius={[8, 8, 0, 0]} animationDuration={800}>
              <LabelList dataKey="json" position="top" offset={8} fontSize={11} fontWeight={600} fill="var(--chart-2)" formatter={(v: unknown) => fmt(Number(v))} />
              <LabelList
                content={((props: any) => (
                  <BarNameLabel
                    x={props.x} y={props.y}
                    width={props.width} height={props.height}
                    value={props.value} name="JSON"
                  />
                )) as any}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--chart-3)' }} />
            Cap'n Proto
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--chart-2)' }} />
            JSON
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

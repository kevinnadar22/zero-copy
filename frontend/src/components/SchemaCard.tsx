import { Database, FileText } from 'lucide-react'
import type { SchemaName } from '@/lib/types'
import { SCHEMAS } from '@/lib/types'

const ICONS: Record<SchemaName, typeof Database> = {
  user: Database,
  logEntry: FileText,
}

const DESCRIPTIONS: Record<SchemaName, string> = {
  user: '8 fields — id, name, email, age, balance...',
  logEntry: '6 fields — timestamp, level, service, message...',
}

interface Props {
  schemaKey: SchemaName
  selected: boolean
  onClick: () => void
  large?: boolean
}

export function SchemaCard({ schemaKey, selected, onClick, large }: Props) {
  const schema = SCHEMAS[schemaKey]
  const Icon = ICONS[schemaKey]

  return (
    <button
      onClick={onClick}
      className={`text-left rounded-lg border transition-all duration-200 cursor-pointer ${
        large ? 'p-5' : 'p-4'
      } ${
        selected
          ? 'border-primary bg-accent shadow-md'
          : 'border-border bg-card hover:border-muted-foreground/30 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`rounded-lg flex items-center justify-center shrink-0 ${
            large ? 'h-11 w-11' : 'h-9 w-9'
          } ${
            selected
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground'
          }`}
        >
          <Icon className={large ? 'w-5 h-5' : 'w-4 h-4'} />
        </div>
        <div>
          <span className={`font-semibold text-foreground block ${large ? 'text-base' : 'text-sm'}`}>
            {schema.name}
          </span>
          <span className="text-[11px] text-muted-foreground">{DESCRIPTIONS[schemaKey]}</span>
        </div>
      </div>
    </button>
  )
}

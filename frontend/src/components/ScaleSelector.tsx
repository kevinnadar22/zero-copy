import { SCALE_OPTIONS } from '@/lib/types'

interface Props {
  value: number
  onChange: (v: number) => void
  disabled: boolean
  large?: boolean
}

export function ScaleSelector({ value, onChange, disabled, large }: Props) {
  return (
    <div>
      <label className={`font-medium text-foreground mb-3 block ${large ? 'text-base' : 'text-sm'}`}>
        How many records?
      </label>
      <div className="grid grid-cols-3 gap-2">
        {SCALE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`rounded-lg font-mono font-bold transition-all duration-150 cursor-pointer border ${
              large ? 'py-3 text-base' : 'py-2 text-sm'
            } ${
              value === opt.value
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-secondary-foreground border-border hover:bg-accent hover:text-accent-foreground'
            } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

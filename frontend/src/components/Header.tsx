import { Binary } from 'lucide-react'

export function Header({ connected }: { connected: boolean }) {
  return (
    <header className="border-b border-border bg-card px-8 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
          <Binary className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">Zero-Copy Benchmark</h1>
          <p className="text-xs text-muted-foreground">Binary transport performance analysis</p>
        </div>
      </div>
      <div className="flex items-center gap-2.5 text-sm">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-destructive'}`} />
        <span className="text-muted-foreground text-xs">{connected ? 'Live' : 'Offline'}</span>
      </div>
    </header>
  )
}

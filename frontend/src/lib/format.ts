export function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toFixed(0)
}

export function formatBytes(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + ' GB'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + ' MB'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + ' KB'
  return n.toFixed(0) + ' B'
}

export function formatDuration(s: number): string {
  if (s >= 60) return (s / 60).toFixed(1) + 'm'
  if (s >= 1) return s.toFixed(2) + 's'
  return (s * 1000).toFixed(1) + 'ms'
}

export function formatCount(n: number): string {
  return n.toLocaleString()
}

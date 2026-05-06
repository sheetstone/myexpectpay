interface TrendChartProps {
  data: number[]
  height?: number
  color?: string
}

export function TrendChart({ data, height = 120, color = 'var(--color-primary)' }: TrendChartProps) {
  if (!data || data.length < 2) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
        No activity data
      </div>
    )
  }

  const W = 600
  const H = height
  const P = 8
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const pts = data.map((v, i) => {
    const x = P + (i / (data.length - 1)) * (W - P * 2)
    const y = P + (1 - (v - min) / range) * (H - P * 2)
    return [x, y] as [number, number]
  })

  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
  const last = pts[pts.length - 1]
  const first = pts[0]
  const area = `${line} L${last[0]},${H - P} L${first[0]},${H - P} Z`
  const gradId = `trendG-${Math.random().toString(36).slice(2)}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block', width: '100%', height }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 4 : 2} fill={color} />
      ))}
    </svg>
  )
}

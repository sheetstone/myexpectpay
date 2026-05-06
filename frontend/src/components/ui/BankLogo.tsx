import type { CSSProperties } from 'react'

const BANK_COLORS: Record<string, string> = {
  chase:           '#1e3a8a',
  wells:           '#b91c1c',
  'bank of':       '#991b1b',
  'capital one':   '#0f766e',
  pnc:             '#d97706',
  citi:            '#1d4ed8',
  'us bank':       '#1e40af',
  'td bank':       '#15803d',
  'first national':'#1f4e79',
  'first republic':'#1f4e79',
  regions:         '#1e40af',
  suntrust:        '#0f766e',
  ally:            '#6d28d9',
  discover:        '#b45309',
  'navy federal':  '#1e3a8a',
}

const PALETTE = ['#1f4e79','#1e3a8a','#991b1b','#0f766e','#d97706','#6d28d9','#1d4ed8','#15803d','#b45309','#0369a1']

function deriveColor(bankName: string): string {
  const lower = bankName.toLowerCase()
  for (const [key, color] of Object.entries(BANK_COLORS)) {
    if (lower.includes(key)) return color
  }
  const hash = bankName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return PALETTE[hash % PALETTE.length]
}

function deriveAbbr(bankName: string): string {
  const words = bankName.trim().split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

const SIZE_PX: Record<string, number> = { sm: 28, md: 36, lg: 48 }
const FONT_PX: Record<string, number> = { sm: 11, md: 13, lg: 16 }

interface BankLogoProps {
  bankName: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  style?: CSSProperties
}

export function BankLogo({ bankName, size = 'md', className, style }: BankLogoProps) {
  const px = SIZE_PX[size]
  const fp = FONT_PX[size]
  const color = deriveColor(bankName)
  const abbr = deriveAbbr(bankName)

  return (
    <div
      className={className}
      style={{
        width: px, height: px,
        borderRadius: 6,
        background: color,
        color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: fp, fontWeight: 700,
        flexShrink: 0,
        ...style,
      }}
      aria-hidden="true"
    >
      {abbr}
    </div>
  )
}

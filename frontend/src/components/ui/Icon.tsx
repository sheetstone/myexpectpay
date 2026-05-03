import type { ComponentProps, ElementType } from 'react'

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const sizeMap: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
}

interface IconProps extends ComponentProps<'svg'> {
  as: ElementType
  size?: IconSize
  label?: string
}

export function Icon({ as: HeroIcon, size = 'md', label, ...rest }: IconProps) {
  const px = sizeMap[size]
  return (
    <HeroIcon
      width={px}
      height={px}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      {...rest}
    />
  )
}

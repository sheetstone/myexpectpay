import { useDisclosure } from './useDisclosure'

export function usePasswordToggle() {
  const { isOpen: visible, toggle } = useDisclosure(false)
  return { visible, toggle, inputType: visible ? ('text' as const) : ('password' as const) }
}

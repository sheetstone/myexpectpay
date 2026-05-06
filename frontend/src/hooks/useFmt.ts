import { useIntl } from 'react-intl'

export function useFmt() {
  const intl = useIntl()
  return (id: string, values?: Record<string, string | number | boolean>) =>
    intl.formatMessage({ id }, values)
}

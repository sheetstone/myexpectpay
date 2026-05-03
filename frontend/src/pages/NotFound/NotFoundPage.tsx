import { Link } from 'react-router-dom'
import { useIntl } from 'react-intl'

export function NotFoundPage() {
  const intl = useIntl()
  return (
    <main style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
      <h1 style={{ fontSize: 'var(--text-4xl)', color: 'var(--color-text-heading)' }}>404</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
        {intl.formatMessage({ id: 'notFound.title' })}
      </p>
      <Link
        to="/"
        style={{
          color: 'var(--color-primary)',
          fontWeight: 'var(--weight-medium)',
          textDecoration: 'none',
        }}
      >
        {intl.formatMessage({ id: 'notFound.back' })}
      </Link>
    </main>
  )
}

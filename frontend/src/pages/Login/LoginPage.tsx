import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useIntl } from 'react-intl'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../../components/ui'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail } = useAuth()
  const intl = useIntl()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [mode, setMode] = useState<'options' | 'email'>('options')

  if (loading) return <Spinner fullScreen />
  if (user) return <Navigate to="/" replace />

  async function handleGoogle() {
    setError('')
    try { await signInWithGoogle() } catch { setError(intl.formatMessage({ id: 'common.error' })) }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signInWithEmail(email, password)
    } catch {
      setError(intl.formatMessage({ id: 'common.error' }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.logoMark} aria-hidden>
          <span className={styles.logoBar} />
          <span className={styles.logoBar} />
          <span className={styles.logoBar} />
          <span className={styles.logoBar} />
        </div>
        <h1 className={styles.title}>{intl.formatMessage({ id: 'auth.welcome' })}</h1>

        {error && <p className={styles.error}>{error}</p>}

        {mode === 'options' && (
          <div className={styles.options}>
            <button className={styles.googleBtn} onClick={() => void handleGoogle()}>
              {intl.formatMessage({ id: 'auth.signInWithGoogle' })}
            </button>
            <button className={styles.emailBtn} onClick={() => setMode('email')}>
              {intl.formatMessage({ id: 'auth.signInWithEmail' })}
            </button>
          </div>
        )}

        {mode === 'email' && (
          <form className={styles.form} onSubmit={(e) => void handleEmail(e)}>
            <label className={styles.label}>
              {intl.formatMessage({ id: 'auth.email' })}
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </label>
            <label className={styles.label}>
              {intl.formatMessage({ id: 'auth.password' })}
              <input
                type="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? <Spinner /> : intl.formatMessage({ id: 'auth.signIn' })}
            </button>
            <button type="button" className={styles.backBtn} onClick={() => setMode('options')}>
              ← {intl.formatMessage({ id: 'common.cancel' })}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

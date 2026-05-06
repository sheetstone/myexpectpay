import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../../components/ui'
import { IconAlertCircle, IconCheck, IconLock, IconShield, IconMail } from '../../components/ui/icons'
import { useFmt, useServerError } from '../../hooks'
import { BrandPanel } from './BrandPanel'
import styles from './LoginPage.module.css'

interface ForgotFields {
  email: string
}

function buildSchema(fmt: (id: string) => string) {
  return yup.object({
    email: yup.string().required(fmt('auth.email')).email(fmt('auth.email')),
  })
}

export function ForgotPasswordPage() {
  const { user, loading } = useAuth()
  const fmt = useFmt()
  const { error: serverError, setError: setServerError } = useServerError()
  const [successEmail, setSuccessEmail] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotFields>({
    resolver: yupResolver(buildSchema(fmt)),
  })

  if (loading) return <Spinner fullScreen />
  if (user) return <Navigate to="/" replace />

  async function onSubmit({ email }: ForgotFields) {
    setServerError('')
    try {
      await sendPasswordResetEmail(auth, email)
      setSuccessEmail(email)
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      if (code === 'auth/user-not-found') {
        setServerError(fmt('auth.userNotFound'))
      } else {
        setServerError(fmt('common.error'))
      }
    }
  }

  return (
    <div className={styles.page}>
      <BrandPanel />

      <div className={styles.formSide}>
        <div className={styles.formSideTop}>
          <span>Remembered it?</span>
          <Link to="/login">Sign in</Link>
        </div>

        <div className={styles.formWrap}>
          <div className={styles.formInner}>
            {successEmail ? (
              <SuccessState email={successEmail} onRetry={() => setSuccessEmail('')} />
            ) : (
              <>
                <div className={styles.formIconWrap}>
                  <IconMail />
                </div>

                <h1 className={styles.formTitle}>Forgot your password?</h1>
                <p className={styles.formSub}>
                  Enter the email address on your account and we'll send a reset link straight to your inbox.
                </p>

                {serverError && (
                  <div className={styles.alert} role="alert">
                    <span className={styles.alertIcon}><IconAlertCircle /></span>
                    <div>
                      <div className={styles.alertTitle}>Could not send reset link</div>
                      <div>{serverError}</div>
                    </div>
                  </div>
                )}

                <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel} htmlFor="email">
                      {fmt('auth.email')}
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className={`${styles.input}${errors.email ? ` ${styles.inputError}` : ''}`}
                      autoComplete="email"
                      autoFocus
                      {...register('email')}
                    />
                    {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                    {isSubmitting
                      ? <><span className={styles.btnSpinner} /> Sending…</>
                      : fmt('auth.sendResetLink')}
                  </button>
                </form>

                <p className={styles.formFoot}>
                  <Link to="/login" className={styles.forgotLink}>← Back to sign in</Link>
                </p>

                <div className={styles.trust}>
                  <span className={styles.trustItem}><IconLock /> 256-bit SSL</span>
                  <span className={styles.trustItem}><IconShield /> SOC 2 Type II</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SuccessState({ email, onRetry }: { email: string; onRetry: () => void }) {
  return (
    <div className={styles.successWrap}>
      <div className={styles.successIconRing}>
        <IconCheck className={styles.successIconSvg} />
      </div>

      <h1 className={styles.formTitle} style={{ textAlign: 'center' }}>Check your inbox</h1>
      <p className={styles.formSub} style={{ textAlign: 'center' }}>
        We sent a password reset link to<br />
        <strong style={{ color: 'var(--color-text-heading)' }}>{email}</strong>
      </p>

      <p className={styles.successHint}>
        Didn't get it? Check your spam folder, or{' '}
        <button type="button" className={styles.inlineBtn} onClick={onRetry}>
          try a different address
        </button>.
      </p>

      <Link to="/login" className={styles.submitBtn} style={{ textDecoration: 'none', textAlign: 'center' }}>
        Back to sign in
      </Link>
    </div>
  )
}

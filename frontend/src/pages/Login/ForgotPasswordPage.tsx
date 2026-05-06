import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../../components/ui'
import { useFmt, useServerError } from '../../hooks'
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
    <div className={styles.root}>
      <div className={styles.hero} aria-hidden="true">
        <div className={styles.cards}>
          <div className={`${styles.card} ${styles.card1}`}>{fmt('auth.feature1')}</div>
          <div className={`${styles.card} ${styles.card2}`}>{fmt('auth.feature2')}</div>
          <div className={`${styles.card} ${styles.card3}`}>{fmt('auth.feature3')}</div>
        </div>
      </div>

      <div className={styles.loginSide}>
        <div className={styles.loginBox}>
          <div className={styles.loginBoxHeader}>{fmt('auth.forgotPasswordTitle')}</div>
          <div className={styles.loginBoxBody}>
            {successEmail ? (
              <SuccessState email={successEmail} fmt={fmt} />
            ) : (
              <>
                <p className={styles.welcome} style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-normal)' }}>
                  {fmt('auth.forgotPasswordDesc')}
                </p>

                {serverError && <p className={styles.error} role="alert">{serverError}</p>}

                <form className={styles.form} onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
                  <label className={styles.label}>
                    {fmt('auth.email')}
                    <input
                      type="email"
                      className={`${styles.input}${errors.email ? ` ${styles.inputError}` : ''}`}
                      autoComplete="email"
                      autoFocus
                      {...register('email')}
                    />
                    {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
                  </label>

                  <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                    {isSubmitting ? <Spinner /> : fmt('auth.sendResetLink')}
                  </button>
                </form>

                <p className={styles.switchPrompt}>
                  <Link to="/login" className={styles.switchLink}>{fmt('auth.backToLogin')}</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SuccessState({ email, fmt }: { email: string; fmt: (id: string, v?: Record<string, string>) => string }) {
  return (
    <>
      <p style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--color-success)' }}>
        {fmt('auth.checkYourEmail')}
      </p>
      <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
        {fmt('auth.checkYourEmailDesc', { email })}
      </p>
      <p style={{ margin: 0, textAlign: 'center' }}>
        <Link to="/login" className={styles.switchLink} style={{ fontSize: 'var(--text-sm)' }}>
          {fmt('auth.backToLogin')}
        </Link>
      </p>
    </>
  )
}

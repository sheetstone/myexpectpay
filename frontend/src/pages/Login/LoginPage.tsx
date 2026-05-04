import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useIntl } from 'react-intl'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../../components/ui'
import { ApiError } from '../../api/client'
import styles from './LoginPage.module.css'

interface LoginFields {
  email: string
  password: string
}

function buildSchema(fmt: (id: string) => string) {
  return yup.object({
    email: yup.string().required(fmt('auth.email')).email(fmt('auth.email')),
    password: yup.string().required(fmt('auth.password')),
  })
}

export function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail } = useAuth()
  const intl = useIntl()
  const fmt = (id: string) => intl.formatMessage({ id })
  const [serverError, setServerError] = useState('')
  const [googleBusy, setGoogleBusy] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFields>({
    resolver: yupResolver(buildSchema(fmt)),
  })

  if (loading) return <Spinner fullScreen />
  if (user) return <Navigate to="/" replace />

  async function handleGoogle() {
    setServerError('')
    setGoogleBusy(true)
    try {
      await signInWithGoogle()
    } catch {
      setServerError(fmt('common.error'))
      setGoogleBusy(false)
    }
  }

  async function onSubmit({ email, password }: LoginFields) {
    setServerError('')
    try {
      await signInWithEmail(email, password)
    } catch (err) {
      const code = err instanceof ApiError ? String(err.status) : (err as { code?: string }).code ?? ''
      if (code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setServerError(fmt('auth.wrongCredentials'))
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
          <div className={styles.loginBoxHeader}>{fmt('auth.signIn')}</div>
          <div className={styles.loginBoxBody}>
            <h2 className={styles.welcome}>{fmt('auth.welcome')}</h2>

            {serverError && <p className={styles.error} role="alert">{serverError}</p>}

            <button
              type="button"
              className={styles.googleBtn}
              onClick={() => void handleGoogle()}
              disabled={googleBusy}
            >
              {googleBusy ? <Spinner /> : (
                <>
                  <GoogleIcon />
                  {fmt('auth.signInWithGoogle')}
                </>
              )}
            </button>

            <div className={styles.orRow}>
              <span className={styles.orLine} />
              <span className={styles.orText}>{fmt('auth.orSeparator')}</span>
              <span className={styles.orLine} />
            </div>

            <form className={styles.form} onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
              <label className={styles.label}>
                {fmt('auth.email')}
                <input
                  type="email"
                  className={`${styles.input}${errors.email ? ` ${styles.inputError}` : ''}`}
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
              </label>

              <label className={styles.label}>
                {fmt('auth.password')}
                <input
                  type="password"
                  className={`${styles.input}${errors.password ? ` ${styles.inputError}` : ''}`}
                  autoComplete="current-password"
                  {...register('password')}
                />
                {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
              </label>

              <div className={styles.formFooter}>
                <Link to="/forgot-password" className={styles.forgotLink}>{fmt('auth.forgotPassword')}</Link>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? <Spinner /> : fmt('auth.signIn')}
              </button>
            </form>

            <p className={styles.switchPrompt}>
              {fmt('auth.newUser')}{' '}
              <Link to="/register" className={styles.switchLink}>{fmt('auth.signUp')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z"/>
    </svg>
  )
}
